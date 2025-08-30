-- ====================================================================
-- ESQUEMA DE BASE DE DATOS: GESTIÓN DE PARROQUIAS Y EVENTOS
-- ====================================================================
-- Creado el: 24 de agosto de 2025
-- Descripción: Sistema para gestión de parroquias, eventos, reservas y usuarios
-- PostgreSQL 17.4
-- ====================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS plpgsql;

-- ====================================================================
-- SECUENCIAS
-- ====================================================================

CREATE SEQUENCE IF NOT EXISTS public.persons_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.parishes_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.associations_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.user_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.general_schedules_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.specific_schedules_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.events_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.event_variants_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.reservations_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.base_requirements_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.reservation_requirements_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.document_types_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

CREATE SEQUENCE IF NOT EXISTS public.role_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

-- ====================================================================
-- FUNCIONES AUXILIARES
-- ====================================================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- TABLAS PRINCIPALES
-- ====================================================================

-- Tabla Permission: Permisos del sistema definidos por el propietario
CREATE TABLE IF NOT EXISTS public.permission (
    id INTEGER DEFAULT nextval('permissions_id_seq'::regclass) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- Ej: 'USUARIOS', 'EVENTOS', 'RESERVAS', 'CONFIGURACION'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT permission_pkey PRIMARY KEY (id)
);

-- Tabla DocumentType: Catálogo de tipos de documentos de identidad
CREATE TABLE IF NOT EXISTS public.document_type (
    id INTEGER DEFAULT nextval('document_types_id_seq'::regclass) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT document_type_pkey PRIMARY KEY (id)
);

-- Tabla Person: Información personal básica
CREATE TABLE IF NOT EXISTS public.person (
    id INTEGER DEFAULT nextval('persons_id_seq'::regclass) NOT NULL,
    first_names VARCHAR(40) NOT NULL,
    paternal_surname VARCHAR(40) NOT NULL,
    maternal_surname VARCHAR(40),
    email VARCHAR(40) UNIQUE NOT NULL,
    document VARCHAR(20) NOT NULL,
    document_type_id INTEGER NOT NULL,
    profile_photo VARCHAR(60),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT person_pkey PRIMARY KEY (id),
    CONSTRAINT fk_person_document_type FOREIGN KEY (document_type_id) REFERENCES document_type(id)
);

-- Tabla User: Información de acceso asociada a una persona
CREATE TABLE IF NOT EXISTS public.user (
    id INTEGER DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
    person_id INTEGER NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT fk_user_person FOREIGN KEY (person_id) REFERENCES person(id) ON DELETE CASCADE
);

-- Tabla Parish: Información de cada parroquia
CREATE TABLE IF NOT EXISTS public.parish (
    id INTEGER DEFAULT nextval('parishes_id_seq'::regclass) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    primary_color VARCHAR(7) DEFAULT '#b1b1b1ff' NOT NULL,
    secondary_color VARCHAR(7) DEFAULT '#424242ff' NOT NULL,
    profile_photo VARCHAR(60),
    cover_photo VARCHAR(60),
    admin_user_id INTEGER NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT parish_pkey PRIMARY KEY (id),
    CONSTRAINT fk_parish_admin FOREIGN KEY (admin_user_id) REFERENCES "user"(id)
);

-- Tabla Role: Roles definidos por cada parroquia
CREATE TABLE IF NOT EXISTS public.role (
    id INTEGER DEFAULT nextval('roles_id_seq'::regclass) NOT NULL,
    parish_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT role_pkey PRIMARY KEY (id),
    CONSTRAINT fk_role_parish FOREIGN KEY (parish_id) REFERENCES parish(id) ON DELETE CASCADE,
    CONSTRAINT uk_role_parish_name UNIQUE(parish_id, name)
);

-- Tabla RolePermission: Asignación de permisos a roles
CREATE TABLE IF NOT EXISTS public.role_permission (
    id INTEGER DEFAULT nextval('role_permissions_id_seq'::regclass) NOT NULL,
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    granted BOOLEAN DEFAULT TRUE, -- Permite revocar permisos específicos sin eliminar la relación
    assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revocation_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT role_permission_pkey PRIMARY KEY (id),
    CONSTRAINT fk_role_permission_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission_id) REFERENCES permission(id) ON DELETE CASCADE,
    CONSTRAINT uk_role_permission_active UNIQUE(role_id, permission_id),
    CONSTRAINT chk_permission_dates_valid CHECK (revocation_date IS NULL OR revocation_date >= assignment_date)
);

