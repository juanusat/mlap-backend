-- ====================================================================
-- SECUENCIA
-- Propósito: Generar IDs únicos para la tabla 'reservation_requirement'
-- ya que su columna 'id' es INTEGER NOT NULL y no SERIAL.
-- ====================================================================
CREATE SEQUENCE IF NOT EXISTS public.reservation_requirement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- ====================================================================
-- FUNCIÓN DE TRIGGER
-- Propósito: Copia los requisitos base (diócesis) y de capilla
--            a la tabla 'reservation_requirement'
--            cuando se crea una nueva reserva.
-- ====================================================================
CREATE OR REPLACE FUNCTION public.copy_requirements_to_reservation()
RETURNS TRIGGER AS $$
DECLARE
    v_chapel_event_id INTEGER;
    v_event_id INTEGER;
BEGIN
    -- 1. Obtener los IDs clave (chapel_event_id y event_id)
    --    basados en la variante de evento de la nueva reserva.
    SELECT
        ev.chapel_event_id,
        ce.event_id
    INTO
        v_chapel_event_id,
        v_event_id
    FROM
        public.event_variant ev
    JOIN
        public.chapel_event ce ON ev.chapel_event_id = ce.id
    WHERE
        ev.id = NEW.event_variant_id;

    -- Si por alguna razón no se encuentran (datos corruptos/incompletos),
    -- simplemente salimos.
    IF NOT FOUND THEN
        RAISE WARNING 'No se encontró chapel_event o event para event_variant_id %', NEW.event_variant_id;
        RETURN NEW;
    END IF;

    -- 2. Insertar los requisitos base (de la diócesis)
    --    asociados al 'event' base.
    INSERT INTO public.reservation_requirement (
        id, -- <-- CORRECCIÓN: Añadido ID
        reservation_id,
        base_requirement_id,
        chapel_requirement_id,
        name,
        description,
        completed
    )
    SELECT
        nextval('public.reservation_requirement_id_seq'), -- <-- CORRECCIÓN: Usar la secuencia
        NEW.id,           -- ID de la nueva reserva
        br.id,            -- ID del requisito base
        NULL,             -- Es un requisito base, no de capilla
        br.name,          -- Copia del nombre
        br.description,   -- Copia de la descripción
        FALSE             -- Por defecto no está completado
    FROM
        public.base_requirement br
    WHERE
        br.event_id = v_event_id
        AND br.active = TRUE;

    -- 3. Insertar los requisitos adicionales (de la capilla)
    --    asociados al 'chapel_event'.
    INSERT INTO public.reservation_requirement (
        id, -- <-- CORRECCIÓN: Añadido ID
        reservation_id,
        base_requirement_id,
        chapel_requirement_id,
        name,
        description,
        completed
    )
    SELECT
        nextval('public.reservation_requirement_id_seq'), -- <-- CORRECCIÓN: Usar la secuencia
        NEW.id,           -- ID de la nueva reserva
        NULL,             -- Es un requisito de capilla, no base
        cer.id,           -- ID del requisito de capilla
        cer.name,         -- Copia del nombre
        cer.description,  -- Copia de la descripción
        FALSE             -- Por defecto no está completado
    FROM
        public.chapel_event_requirement cer
    WHERE
        cer.chapel_event_id = v_chapel_event_id
        AND cer.active = TRUE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- CREACIÓN DEL TRIGGER
-- Se ejecuta después de cada inserción en la tabla 'reservation'
-- ====================================================================
CREATE TRIGGER trg_after_insert_reservation
AFTER INSERT ON public.reservation
FOR EACH ROW
EXECUTE FUNCTION public.copy_requirements_to_reservation();


