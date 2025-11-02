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