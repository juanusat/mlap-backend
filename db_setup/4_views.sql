-- Creación de la vista para obtener el listado de capillas, eventos y detalles de la parroquia.
CREATE OR REPLACE VIEW public.vw_parish_chapel_event_summary AS
SELECT
    p.name AS parish_name,
    per.first_names || ' ' || per.paternal_surname AS parish_admin_name,
    per.email AS parish_admin_email,
    c.name AS chapel_name,
    c.id AS chapel_id,
    COUNT(DISTINCT ce.event_id) AS total_events_offered,
    CASE WHEN EXISTS (
        SELECT 1
        FROM public.general_schedule gs
        WHERE gs.chapel_id = c.id
    ) THEN TRUE ELSE FALSE END AS has_general_schedule,
    CASE WHEN EXISTS (
        SELECT 1
        FROM public.specific_schedule ss
        WHERE ss.chapel_id = c.id
    ) THEN TRUE ELSE FALSE END AS has_specific_schedule,
    COALESCE(SUM(CASE WHEN r.status IN ('RESERVED', 'IN_PROGRESS', 'FULFILLED', 'COMPLETED') THEN 1 ELSE 0 END), 0) AS confirmed_reservations_count
FROM
    public.chapel c
JOIN
    public.parish p ON c.parish_id = p.id
JOIN
    public.user u ON p.admin_user_id = u.id
JOIN
    public.person per ON u.person_id = per.id
LEFT JOIN
    public.chapel_event ce ON c.id = ce.chapel_id AND ce.active = TRUE
LEFT JOIN
    public.event_variant ev ON ce.id = ev.chapel_event_id
LEFT JOIN
    public.reservation r ON ev.id = r.event_variant_id
GROUP BY
    p.name,
    per.first_names,
    per.paternal_surname,
    per.email,
    c.name,
    c.id
ORDER BY
    total_events_offered DESC,
    confirmed_reservations_count DESC;
COMMENT ON VIEW public.vw_parish_chapel_event_summary IS 'Resumen de cada capilla con su parroquia, la información del párroco, la cantidad de eventos que ofrecen y el total de reservas confirmadas.';


-- Creación de la vista para obtener el detalle completo de las reservas.
CREATE OR REPLACE VIEW public.vw_reservation_details AS
SELECT
    p.email AS user_email,
    CONCAT(p.first_names, ' ', p.paternal_surname, ' ', COALESCE(p.maternal_surname, '')) AS user_full_name,
    r.id AS reservation_id,
    r.event_date AS event_date,
    r.event_time AS event_time,
    r.status AS reservation_status,
    ev.name AS variant_name,
    e.name AS base_event_name,
    c.id AS chapel_id,
    c.name AS chapel_name,
    pa.id AS parish_id,
    pa.name AS parish_name
FROM
    public.reservation r
    INNER JOIN public.user u ON r.user_id = u.id
    INNER JOIN public.person p ON u.person_id = p.id
    INNER JOIN public.event_variant ev ON r.event_variant_id = ev.id
    INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
    INNER JOIN public.chapel c ON ce.chapel_id = c.id
    INNER JOIN public.parish pa ON c.parish_id = pa.id
    INNER JOIN public.event e ON ce.event_id = e.id
ORDER BY
    r.event_date DESC, r.event_time;
COMMENT ON VIEW public.vw_reservation_details IS 'Detalle completo de cada reserva, incluyendo la información del usuario, la variante del evento, la capilla y la parroquia a la que pertenece.';


-- Creación de la vista para obtener el detalle de las capillas y sus parroquias.
CREATE OR REPLACE VIEW public.vw_chapel_location_info AS
SELECT
    c.name AS chapel_name,
    c.address AS chapel_address,
    p.name AS parish_name,
    c.chapel_base AS is_base_chapel,
    c.coordinates AS chapel_coordinates
FROM
    public.chapel c
INNER JOIN
    public.parish p ON c.parish_id = p.id
ORDER BY
    p.name, c.name;
COMMENT ON VIEW public.vw_chapel_location_info IS 'Detalles de ubicación (dirección, coordenadas) y asociación de cada capilla con su parroquia principal.';


-- Creación de la vista para obtener el conteo de requisitos (base y adicionales) por variante de evento y capilla.
CREATE OR REPLACE VIEW public.vw_chapel_event_requirements AS
SELECT
    e.name AS base_event_name,
    cev.id AS event_variant_id,
    cev.name AS event_variant_name,
    c.name AS chapel_name,
    
    -- Conteo de requisitos base (del sistema)
    (SELECT COUNT(br.id)
     FROM public.base_requirement br
     WHERE br.event_id = e.id AND br.active = TRUE) AS num_base_requirements,
     
    -- Conteo de requisitos adicionales (específicos de la capilla)
    (SELECT COUNT(cer.id)
     FROM public.chapel_event_requirement cer
     WHERE cer.chapel_event_id = ce.id AND cer.active = TRUE) AS num_additional_requirements,
     
    -- Suma total de requisitos
    (SELECT COUNT(br.id)
     FROM public.base_requirement br
     WHERE br.event_id = e.id AND br.active = TRUE) +
    (SELECT COUNT(cer.id)
     FROM public.chapel_event_requirement cer
     WHERE cer.chapel_event_id = ce.id AND cer.active = TRUE) AS total_requirements_count