-- Obtener el horario general y las excepciones (específico) de una capilla dada su ID.
CREATE OR REPLACE FUNCTION public.get_chapel_schedule (p_chapel_id INTEGER)
RETURNS TABLE (
    tipo_horario VARCHAR,
    dia VARCHAR,
    fecha DATE,
    hora_inicio TIME,
    hora_fin TIME,
    razon_o_estado TEXT
)
LANGUAGE sql
AS $$
WITH combined_schedule AS (
    -- 1. Horario General (Recurrente)
    SELECT
        'GENERAL' AS tipo_horario,
        CASE gs.day_of_week
            WHEN 0 THEN 'Domingo'
            WHEN 1 THEN 'Lunes'
            WHEN 2 THEN 'Martes'
            WHEN 3 THEN 'Miércoles'
            WHEN 4 THEN 'Jueves'
            WHEN 5 THEN 'Viernes'
            WHEN 6 THEN 'Sábado'
        END AS dia,
        NULL::DATE AS fecha,
        gs.start_time AS hora_inicio,
        gs.end_time AS hora_fin,
        'Abierto (Recurrente)' AS razon_o_estado
    FROM
        public.general_schedule gs
    WHERE
        gs.chapel_id = p_chapel_id

    UNION ALL

    -- 2. Horario Específico (Excepciones)
    SELECT
        'ESPECÍFICO' AS tipo_horario,
        to_char(ss.date, 'Day') AS dia,
        ss.date AS fecha,
        ss.start_time AS hora_inicio,
        ss.end_time AS hora_fin,
        CASE ss.exception_type
            WHEN 'OPEN' THEN 'Abierto (Excepción)'
            WHEN 'CLOSED' THEN 'Cerrado: ' || COALESCE(ss.reason, 'Sin especificar')
        END AS razon_o_estado
    FROM
        public.specific_schedule ss
    WHERE
        ss.chapel_id = p_chapel_id
)
SELECT 
    cs.tipo_horario,
    cs.dia,
    cs.fecha,
    cs.hora_inicio,
    cs.hora_fin,
    cs.razon_o_estado
FROM
    combined_schedule cs
ORDER BY
    cs.fecha NULLS FIRST, -- Las reglas generales primero
    CASE cs.tipo_horario 
        WHEN 'GENERAL' THEN 
            CASE cs.dia 
                WHEN 'Domingo' THEN 0 
                WHEN 'Lunes' THEN 1 
                WHEN 'Martes' THEN 2 
                WHEN 'Miércoles' THEN 3 
                WHEN 'Jueves' THEN 4 
                WHEN 'Viernes' THEN 5 
                WHEN 'Sábado' THEN 6 
            END 
        ELSE EXTRACT(DOW FROM cs.fecha) 
    END, -- Ordena por el día de la semana o fecha
    cs.hora_inicio;
$$;

COMMENT ON TRIGGER trg_after_insert_reservation ON public.reservation 
IS 'Copia los requisitos base y de capilla a la tabla reservation_requirement cuando se crea una nueva reserva.';

CREATE OR REPLACE FUNCTION public.notify_diocese_parish_activation() 
RETURNS TRIGGER AS $$
DECLARE
    rec_user RECORD;
