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

-- Función para obtener todas las reservas de una parroquia (p_parish_id), ordenadas por la más próxima.
CREATE OR REPLACE FUNCTION public.get_parish_reservations (p_parish_id INTEGER)
RETURNS TABLE (
    reserva_id INTEGER,
    nombre_persona TEXT,
    correo VARCHAR,
    para_cuando TEXT,
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
    to_char(r.event_date, 'TMDy, DD "de" TMMonth "de" YYYY') || ' a las ' || to_char(r.event_time, 'HH12:MI AM') AS para_cuando,
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
JOIN
    public.chapel c ON ce.chapel_id = c.id
WHERE
    c.parish_id = p_parish_id
    AND r.status NOT IN ('CANCELLED', 'REJECTED')
ORDER BY
    r.event_date ASC, r.event_time ASC;
$$;