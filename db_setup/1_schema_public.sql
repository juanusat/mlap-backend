-- ====================================================================
-- ESQUEMA DE BASE DE DATOS: GESTIÓN DE PARROQUIAS Y EVENTOS
-- ====================================================================
-- Creado el: 24 de agosto de 2025
-- Descripción: Sistema para gestión de parroquias, eventos, reservas y usuarios
-- PostgreSQL 17.4
-- ====================================================================

-- ====================================================================
-- TABLAS PRINCIPALES
-- ====================================================================

-- Tabla Permission: Permisos del sistema definidos por el propietario
CREATE TABLE IF NOT EXISTS public.permission (
    id INTEGER NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    category VARCHAR(50), -- Ej: 'USUARIOS', 'EVENTOS', 'RESERVAS', 'CONFIGURACION'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT permission_pkey PRIMARY KEY (id)
);

-- Tabla DocumentType: Catálogo de tipos de documentos de identidad
CREATE TABLE IF NOT EXISTS public.document_type (
    id INTEGER NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT document_type_pkey PRIMARY KEY (id)
);

-- Tabla Person: Información personal básica
CREATE TABLE IF NOT EXISTS public.person (
    id INTEGER NOT NULL,
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
    id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_diocese BOOLEAN DEFAULT FALSE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(6),
    reset_token_expires_at TIMESTAMP,
    
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT fk_user_person FOREIGN KEY (person_id) REFERENCES person(id) ON DELETE CASCADE
);

-- Tabla Parish: Información de cada parroquia
CREATE TABLE IF NOT EXISTS public.parish (
    id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    primary_color VARCHAR(7) DEFAULT '#b1b1b1' NOT NULL,
    secondary_color VARCHAR(7) DEFAULT '#424242' NOT NULL,
    admin_user_id INTEGER NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT parish_pkey PRIMARY KEY (id),
    CONSTRAINT fk_parish_admin FOREIGN KEY (admin_user_id) REFERENCES "user"(id)
);

-- Tabla Chapel: Capillas pertenecientes a una parroquia
CREATE TABLE IF NOT EXISTS public.chapel (
    id INTEGER NOT NULL,
    parish_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    coordinates VARCHAR(60) NOT NULL,
    address VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    profile_photo VARCHAR(60),
    cover_photo VARCHAR(60),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    chapel_base BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chapel_pkey PRIMARY KEY (id),
    CONSTRAINT fk_chapel_parish FOREIGN KEY (parish_id) REFERENCES parish(id) ON DELETE CASCADE,
    CONSTRAINT uk_chapel_parish_name UNIQUE(parish_id, name)
);

-- Tabla Role: Roles definidos por cada parroquia
CREATE TABLE IF NOT EXISTS public.role (
    id INTEGER NOT NULL,
    parish_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT role_pkey PRIMARY KEY (id),
    CONSTRAINT fk_role_parish FOREIGN KEY (parish_id) REFERENCES parish(id) ON DELETE CASCADE,
    CONSTRAINT uk_role_parish_name UNIQUE(parish_id, name)
);

