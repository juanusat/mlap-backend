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