FROM
    public.chapel_event ce
JOIN
    public.event e ON ce.event_id = e.id
JOIN
    public.chapel c ON ce.chapel_id = c.id
JOIN
    public.event_variant cev ON cev.chapel_event_id = ce.id
WHERE
    ce.active = TRUE
    AND e.active = TRUE
ORDER BY
    base_event_name, chapel_name;
COMMENT ON VIEW public.vw_chapel_event_requirements IS 'Muestra el conteo total de requisitos (base de Diócesis + adicionales de Capilla) por cada variante de evento ofrecida por una capilla específica.';


-- Creación de la vista para obtener el conteo de requisitos base (a nivel de diócesis) por tipo de evento.
CREATE OR REPLACE VIEW public.vw_diocese_base_requirements AS
SELECT
    e.name AS base_event_name,
    COUNT(br.id) AS total_base_requirements
FROM
    public.event e
LEFT JOIN
    public.base_requirement br ON e.id = br.event_id AND br.active = TRUE
WHERE
    e.active = TRUE
GROUP BY
    e.id, e.name
ORDER BY
    base_event_name;
COMMENT ON VIEW public.vw_diocese_base_requirements IS 'Lista los tipos de eventos (del catálogo base) y la cantidad de requisitos base definidos a nivel de Diócesis para cada uno.';


-- Creación de la vista para calcular el total de requisitos (base y capilla) que se esperan para el conjunto de todas las reservas.
CREATE OR REPLACE VIEW public.vw_expected_reservation_requirements_summary AS
WITH ReservationEventMapping AS (
    -- 1. Mapear cada reserva a su evento base (event_id) y evento de capilla (chapel_event_id)
    SELECT
        r.id AS reservation_id,
        ce.event_id,
        ce.id AS chapel_event_id
    FROM
        public.reservation r
    JOIN
        public.event_variant ev ON r.event_variant_id = ev.id
    JOIN
        public.chapel_event ce ON ev.chapel_event_id = ce.id
),
BaseReqCounts AS (
    -- 2. Contar los requisitos base (diócesis) ACTIVOS para cada reserva
    SELECT
        rem.reservation_id,
        COUNT(br.id) AS num_base_reqs
    FROM
        ReservationEventMapping rem
    LEFT JOIN
        public.base_requirement br ON rem.event_id = br.event_id AND br.active = TRUE
    GROUP BY
        rem.reservation_id
),
ChapelReqCounts AS (
    -- 3. Contar los requisitos de capilla ACTIVOS para cada reserva
    SELECT
        rem.reservation_id,
        COUNT(cer.id) AS num_chapel_reqs
    FROM
        ReservationEventMapping rem
    LEFT JOIN
        public.chapel_event_requirement cer ON rem.chapel_event_id = cer.chapel_event_id AND cer.active = TRUE
    GROUP BY
        rem.reservation_id
)
SELECT
    COALESCE(SUM(brc.num_base_reqs), 0) AS total_requisitos_base_esperados,
    COALESCE(SUM(crc.num_chapel_reqs), 0) AS total_requisitos_capilla_esperados,
    COALESCE(SUM(brc.num_base_reqs + crc.num_chapel_reqs), 0) AS total_requisitos_esperados
FROM
    BaseReqCounts brc
JOIN
    ChapelReqCounts crc ON brc.reservation_id = crc.reservation_id;
COMMENT ON VIEW public.vw_expected_reservation_requirements_summary IS 'Suma el total de requisitos (base y capilla) que se espera que sean cumplidos por el conjunto de todas las reservas existentes en el sistema.';


-- Vista de vistas
CREATE OR REPLACE VIEW public.vw_list_views AS
SELECT
    c.relname AS view_name,
    pgd.description AS view_comment
FROM
    pg_class c
LEFT JOIN
    pg_description pgd ON pgd.objoid = c.oid AND pgd.objsubid = 0
WHERE
    c.relkind = 'v' -- 'v' significa vista (VIEW)
    AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY
    c.relname;
COMMENT ON VIEW public.vw_list_views IS 'Lista todas las vistas (VIEWs) existentes en el esquema public y su comentario asociado.';


-- Creación de la vista para obtener información administrativa de las parroquias y sus roles.
CREATE OR REPLACE VIEW public.vw_chapel_admin_info AS
SELECT
    c.id AS chapel_id,
    p.name AS parish_name,
    (SELECT cb.id FROM public.chapel cb WHERE cb.parish_id = p.id AND cb.chapel_base = TRUE LIMIT 1) AS base_chapel_id,
    per.email AS parish_admin_email,
    (SELECT COUNT(r.id) FROM public.role r WHERE r.parish_id = p.id AND r.active = TRUE) AS active_role_count
FROM
    public.chapel c
JOIN
    public.parish p ON c.parish_id = p.id
JOIN
    public.user u ON p.admin_user_id = u.id
JOIN
    public.person per ON u.person_id = per.id
ORDER BY
    p.name, c.name;
COMMENT ON VIEW public.vw_chapel_admin_info IS 'Muestra información administrativa clave de cada capilla y la cantidad de roles activos definidos en su parroquia.';