-- Tabla RolePermission: Asignación de permisos a roles
CREATE TABLE IF NOT EXISTS public.role_permission (
    id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    granted BOOLEAN DEFAULT TRUE,
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

-- Tabla Association: Histórico de trabajo de usuarios en capillas
CREATE TABLE IF NOT EXISTS public.association (
    id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    parish_id INTEGER NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE NOT NULL,
    end_date DATE,
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
    id INTEGER NOT NULL,
    association_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    assignment_date DATE DEFAULT CURRENT_DATE NOT NULL,
    revocation_date DATE,
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

-- Tabla GeneralSchedule: Disponibilidad recurrente de la capilla
CREATE TABLE IF NOT EXISTS public.general_schedule (
    id INTEGER NOT NULL,
    chapel_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT general_schedule_pkey PRIMARY KEY (id),
    CONSTRAINT fk_general_schedule_chapel FOREIGN KEY (chapel_id) REFERENCES chapel(id) ON DELETE CASCADE,
    CONSTRAINT chk_schedule_valid CHECK (end_time > start_time),
    CONSTRAINT uk_general_schedule_chapel_day UNIQUE(chapel_id, day_of_week, start_time)
);

-- Tabla SpecificSchedule: Excepciones al horario general
CREATE TABLE IF NOT EXISTS public.specific_schedule (
    id INTEGER NOT NULL,
    chapel_id INTEGER NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    exception_type VARCHAR(20) NOT NULL CHECK (exception_type IN ('OPEN', 'CLOSED')),
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT specific_schedule_pkey PRIMARY KEY (id),
    CONSTRAINT fk_specific_schedule_chapel FOREIGN KEY (chapel_id) REFERENCES chapel(id) ON DELETE CASCADE,
    CONSTRAINT chk_specific_schedule_valid CHECK (
        (exception_type = 'CLOSED') OR 
        (exception_type IN ('OPEN') AND start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
    )
);

-- ====================================================================
-- TABLAS DE EVENTOS Y RESERVAS
-- ====================================================================

-- Tabla Event: Catálogo base de eventos disponibles en el sistema
CREATE TABLE IF NOT EXISTS public.event (
    id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT event_pkey PRIMARY KEY (id),
    CONSTRAINT uk_event_name UNIQUE(name)
);

-- Tabla ChapelEvent: Relación entre capillas y eventos que ofrecen
CREATE TABLE IF NOT EXISTS public.chapel_event (
    id INTEGER NOT NULL,
    chapel_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chapel_event_pkey PRIMARY KEY (id),
    CONSTRAINT fk_chapel_event_chapel FOREIGN KEY (chapel_id) REFERENCES chapel(id) ON DELETE CASCADE,
    CONSTRAINT fk_chapel_event_event FOREIGN KEY (event_id) REFERENCES event(id),
    CONSTRAINT uk_chapel_event UNIQUE(chapel_id, event_id)
);

-- Tabla EventVariant: Diferentes configuraciones de eventos por capilla
CREATE TABLE IF NOT EXISTS public.event_variant (
    id INTEGER NOT NULL,
    chapel_event_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    current_price DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    max_capacity INTEGER DEFAULT 1 NOT NULL CHECK (max_capacity > 0),
    duration_minutes INTEGER DEFAULT 60 NOT NULL CHECK (duration_minutes > 0),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT event_variant_pkey PRIMARY KEY (id),
    CONSTRAINT fk_event_variant_chapel_event FOREIGN KEY (chapel_event_id) REFERENCES chapel_event(id) ON DELETE CASCADE,
    CONSTRAINT uk_event_variant_name UNIQUE(chapel_event_id, name)
);

COMMENT ON COLUMN public.event_variant.duration_minutes IS 'Duración estimada del evento en minutos';

-- Tabla Reservation: Vincula personas con variantes de eventos
CREATE TABLE IF NOT EXISTS public.reservation (
    id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    event_variant_id INTEGER NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    reschedule_date TIMESTAMP,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'RESERVED' NOT NULL CHECK (status IN ('RESERVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'FULFILLED', 'CANCELLED')),
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    beneficiary_full_name VARCHAR(120) NOT NULL,
    CONSTRAINT reservation_pkey PRIMARY KEY (id),
    CONSTRAINT fk_reservation_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_reservation_event_variant FOREIGN KEY (event_variant_id) REFERENCES event_variant(id) ON DELETE CASCADE
);

-- ====================================================================
-- TABLAS DE REQUISITOS
-- ====================================================================

-- Tabla BaseRequirement: Requisitos predefinidos por el sistema para cada tipo de evento
CREATE TABLE IF NOT EXISTS public.base_requirement (
    id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT base_requirement_pkey PRIMARY KEY (id),
    CONSTRAINT fk_base_requirement_event FOREIGN KEY (event_id) REFERENCES event(id),
    CONSTRAINT uk_base_requirement_event_name UNIQUE(event_id, name)
);

-- Tabla ChapelEventRequirement: Requisitos adicionales definidos por cada capilla
CREATE TABLE IF NOT EXISTS public.chapel_event_requirement (
    id INTEGER NOT NULL,
    chapel_event_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chapel_event_requirement_pkey PRIMARY KEY (id),
    CONSTRAINT fk_chapel_event_requirement_chapel_event FOREIGN KEY (chapel_event_id) REFERENCES chapel_event(id) ON DELETE CASCADE,
    CONSTRAINT uk_chapel_event_requirement_name UNIQUE(chapel_event_id, name)
);

-- Tabla ReservationRequirement: Copia de todos los requisitos (base y adicionales) al momento de la reserva
CREATE TABLE IF NOT EXISTS public.reservation_requirement (
    id INTEGER NOT NULL,
    reservation_id INTEGER NOT NULL,
    base_requirement_id INTEGER, -- NULL si es un requisito adicional de la capilla
    chapel_requirement_id INTEGER, -- NULL si es un requisito base del sistema
    name VARCHAR(255) NOT NULL, -- Copia del nombre del requisito
    description VARCHAR(255), -- Copia de la descripción del requisito
    completed BOOLEAN DEFAULT FALSE NOT NULL, -- Marcado por trabajadores de la capilla
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT reservation_requirement_pkey PRIMARY KEY (id),
    CONSTRAINT fk_reservation_requirement_reservation FOREIGN KEY (reservation_id) REFERENCES reservation(id) ON DELETE CASCADE,
    CONSTRAINT fk_reservation_requirement_base FOREIGN KEY (base_requirement_id) REFERENCES base_requirement(id),
    CONSTRAINT fk_reservation_requirement_chapel FOREIGN KEY (chapel_requirement_id) REFERENCES chapel_event_requirement(id),
    CONSTRAINT chk_requirement_source CHECK (
        (base_requirement_id IS NULL AND chapel_requirement_id IS NOT NULL) OR
        (base_requirement_id IS NOT NULL AND chapel_requirement_id IS NULL)
    )
);

-- ====================================================================
-- Tablas de Bitácora (Audit Log)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT security_audit_log_pkey PRIMARY KEY (id),
    CONSTRAINT fk_security_audit_log_user FOREIGN KEY (user_id) REFERENCES public.user(id)
);

CREATE TABLE IF NOT EXISTS public.parish_audit_log (
    id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    description VARCHAR(255),
    parish_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT parish_audit_log_pkey PRIMARY KEY (id),
    CONSTRAINT fk_parish_audit_log_user FOREIGN KEY (user_id) REFERENCES public.user(id)
);

CREATE TABLE IF NOT EXISTS public.user_audit_log (
    id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_audit_log_pkey PRIMARY KEY (id),
    CONSTRAINT fk_user_audit_log_user FOREIGN KEY (user_id) REFERENCES public.user(id)
);

CREATE TABLE IF NOT EXISTS public.event_audit_log (
    id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    description VARCHAR(255),
    event_id INTEGER,
    chapel_event_id INTEGER,
    variant_id INTEGER,
    reservation_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT event_audit_log_pkey PRIMARY KEY (id),
    CONSTRAINT fk_event_audit_log_user FOREIGN KEY (user_id) REFERENCES public.user(id),
    CONSTRAINT fk_event_audit_log_event FOREIGN KEY (event_id) REFERENCES public.event(id),
    CONSTRAINT fk_event_audit_log_chapel_event FOREIGN KEY (chapel_event_id) REFERENCES public.chapel_event(id),
    CONSTRAINT fk_event_audit_log_variant FOREIGN KEY (variant_id) REFERENCES public.event_variant(id),
    CONSTRAINT fk_event_audit_log_reservation FOREIGN KEY (reservation_id) REFERENCES public.reservation(id)
);
-- ====================================================================
-- TABLAS ADICIONALES
-- ====================================================================

-- Tabla MentionType: Tipos de menciones/intenciones (ej: Difunto, Salud)
CREATE TABLE IF NOT EXISTS public.mention_type (
    id INTEGER NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL, -- Código corto (ej: 'DIF', 'SAL')
    name VARCHAR(100) UNIQUE NOT NULL,       -- Nombre (ej: 'Difunto', 'Salud')
    description VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT mention_type_pkey PRIMARY KEY (id)
);

-- Tabla ReservationMention: Intenciones asociadas a una reserva
CREATE TABLE IF NOT EXISTS public.reservation_mention (
    id BIGSERIAL NOT NULL,
    reservation_id INTEGER NOT NULL,      -- A qué reserva pertenece
    mention_type_id INTEGER NOT NULL,     -- Qué tipo de intención es (Difunto, Salud, etc.)
    mention_name VARCHAR(120) NOT NULL, -- El nombre de la persona (ej: "Juan Pérez García")
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT reservation_mention_pkey PRIMARY KEY (id),
    CONSTRAINT fk_mention_reservation FOREIGN KEY (reservation_id) 
        REFERENCES public.reservation(id) ON DELETE CASCADE, -- Si se borra la reserva, se borran sus menciones
    CONSTRAINT fk_mention_type FOREIGN KEY (mention_type_id) 
        REFERENCES public.mention_type(id)
);

-- Tabla Notification: Almacena las notificaciones para los usuarios;
CREATE TABLE IF NOT EXISTS public.notification (
    id BIGSERIAL NOT NULL, 
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL, 
    body VARCHAR(255),
    read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    
    CONSTRAINT notification_pkey PRIMARY KEY (id),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES public.user(id) ON DELETE CASCADE
);

-- Tabla Payment: Pagos realizados hacia reservas (por feligreses o trabajadores)
CREATE TABLE IF NOT EXISTS public.payment (
    id BIGSERIAL NOT NULL,
    reservation_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    registered_by_worker_id INTEGER,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT payment_pkey PRIMARY KEY (id),
    CONSTRAINT fk_payment_reservation FOREIGN KEY (reservation_id) REFERENCES public.reservation(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_registered_by_worker FOREIGN KEY (registered_by_worker_id) REFERENCES public.user(id)
);