BEGIN
    FOR rec_user IN 
        SELECT id FROM public."user" WHERE is_diocese = TRUE AND active = TRUE 
    LOOP
        INSERT INTO public.notification (user_id, title, body)
        VALUES (
            rec_user.id, 
            'Nueva Parroquia Activada', 
            'Sistema: La Parroquia ' || NEW.name || ' ha sido activada y ya puede operar en la plataforma.'
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_notify_diocese_parish_activation
AFTER UPDATE OF active ON public.parish
FOR EACH ROW
WHEN (OLD.active = FALSE AND NEW.active = TRUE)
EXECUTE FUNCTION public.notify_diocese_parish_activation();

COMMENT ON TRIGGER trg_notify_diocese_parish_activation ON public.parish 
IS 'Genera una notificación para usuarios de la diócesis cuando el estado de una parroquia cambia a activo.';

CREATE OR REPLACE FUNCTION public.notify_diocese_new_chapel() 
RETURNS TRIGGER AS $$
DECLARE
    rec_user RECORD;
    v_parish_name VARCHAR(255);
BEGIN
    SELECT name INTO v_parish_name FROM public.parish WHERE id = NEW.parish_id;

    FOR rec_user IN 
        SELECT id FROM public."user" WHERE is_diocese = TRUE AND active = TRUE 
    LOOP
        INSERT INTO public.notification (user_id, title, body)
        VALUES (
            rec_user.id, 
            'Nueva Capilla Registrada', 
            'Infraestructura: La parroquia ' || COALESCE(v_parish_name, 'Desconocida') || ' ha agregado una nueva capilla: ' || NEW.name || '.'
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_notify_diocese_new_chapel
AFTER INSERT ON public.chapel
FOR EACH ROW
EXECUTE FUNCTION public.notify_diocese_new_chapel();

COMMENT ON TRIGGER trg_notify_diocese_new_chapel ON public.chapel 
IS 'Genera una notificación para usuarios de la diócesis cada vez que se inserta una nueva capilla en el sistema.';

CREATE OR REPLACE FUNCTION public.notify_worker_association_event() 
RETURNS TRIGGER AS $$
DECLARE
    v_parish_name VARCHAR(255);
BEGIN
    SELECT name INTO v_parish_name FROM public.parish WHERE id = NEW.parish_id;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.notification (user_id, title, body)
        VALUES (
            NEW.user_id, 
            'Vinculación a Parroquia', 
            'Bienvenido: Has sido vinculado como personal de la parroquia ' || v_parish_name || '.'
        );
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.notification (user_id, title, body)
        VALUES (
            NEW.user_id, 
            'Desvinculación de Parroquia', 
            'Tu vinculación con la parroquia ' || v_parish_name || ' ha finalizado.'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_notify_worker_association_bind
AFTER INSERT ON public.association
FOR EACH ROW
WHEN (NEW.active = TRUE)
EXECUTE FUNCTION public.notify_worker_association_event();

COMMENT ON TRIGGER trg_notify_worker_association_bind ON public.association 
IS 'Notifica al usuario cuando ha sido vinculado (dado de alta) en una nueva parroquia.';

CREATE OR REPLACE TRIGGER trg_notify_worker_association_unbind
AFTER UPDATE ON public.association
FOR EACH ROW
WHEN (
    (OLD.active = TRUE AND NEW.active = FALSE) OR 
    (OLD.end_date IS NULL AND NEW.end_date IS NOT NULL)
)
EXECUTE FUNCTION public.notify_worker_association_event();

COMMENT ON TRIGGER trg_notify_worker_association_unbind ON public.association 
IS 'Notifica al usuario cuando su vinculación con una parroquia ha finalizado o ha sido desactivada.';

CREATE OR REPLACE FUNCTION public.notify_worker_role_event() 
RETURNS TRIGGER AS $$
DECLARE
    v_role_name VARCHAR(100);
    v_user_id INTEGER;
BEGIN
    SELECT name INTO v_role_name FROM public.role WHERE id = NEW.role_id;
    SELECT user_id INTO v_user_id FROM public.association WHERE id = NEW.association_id;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.notification (user_id, title, body)
        VALUES (
            v_user_id, 
            'Nuevo Rol Asignado', 
            'Permisos actualizados: Se te ha asignado el rol de ' || v_role_name || '.'
        );
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.notification (user_id, title, body)
        VALUES (
            v_user_id, 
            'Rol Revocado', 
            'Permisos actualizados: Ya no posees el rol de ' || v_role_name || ' en tu asignación actual.'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_notify_worker_role_assign
AFTER INSERT ON public.user_role
FOR EACH ROW
EXECUTE FUNCTION public.notify_worker_role_event();

COMMENT ON TRIGGER trg_notify_worker_role_assign ON public.user_role 
IS 'Notifica al trabajador cuando se le agrega un nuevo rol específico dentro de su asociación.';

CREATE OR REPLACE TRIGGER trg_notify_worker_role_revoke
AFTER UPDATE ON public.user_role
FOR EACH ROW
WHEN (OLD.revocation_date IS NULL AND NEW.revocation_date IS NOT NULL)
EXECUTE FUNCTION public.notify_worker_role_event();

COMMENT ON TRIGGER trg_notify_worker_role_revoke ON public.user_role 
IS 'Notifica al trabajador cuando uno de sus roles ha sido revocado (fecha de revocación establecida).';

CREATE OR REPLACE FUNCTION public.notify_parish_admin_reservation_ops() 
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id INTEGER;
    v_event_name VARCHAR(255);
    v_variant_name VARCHAR(255);
    v_max_capacity INTEGER;
    v_current_count INTEGER;
    v_user_name VARCHAR(100);
BEGIN
    SELECT 
        p.admin_user_id, 
        e.name, 
        ev.name, 
        ev.max_capacity
    INTO 
        v_admin_id, 
        v_event_name, 
        v_variant_name, 
        v_max_capacity
    FROM public.event_variant ev
    JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
    JOIN public.event e ON ce.event_id = e.id
    JOIN public.chapel c ON ce.chapel_id = c.id
    JOIN public.parish p ON c.parish_id = p.id
    WHERE ev.id = NEW.event_variant_id;

    SELECT username INTO v_user_name FROM public."user" WHERE id = NEW.user_id;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.notification (user_id, title, body)
        VALUES (
            v_admin_id, 
            'Nueva Solicitud de Reserva', 
            'Nueva solicitud pendiente: ' || v_user_name || ' desea reservar para ' || v_event_name || ' (' || v_variant_name || ') el ' || NEW.event_date || '.'
        );

        SELECT COUNT(*) INTO v_current_count 
        FROM public.reservation 
        WHERE event_variant_id = NEW.event_variant_id 
          AND status NOT IN ('REJECTED', 'CANCELLED');

        IF (v_current_count >= v_max_capacity) THEN
            INSERT INTO public.notification (user_id, title, body)
            VALUES (
                v_admin_id, 
                'Evento con Cupo Completo', 
                'Aviso de capacidad: El evento ' || v_variant_name || ' (' || v_event_name || ') ha completado sus ' || v_max_capacity || ' cupos disponibles.'
            );
        END IF;

    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.notification (user_id, title, body)
        VALUES (
            v_admin_id, 
            'Cancelación por el Usuario', 
            'Atención: La reserva de ' || v_user_name || ' para ' || v_event_name || ' ha sido cancelada por el feligrés.'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_notify_parish_admin_new_reservation
AFTER INSERT ON public.reservation
FOR EACH ROW
EXECUTE FUNCTION public.notify_parish_admin_reservation_ops();

COMMENT ON TRIGGER trg_notify_parish_admin_new_reservation ON public.reservation 
IS 'Notifica al párroco cuando ingresa una nueva reserva y verifica si el evento alcanzó su capacidad máxima.';

CREATE OR REPLACE TRIGGER trg_notify_parish_admin_cancel_reservation
AFTER UPDATE ON public.reservation
FOR EACH ROW
WHEN (OLD.status != 'CANCELLED' AND NEW.status = 'CANCELLED')
EXECUTE FUNCTION public.notify_parish_admin_reservation_ops();

COMMENT ON TRIGGER trg_notify_parish_admin_cancel_reservation ON public.reservation 
IS 'Notifica al párroco cuando un usuario cancela su propia reserva.';

CREATE OR REPLACE FUNCTION public.notify_parish_admin_schedule_ops() 
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id INTEGER;
    v_chapel_name VARCHAR(255);
BEGIN
    SELECT p.admin_user_id, c.name 
    INTO v_admin_id, v_chapel_name
    FROM public.chapel c
    JOIN public.parish p ON c.parish_id = p.id
    WHERE c.id = NEW.chapel_id;

    INSERT INTO public.notification (user_id, title, body)
    VALUES (
        v_admin_id, 
        'Cierre Excepcional de Capilla', 
        'Recordatorio: Se ha configurado el cierre de la capilla ' || v_chapel_name || ' para la fecha ' || NEW.date || '.'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_notify_parish_admin_chapel_closed
AFTER INSERT ON public.specific_schedule
FOR EACH ROW
WHEN (NEW.exception_type = 'CLOSED')
EXECUTE FUNCTION public.notify_parish_admin_schedule_ops();

COMMENT ON TRIGGER trg_notify_parish_admin_chapel_closed ON public.specific_schedule 
IS 'Notifica al párroco cuando se crea una excepción de horario tipo CERRADO en una de sus capillas.';


-- ====================================================================
-- 1. Función Principal para Cambios de Estado en Reservas (Aprobación, Rechazo, Reprogramación, Pagos)
-- ====================================================================
CREATE OR REPLACE FUNCTION public.notify_feligres_reservation_update() 
RETURNS TRIGGER AS $$
DECLARE
    v_event_name VARCHAR(255);
    v_old_date TEXT;
    v_new_date TEXT;
BEGIN
    -- Obtenemos el nombre del evento para el mensaje
    SELECT e.name INTO v_event_name
    FROM public.event_variant ev
    JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
    JOIN public.event e ON ce.event_id = e.id
    WHERE ev.id = NEW.event_variant_id;

    -- CASO A: Reserva Aprobada (Cambio de status a CONFIRMED o IN_PROGRESS)
    IF (OLD.status != NEW.status AND NEW.status IN ('CONFIRMED', 'IN_PROGRESS')) THEN
        INSERT INTO public.notification (user_id, title, body)
        VALUES (
            NEW.user_id, 
            'Reserva Aprobada', 
            '¡Buenas noticias! Tu reserva para ' || v_event_name || ' ha sido aceptada. Por favor revisa si tienes pagos o requisitos pendientes.'
        );
    END IF;

    -- CASO B: Reserva Rechazada
    IF (OLD.status != NEW.status AND NEW.status = 'REJECTED') THEN
        INSERT INTO public.notification (user_id, title, body)
        VALUES (
            NEW.user_id, 
            'Reserva Rechazada', 
            'Tu solicitud para ' || v_event_name || ' no ha podido ser aceptada en esta ocasión. Contacta con secretaría para más detalles.'
        );
    END IF;

    -- CASO C: Cambio de Fecha (Reprogramación)
    -- Detectamos si cambia event_date O reschedule_date
    IF (OLD.event_date IS DISTINCT FROM NEW.event_date) OR (OLD.reschedule_date IS DISTINCT FROM NEW.reschedule_date) THEN
        
        -- Determinar la fecha efectiva nueva
        v_new_date := COALESCE(TO_CHAR(NEW.reschedule_date, 'YYYY-MM-DD HH24:MI'), TO_CHAR(NEW.event_date, 'YYYY-MM-DD'));
        
        INSERT INTO public.notification (user_id, title, body)
        VALUES (
            NEW.user_id, 
            'Cambio de Fecha', 
            'Actualización importante: La fecha de tu evento ' || v_event_name || ' ha sido modificada para el día ' || v_new_date || '.'
        );
    END IF;

    -- CASO D: Pago Registrado (Incremento en paid_amount)
    IF (NEW.paid_amount > OLD.paid_amount) THEN
        INSERT INTO public.notification (user_id, title, body)
        VALUES (
            NEW.user_id, 
            'Pago Registrado', 
            'Se ha registrado exitosamente un abono a tu reserva de ' || v_event_name || '. Monto actual pagado: ' || NEW.paid_amount || '.'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger único que maneja todas las actualizaciones de la reserva
CREATE OR REPLACE TRIGGER trg_notify_feligres_reservation_update
AFTER UPDATE ON public.reservation
FOR EACH ROW
EXECUTE FUNCTION public.notify_feligres_reservation_update();

COMMENT ON TRIGGER trg_notify_feligres_reservation_update ON public.reservation 
IS 'Notifica al feligrés sobre Aprobaciones, Rechazos, Reprogramaciones y Pagos en su reserva.';


-- ====================================================================
-- 2. Notificación de Recepción de Solicitud (INSERT)
-- ====================================================================
CREATE OR REPLACE FUNCTION public.notify_feligres_reservation_received() 
RETURNS TRIGGER AS $$
DECLARE
    v_event_name VARCHAR(255);
BEGIN
    SELECT e.name INTO v_event_name
    FROM public.event_variant ev
    JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
    JOIN public.event e ON ce.event_id = e.id
    WHERE ev.id = NEW.event_variant_id;

    INSERT INTO public.notification (user_id, title, body)
    VALUES (
        NEW.user_id, 
        'Solicitud Recibida', 
        'Hemos recibido tu solicitud de reserva para ' || v_event_name || '. Te notificaremos cuando sea revisada.'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_notify_feligres_reservation_insert
AFTER INSERT ON public.reservation
FOR EACH ROW
EXECUTE FUNCTION public.notify_feligres_reservation_received();

COMMENT ON TRIGGER trg_notify_feligres_reservation_insert ON public.reservation 
IS 'Envía un acuse de recibo inmediato al usuario cuando crea una solicitud de reserva.';


-- ====================================================================
-- 3. Notificación de Requisito Validado
-- ====================================================================
CREATE OR REPLACE FUNCTION public.notify_feligres_requirement_completed() 
RETURNS TRIGGER AS $$
DECLARE
    v_user_id INTEGER;
    v_req_name VARCHAR(255);
BEGIN
    -- Obtenemos el ID del usuario a través de la reserva vinculada
    SELECT r.user_id INTO v_user_id
    FROM public.reservation r
    WHERE r.id = NEW.reservation_id;

    v_req_name := NEW.name;

    INSERT INTO public.notification (user_id, title, body)
    VALUES (
        v_user_id, 
        'Requisito Validado', 
        'El documento ''' || v_req_name || ''' ha sido revisado y aprobado correctamente por la parroquia.'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_notify_feligres_requirement_check
AFTER UPDATE ON public.reservation_requirement
FOR EACH ROW
WHEN (OLD.completed = FALSE AND NEW.completed = TRUE)
EXECUTE FUNCTION public.notify_feligres_requirement_completed();

COMMENT ON TRIGGER trg_notify_feligres_requirement_check ON public.reservation_requirement 
IS 'Notifica al usuario cuando un trabajador marca un requisito como completado.';

-- ====================================================================
-- FUNCIONES DE DEPURACIÓN Y CONSULTA
-- ====================================================================

-- Función para obtener todas las reservas de una capilla específica (p_chapel_id), con formato de fecha y hora estándar.
CREATE OR REPLACE FUNCTION public.get_chapel_reservations (p_chapel_id INTEGER)
RETURNS TABLE (
    reserva_id INTEGER,
    nombre_persona TEXT,
    correo VARCHAR,
    fecha_evento DATE,
    hora_evento TIME,
    fecha_reprogramada TIMESTAMP,
    duracion_minutos INTEGER,
    requisitos_cumplidos BIGINT,
    monto_total DECIMAL(10, 2),
    monto_pagado DECIMAL(10, 2)
)
LANGUAGE sql
AS $$
SELECT
    r.id AS reserva_id,
    (per.first_names || ' ' || per.paternal_surname || COALESCE(' ' || per.maternal_surname, ''))::TEXT AS nombre_persona,
    per.email AS correo,
    
    r.event_date AS fecha_evento,
    r.event_time AS hora_evento,
    
    r.reschedule_date AS fecha_reprogramada,
    ev.duration_minutes AS duracion_minutos,
    
    (SELECT COUNT(*) 
     FROM public.reservation_requirement rr 
     WHERE rr.reservation_id = r.id AND rr.completed = TRUE) AS requisitos_cumplidos,
     
    ev.current_price AS monto_total,
    r.paid_amount AS monto_pagado
FROM
    public.reservation r
JOIN
    public.user u ON r.user_id = u.id
JOIN
    public.person per ON u.person_id = per.id
JOIN
    public.event_variant ev ON r.event_variant_id = ev.id
JOIN
    public.chapel_event ce ON ev.chapel_event_id = ce.id
WHERE
    ce.chapel_id = p_chapel_id
    AND r.status NOT IN ('CANCELLED', 'REJECTED')
ORDER BY
    r.event_date ASC, r.event_time ASC;
$$;


-- Trabajadores de una parroquia
CREATE OR REPLACE FUNCTION public.get_parish_workers (p_parish_id INTEGER)
RETURNS TABLE (
    worker_id INTEGER,
    full_name TEXT,
    association_id INTEGER
)
LANGUAGE sql
AS $$
SELECT
    u.id AS worker_id,
    (per.first_names || ' ' || per.paternal_surname || COALESCE(' ' || per.maternal_surname, ''))::TEXT AS full_name,
    a.id AS association_id
FROM
    public.association a
JOIN
    public.user u ON a.user_id = u.id
JOIN
    public.person per ON u.person_id = per.id
WHERE
    a.parish_id = p_parish_id
    AND a.active = TRUE
    AND u.active = TRUE
ORDER BY
    full_name;
$$;


-- Asociaciones de un trabajador
CREATE OR REPLACE FUNCTION public.get_worker_associations (p_user_id INTEGER)
RETURNS TABLE (
    parish_name VARCHAR,
    association_id INTEGER
)
LANGUAGE sql
AS $$
SELECT
    p.name AS parish_name,
    a.id AS association_id
FROM
    public.association a
JOIN
    public.parish p ON a.parish_id = p.id
WHERE
    a.user_id = p_user_id
    AND a.active = TRUE
ORDER BY
    p.name;
$$;


-- Roles de una asociación
CREATE OR REPLACE FUNCTION public.get_association_roles (p_association_id INTEGER)
RETURNS TABLE (
    role_name VARCHAR,
    user_role_id INTEGER
)
LANGUAGE sql
AS $$
SELECT
    r.name AS role_name,
    ur.id AS user_role_id
FROM
    public.user_role ur
JOIN
    public.role r ON ur.role_id = r.id
WHERE
    ur.association_id = p_association_id
    AND ur.revocation_date IS NULL
    AND r.active = TRUE
ORDER BY
    r.name;
$$;


-- Permisos de un rol asignado (user role)
CREATE OR REPLACE FUNCTION public.get_user_role_permissions (p_user_role_id INTEGER)
RETURNS TABLE (
    permission_code VARCHAR,
    permission_name VARCHAR,
    is_active BOOLEAN
)
LANGUAGE sql
AS $$
SELECT
    p.code AS permission_code,
    p.name AS permission_name,
    rp.granted AS is_active
FROM
    public.role_permission rp
JOIN
    public.permission p ON rp.permission_id = p.id
WHERE
    rp.role_id = (SELECT ur.role_id FROM public.user_role ur WHERE ur.id = p_user_role_id LIMIT 1)
    AND rp.revocation_date IS NULL
ORDER BY
    p.category, p.name;
$$;

-- Eventos ofrecidos por una parroquia
CREATE OR REPLACE FUNCTION public.get_parish_offered_events (p_parish_id INTEGER)
RETURNS TABLE (
    id_evento_variante INTEGER,
    nombre VARCHAR,
    nombre_evento_diocesis VARCHAR,
    capilla VARCHAR,
    limite_personas INTEGER,
    monto DECIMAL(10, 2)
)
LANGUAGE sql
AS $$
SELECT
    ev.id AS id_evento_variante,
    ev.name AS nombre,
    e.name AS nombre_evento_diocesis,
    c.name AS capilla,
    ev.max_capacity AS limite_personas,
    ev.current_price AS monto
FROM
    public.event_variant ev
JOIN
    public.chapel_event ce ON ev.chapel_event_id = ce.id
JOIN
    public.event e ON ce.event_id = e.id
JOIN
    public.chapel c ON ce.chapel_id = c.id
WHERE
    c.parish_id = p_parish_id
    AND ev.active = TRUE
    AND ce.active = TRUE
ORDER BY
    c.name, e.name, ev.name;
$$;