-- Tabla Association: Histórico de trabajo de usuarios en parroquias
CREATE TABLE IF NOT EXISTS public.association (
    id INTEGER DEFAULT nextval('associations_id_seq'::regclass) NOT NULL,
    user_id INTEGER NOT NULL,
    parish_id INTEGER NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE NOT NULL,
    end_date DATE, -- NULL si sigue trabajando para la parroquia
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT association_pkey PRIMARY KEY (id),
    CONSTRAINT fk_association_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_association_parish FOREIGN KEY (parish_id) REFERENCES parish(id) ON DELETE CASCADE,
    CONSTRAINT chk_dates_valid CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Tabla intermedia: Asignación de roles a usuarios en asociaciones
CREATE TABLE IF NOT EXISTS public.user_role (
    id INTEGER DEFAULT nextval('user_roles_id_seq'::regclass) NOT NULL,
    association_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    assignment_date DATE DEFAULT CURRENT_DATE NOT NULL,
    revocation_date DATE, -- NULL si el rol sigue activo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT user_role_pkey PRIMARY KEY (id),
    CONSTRAINT fk_user_role_association FOREIGN KEY (association_id) REFERENCES association(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_role_active UNIQUE(association_id, role_id, revocation_date),
    CONSTRAINT chk_role_dates_valid CHECK (revocation_date IS NULL OR revocation_date >= assignment_date)
);

-- ====================================================================
-- TABLAS DE HORARIOS
-- ====================================================================

-- Tabla GeneralSchedule: Disponibilidad recurrente de la parroquia
CREATE TABLE IF NOT EXISTS public.general_schedule (
    id INTEGER DEFAULT nextval('general_schedules_id_seq'::regclass) NOT NULL,
    parish_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 1=Lunes, ..., 6=Sábado
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT general_schedule_pkey PRIMARY KEY (id),
    CONSTRAINT fk_general_schedule_parish FOREIGN KEY (parish_id) REFERENCES parish(id) ON DELETE CASCADE,
    CONSTRAINT chk_schedule_valid CHECK (end_time > start_time),
    CONSTRAINT uk_general_schedule_parish_day UNIQUE(parish_id, day_of_week, start_time)
);

-- Tabla SpecificSchedule: Excepciones al horario general
CREATE TABLE IF NOT EXISTS public.specific_schedule (
    id INTEGER DEFAULT nextval('specific_schedules_id_seq'::regclass) NOT NULL,
    parish_id INTEGER NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    exception_type VARCHAR(20) NOT NULL CHECK (exception_type IN ('OPEN', 'CLOSED')),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT specific_schedule_pkey PRIMARY KEY (id),
    CONSTRAINT fk_specific_schedule_parish FOREIGN KEY (parish_id) REFERENCES parish(id) ON DELETE CASCADE,
    CONSTRAINT chk_specific_schedule_valid CHECK (
        (exception_type = 'CLOSED') OR 
        (exception_type IN ('OPEN') AND start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
    ),
    CONSTRAINT uk_specific_schedule_parish_date UNIQUE(parish_id, date)
);

-- ====================================================================
-- TABLAS DE EVENTOS Y RESERVAS
-- ====================================================================

-- Tabla Event: Actividades o servicios ofrecidos por las parroquias
CREATE TABLE IF NOT EXISTS public.event (
    id INTEGER DEFAULT nextval('events_id_seq'::regclass) NOT NULL,
    parish_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- Ej: 'SACRAMENTO', 'SERVICIO_COMUNITARIO', 'EVENTO_ESPECIAL'
    estimated_duration INTERVAL, -- Duración estimada del evento
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT event_pkey PRIMARY KEY (id),
    CONSTRAINT fk_event_parish FOREIGN KEY (parish_id) REFERENCES parish(id) ON DELETE CASCADE
);

-- Tabla EventVariant: Diferentes configuraciones de un evento
CREATE TABLE IF NOT EXISTS public.event_variant (
    id INTEGER DEFAULT nextval('event_variants_id_seq'::regclass) NOT NULL,
    event_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    current_price DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    max_capacity INTEGER DEFAULT 1 NOT NULL CHECK (max_capacity > 0),
    preparation_time INTERVAL, -- Tiempo de preparación requerido antes del evento
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT event_variant_pkey PRIMARY KEY (id),
    CONSTRAINT fk_event_variant_event FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
    CONSTRAINT uk_event_variant_name UNIQUE(event_id, name)
);

-- Tabla Reservation: Vincula personas con variantes de eventos
CREATE TABLE IF NOT EXISTS public.reservation (
    id INTEGER DEFAULT nextval('reservations_id_seq'::regclass) NOT NULL,
    event_variant_id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,
    event_date TIMESTAMP NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS' NOT NULL CHECK (status IN ('RESERVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'FULFILLED', 'CANCELLED')),
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    special_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT reservation_pkey PRIMARY KEY (id),
    CONSTRAINT fk_reservation_event_variant FOREIGN KEY (event_variant_id) REFERENCES event_variant(id) ON DELETE CASCADE,
    CONSTRAINT fk_reservation_person FOREIGN KEY (person_id) REFERENCES person(id) ON DELETE CASCADE,
    CONSTRAINT chk_future_event_date CHECK (event_date > registration_date)
);

-- ====================================================================
-- TABLAS DE REQUISITOS
-- ====================================================================

-- Tabla BaseRequirement: Requisitos para eventos de una parroquia
CREATE TABLE IF NOT EXISTS public.base_requirement (
    id INTEGER DEFAULT nextval('base_requirements_id_seq'::regclass) NOT NULL,
    event_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    presentation_order INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT base_requirement_pkey PRIMARY KEY (id),
    CONSTRAINT fk_base_requirement_event FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
    CONSTRAINT uk_base_requirement_event_name UNIQUE(event_id, name)
);

-- Tabla ReservationRequirement: Copia de requisitos activos al momento de realizar una reserva
CREATE TABLE IF NOT EXISTS public.reservation_requirement (
    id INTEGER DEFAULT nextval('reservation_requirements_id_seq'::regclass) NOT NULL,
    reservation_id INTEGER NOT NULL,
    base_requirement_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL, -- Copia del nombre del requisito base
    description TEXT, -- Copia de la descripción del requisito base
    completed BOOLEAN DEFAULT FALSE NOT NULL, -- Marcado por trabajadores de la parroquia
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT reservation_requirement_pkey PRIMARY KEY (id),
    CONSTRAINT fk_reservation_requirement_reservation FOREIGN KEY (reservation_id) REFERENCES reservation(id) ON DELETE CASCADE,
    CONSTRAINT fk_reservation_requirement_base FOREIGN KEY (base_requirement_id) REFERENCES base_requirement(id),
    CONSTRAINT uk_reservation_requirement_unique UNIQUE(reservation_id, base_requirement_id)
);

-- ====================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ====================================================================

-- Índices para tabla permission
CREATE INDEX IF NOT EXISTS idx_permission_code ON public.permission(code);
CREATE INDEX IF NOT EXISTS idx_permission_category ON public.permission(category);

-- Índices para tabla document_type
CREATE INDEX IF NOT EXISTS idx_document_type_code ON public.document_type(code);

-- Índices para tabla person
CREATE INDEX IF NOT EXISTS idx_person_email ON public.person(email);
CREATE INDEX IF NOT EXISTS idx_person_document ON public.person(document);
CREATE INDEX IF NOT EXISTS idx_person_document_type ON public.person(document_type_id);

-- Índices para tabla user
CREATE INDEX IF NOT EXISTS idx_user_username ON public.user(username);
CREATE INDEX IF NOT EXISTS idx_user_person_id ON public.user(person_id);

-- Índices para tabla parish
CREATE INDEX IF NOT EXISTS idx_parish_name ON public.parish(name);
CREATE INDEX IF NOT EXISTS idx_parish_admin ON public.parish(admin_user_id);

-- Índices para tabla role
CREATE INDEX IF NOT EXISTS idx_role_parish ON public.role(parish_id);
CREATE INDEX IF NOT EXISTS idx_role_name ON public.role(name);

-- Índices para tabla role_permission
CREATE INDEX IF NOT EXISTS idx_role_permission_role ON public.role_permission(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permission_permission ON public.role_permission(permission_id);
CREATE INDEX IF NOT EXISTS idx_role_permission_granted ON public.role_permission(granted);

-- Índices para tabla association
CREATE INDEX IF NOT EXISTS idx_association_user ON public.association(user_id);
CREATE INDEX IF NOT EXISTS idx_association_parish ON public.association(parish_id);
CREATE INDEX IF NOT EXISTS idx_association_dates ON public.association(start_date, end_date);

-- Índices para tabla user_role
CREATE INDEX IF NOT EXISTS idx_user_role_association ON public.user_role(association_id);
CREATE INDEX IF NOT EXISTS idx_user_role_role ON public.user_role(role_id);
CREATE INDEX IF NOT EXISTS idx_user_role_dates ON public.user_role(assignment_date, revocation_date);

-- Índices para tabla general_schedule
CREATE INDEX IF NOT EXISTS idx_general_schedule_parish ON public.general_schedule(parish_id);
CREATE INDEX IF NOT EXISTS idx_general_schedule_day ON public.general_schedule(day_of_week);

-- Índices para tabla specific_schedule
CREATE INDEX IF NOT EXISTS idx_specific_schedule_parish ON public.specific_schedule(parish_id);
CREATE INDEX IF NOT EXISTS idx_specific_schedule_date ON public.specific_schedule(date);

-- Índices para tabla event
CREATE INDEX IF NOT EXISTS idx_event_parish ON public.event(parish_id);
CREATE INDEX IF NOT EXISTS idx_event_name ON public.event(name);
CREATE INDEX IF NOT EXISTS idx_event_category ON public.event(category);

-- Índices para tabla event_variant
CREATE INDEX IF NOT EXISTS idx_event_variant_event ON public.event_variant(event_id);

-- Índices para tabla reservation
CREATE INDEX IF NOT EXISTS idx_reservation_event_variant ON public.reservation(event_variant_id);
CREATE INDEX IF NOT EXISTS idx_reservation_person ON public.reservation(person_id);
CREATE INDEX IF NOT EXISTS idx_reservation_event_date ON public.reservation(event_date);
CREATE INDEX IF NOT EXISTS idx_reservation_status ON public.reservation(status);

-- Índices para tabla base_requirement
CREATE INDEX IF NOT EXISTS idx_base_requirement_event ON public.base_requirement(event_id);
CREATE INDEX IF NOT EXISTS idx_base_requirement_order ON public.base_requirement(presentation_order);

-- Índices para tabla reservation_requirement
CREATE INDEX IF NOT EXISTS idx_reservation_requirement_reservation ON public.reservation_requirement(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_requirement_base ON public.reservation_requirement(base_requirement_id);

-- ====================================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA DE TIMESTAMPS
-- ====================================================================

CREATE TRIGGER update_permission_updated_at 
    BEFORE UPDATE ON public.permission 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_type_updated_at 
    BEFORE UPDATE ON public.document_type 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_person_updated_at 
    BEFORE UPDATE ON public.person 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_updated_at 
    BEFORE UPDATE ON public.user 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parish_updated_at 
    BEFORE UPDATE ON public.parish 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_updated_at 
    BEFORE UPDATE ON public.role 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_permission_updated_at 
    BEFORE UPDATE ON public.role_permission 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_association_updated_at 
    BEFORE UPDATE ON public.association 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_general_schedule_updated_at 
    BEFORE UPDATE ON public.general_schedule 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specific_schedule_updated_at 
    BEFORE UPDATE ON public.specific_schedule 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_updated_at 
    BEFORE UPDATE ON public.event 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_variant_updated_at 
    BEFORE UPDATE ON public.event_variant 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservation_updated_at 
    BEFORE UPDATE ON public.reservation 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_base_requirement_updated_at 
    BEFORE UPDATE ON public.base_requirement 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservation_requirement_updated_at 
    BEFORE UPDATE ON public.reservation_requirement 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- FUNCIONES UTILITARIAS
-- ====================================================================

-- Función para verificar si un rol tiene un permiso específico
CREATE OR REPLACE FUNCTION public.role_has_permission(
    p_role_id INTEGER,
    p_permission_code VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    v_has_permission BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1
        FROM role_permission rp
        JOIN permission p ON rp.permission_id = p.id
        WHERE rp.role_id = p_role_id
          AND p.code = p_permission_code
          AND rp.granted = TRUE
          AND (rp.revocation_date IS NULL OR rp.revocation_date > CURRENT_TIMESTAMP)
    ) INTO v_has_permission;
    
    RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener todos los permisos activos de un rol
CREATE OR REPLACE FUNCTION public.get_role_permissions(
    p_role_id INTEGER
) RETURNS TABLE(
    permission_code VARCHAR,
    permission_name VARCHAR,
    permission_category VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.code,
        p.name,
        p.category
    FROM role_permission rp
    JOIN permission p ON rp.permission_id = p.id
    WHERE rp.role_id = p_role_id
      AND rp.granted = TRUE
      AND (rp.revocation_date IS NULL OR rp.revocation_date > CURRENT_TIMESTAMP)
    ORDER BY p.category, p.name;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar capacidad disponible de una variante de evento
CREATE OR REPLACE FUNCTION public.check_available_capacity(
    p_event_variant_id INTEGER,
    p_event_date TIMESTAMP
) RETURNS INTEGER AS $$
DECLARE
    v_max_capacity INTEGER;
    v_existing_reservations INTEGER;
    v_available_capacity INTEGER;
BEGIN
    -- Obtener capacidad máxima de la variante
    SELECT max_capacity INTO v_max_capacity
    FROM event_variant
    WHERE id = p_event_variant_id AND active = TRUE;
    
    IF v_max_capacity IS NULL THEN
        RETURN -1; -- Variante no encontrada o inactiva
    END IF;
    
    -- Contar reservas existentes para la misma fecha
    SELECT COUNT(*) INTO v_existing_reservations
    FROM reservation
    WHERE event_variant_id = p_event_variant_id
      AND DATE(event_date) = DATE(p_event_date)
      AND status IN ('RESERVED', 'IN_PROGRESS', 'COMPLETED');
    
    v_available_capacity := v_max_capacity - v_existing_reservations;
    
    RETURN GREATEST(0, v_available_capacity);
END;
$$ LANGUAGE plpgsql;

-- Función para obtener horario efectivo de una parroquia en una fecha específica
CREATE OR REPLACE FUNCTION public.get_effective_schedule(
    p_parish_id INTEGER,
    p_date DATE
) RETURNS TABLE(
    start_time TIME,
    end_time TIME,
    status VARCHAR,
    is_specific BOOLEAN
) AS $$
DECLARE
    v_day_of_week INTEGER;
    v_specific_schedule RECORD;
BEGIN
    -- Obtener día de la semana (0=Domingo, 1=Lunes, etc.)
    v_day_of_week := EXTRACT(DOW FROM p_date);
    
    -- Verificar si hay horario específico para esta fecha
    SELECT ss.start_time, ss.end_time, ss.exception_type, TRUE as is_specific
    INTO v_specific_schedule
    FROM specific_schedule ss
    WHERE ss.parish_id = p_parish_id
      AND ss.date = p_date;
    
    IF FOUND THEN
        -- Devolver horario específico
        IF v_specific_schedule.exception_type = 'CLOSED' THEN
            RETURN QUERY SELECT NULL::TIME, NULL::TIME, 'CLOSED'::VARCHAR, TRUE;
        ELSE
            RETURN QUERY SELECT 
                v_specific_schedule.start_time,
                v_specific_schedule.end_time,
                v_specific_schedule.exception_type::VARCHAR,
                TRUE;
        END IF;
    ELSE
        -- Devolver horario general
        RETURN QUERY 
        SELECT 
            gs.start_time,
            gs.end_time,
            gs.status,
            FALSE
        FROM general_schedule gs
        WHERE gs.parish_id = p_parish_id
          AND gs.day_of_week = v_day_of_week;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- VISTAS ÚTILES
-- ====================================================================

-- Vista para obtener roles con sus permisos
CREATE OR REPLACE VIEW public.roles_permissions_view AS
SELECT 
    r.id as role_id,
    r.name as role_name,
    r.description as role_description,
    par.id as parish_id,
    par.name as parish_name,
    p.id as permission_id,
    p.code as permission_code,
    p.name as permission_name,
    p.category as permission_category,
    rp.granted,
    rp.assignment_date,
    rp.revocation_date
FROM role r
JOIN parish par ON r.parish_id = par.id
LEFT JOIN role_permission rp ON r.id = rp.role_id
LEFT JOIN permission p ON rp.permission_id = p.id
WHERE r.active = TRUE;

-- Vista para obtener información completa de reservas
CREATE OR REPLACE VIEW public.reservations_complete_view AS
SELECT 
    r.id,
    r.event_date,
    r.registration_date,
    r.status,
    r.paid_amount,
    r.special_notes,
    -- Información de la persona
    CONCAT(p.first_names, ' ', p.paternal_surname, ' ', COALESCE(p.maternal_surname, '')) as person_full_name,
    p.first_names as person_first_names,
    p.paternal_surname,
    p.maternal_surname,
    p.email as person_email,
    p.document as person_document,
    dt.name as document_type_name,
    -- Información del evento y variante
    e.name as event_name,
    e.category as event_category,
    ev.name as variant_name,
    ev.current_price,
    -- Información de la parroquia
    par.name as parish_name,
    par.email as parish_email,
    par.phone as parish_phone,
    -- Conteo de requisitos
    COUNT(rr.id) as total_requirements,
    COUNT(CASE WHEN rr.completed = true THEN 1 END) as completed_requirements,
    COUNT(CASE WHEN rr.completed = false OR rr.completed IS NULL THEN 1 END) as pending_requirements
FROM reservation r
JOIN person p ON r.person_id = p.id
JOIN document_type dt ON p.document_type_id = dt.id
JOIN event_variant ev ON r.event_variant_id = ev.id
JOIN event e ON ev.event_id = e.id
JOIN parish par ON e.parish_id = par.id
LEFT JOIN reservation_requirement rr ON r.id = rr.reservation_id
GROUP BY 
    r.id, r.event_date, r.registration_date, r.status, r.paid_amount, r.special_notes,
    p.first_names, p.paternal_surname, p.maternal_surname, p.email, p.document, dt.name,
    e.name, e.category,
    ev.name, ev.current_price,
    par.name, par.email, par.phone;

-- ====================================================================
-- COMENTARIOS EN LAS TABLAS
-- ====================================================================

COMMENT ON TABLE public.permission IS 'Permisos del sistema definidos por el propietario del sistema';
COMMENT ON TABLE public.document_type IS 'Catálogo de tipos de documentos de identidad';
COMMENT ON TABLE public.person IS 'Información personal básica de todos los usuarios del sistema';
COMMENT ON TABLE public.user IS 'Información de acceso asociada a una persona';
COMMENT ON TABLE public.parish IS 'Información de cada parroquia que funciona como una página de Facebook';
COMMENT ON TABLE public.role IS 'Roles definidos por cada parroquia con niveles de acceso';
COMMENT ON TABLE public.role_permission IS 'Asignación de permisos del sistema a roles de parroquia';
COMMENT ON TABLE public.association IS 'Histórico de qué usuario trabaja para qué parroquia';
COMMENT ON TABLE public.user_role IS 'Asignación de roles a usuarios en sus asociaciones';
COMMENT ON TABLE public.general_schedule IS 'Disponibilidad recurrente de la parroquia por día de la semana';
COMMENT ON TABLE public.specific_schedule IS 'Excepciones al horario general (tiene más jerarquía)';
COMMENT ON TABLE public.event IS 'Actividades o servicios ofrecidos por las parroquias';
COMMENT ON TABLE public.event_variant IS 'Diferentes configuraciones de un evento (individual, comunitario, etc.)';
COMMENT ON TABLE public.reservation IS 'Vincula personas con la separación de una variante de evento';
COMMENT ON TABLE public.base_requirement IS 'Requisitos activos de un evento de una parroquia';
COMMENT ON TABLE public.reservation_requirement IS 'Copia de los requisitos activos al momento de realizar una reserva';

-- ====================================================================
-- FIN DEL SCRIPT
-- ====================================================================

-- Mensaje de finalización
SELECT 'Esquema de base de datos para Gestión de Parroquias y Eventos creado exitosamente.' as mensaje;