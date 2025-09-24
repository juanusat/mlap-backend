-- permission: Permisos base del sistema
INSERT INTO public.permission (id, code, name, description, category) VALUES
(1, 'CREATE_USER', 'Crear Usuario', 'Permite a un usuario crear nuevas cuentas de usuario', 'USUARIOS'),
(2, 'EDIT_PARISH', 'Editar Parroquia', 'Permite a un usuario modificar la información de una parroquia', 'CONFIGURACION'),
(3, 'MANAGE_RESERVATIONS', 'Gestionar Reservas', 'Permite a un usuario aceptar, rechazar o cancelar reservas', 'RESERVAS'),
(4, 'VIEW_REPORTS', 'Ver Informes', 'Acceso a reportes estadísticos del sistema', 'CONFIGURACION'),
(5, 'MANAGE_ROLES', 'Gestionar Roles', 'Permite crear, editar y eliminar roles y permisos', 'CONFIGURACION');

-- document_type: Tipos de documento de identidad
INSERT INTO public.document_type (id, code, name, active) VALUES
(1, 'DNI', 'Documento Nacional de Identidad', TRUE),
(2, 'PASAPORTE', 'Pasaporte', TRUE),
(3, 'CE', 'Carné de Extranjería', TRUE);

-- ====================================================================
-- INSERCIÓN DE PERSONAS Y USUARIOS
-- ====================================================================

-- person: Registros de personas
INSERT INTO public.person (id, first_names, paternal_surname, maternal_surname, email, document, document_type_id) VALUES
(1, 'Antonio', 'Errea', 'Torres', 'antonio.errea@example.com', '12345678', 1), -- Usuario Diócesis
(2, 'Pamela', 'Saavedra', 'Sanchez', 'pamela.saavedra@example.com', '87654321', 1), -- Admin Parroquia 1
(3, 'Juan', 'Espinoza', 'Milian', 'juan.espinoza@example.com', '98765432', 2), -- Trabajador Parroquia 1
(4, 'Luis', 'Barboza', 'Vilchez', 'luis.barboza@example.com', '11223344', 1), -- Cliente
(5, 'Sofia', 'Ramos', 'Vargas', 'sofia.ramos@example.com', '55544433', 1); -- Admin Parroquia 2

-- user: Cuentas de acceso al sistema
INSERT INTO public.user (id, person_id, username, password_hash, is_diocese, active) VALUES
(1, 1, 'antonio.e', '3f3ef786b34d6dd716e1812c8b74a7a0e1f05aa5f3230588f6f5bcd00c6c8392', TRUE, TRUE), -- Diócesis
(2, 2, 'pamela.s', '3f3ef786b34d6dd716e1812c8b74a7a0e1f05aa5f3230588f6f5bcd00c6c8392', FALSE, TRUE), -- Admin Parroquia San Miguel
(3, 3, 'juan.e', '3f3ef786b34d6dd716e1812c8b74a7a0e1f05aa5f3230588f6f5bcd00c6c8392', FALSE, TRUE), -- Trabajador Parroquia San Miguel
(4, 4, 'luis.b', '3f3ef786b34d6dd716e1812c8b74a7a0e1f05aa5f3230588f6f5bcd00c6c8392', FALSE, TRUE), -- Cliente
(5, 5, 'sofia.r', '3f3ef786b34d6dd716e1812c8b74a7a0e1f05aa5f3230588f6f5bcd00c6c8392', FALSE, TRUE); -- Admin Parroquia San Francisco

-- ====================================================================
-- INSERCIÓN DE PARROQUIAS Y CAPILLAS
-- ====================================================================

-- parish: Información de las parroquias
INSERT INTO public.parish (id, name, primary_color, secondary_color, admin_user_id, active) VALUES
(1, 'Parroquia San Miguel Arcángel', '#b1b1b1', '#424242', 2, TRUE),
(2, 'Parroquia San Francisco de Asís', '#0d47a1', '#ffc107', 5, TRUE);

-- chapel: Información de las capillas
INSERT INTO public.chapel (id, parish_id, name, coordinates, address, email, phone, profile_photo, cover_photo, active) VALUES
(1, 1, 'Capilla de la Paz', '(-12.046374, -77.042793)', 'Avenida Siempreviva 742, Ciudad del Sol', 'paz@example.com', '987654321', null, null, TRUE),
(2, 1, 'Capilla de la Esperanza', '(-12.046400, -77.042850)', 'Calle Los Jazmines 50, Ciudad del Sol', 'esperanza@example.com', '987123456', null, null, TRUE),
(3, 2, 'Capilla San Judas Tadeo', '(-12.083333, -77.083333)', 'Av. Panamericana 100, Lima', 'sanjudas@example.com', '987654123', null, null, TRUE);

-- ====================================================================
-- CONFIGURACIÓN DE ROLES Y ASIGNACIONES
-- ====================================================================

-- role: Roles por parroquia
INSERT INTO public.role (id, parish_id, name, description, active) VALUES
(1, 1, 'Administrador Parroquial', 'Gestión completa de la parroquia San Miguel', TRUE),
(2, 1, 'Sacerdote', 'Autorizado para oficiar eventos y misas', TRUE),
(3, 2, 'Coordinador de Eventos', 'Encargado de la logística de eventos en la parroquia San Francisco', TRUE);

-- role_permission: Permisos asignados a cada rol
INSERT INTO public.role_permission (id, role_id, permission_id, granted) VALUES
(1, 1, 1, TRUE), (2, 1, 2, TRUE), (3, 1, 3, TRUE), (4, 1, 5, TRUE), -- Admin con casi todo
(5, 2, 3, TRUE), -- Sacerdote gestiona reservas
(6, 3, 3, TRUE); -- Coordinador gestiona reservas

-- association: Historial de usuarios trabajando en parroquias
INSERT INTO public.association (id, user_id, parish_id, active) VALUES
(1, 2, 1, TRUE), -- Pamela en Parroquia 1
(2, 3, 1, TRUE), -- Juan en Parroquia 1
(3, 5, 2, TRUE); -- Sofia en Parroquia 2

-- user_role: Asignación de roles a usuarios dentro de una asociación
INSERT INTO public.user_role (id, association_id, role_id) VALUES
(1, 1, 1), -- Pamela es Administrador en Parroquia 1
(2, 2, 2), -- Juan es Sacerdote en Parroquia 1
(3, 3, 3); -- Sofia es Coordinador en Parroquia 2

-- ====================================================================
-- HORARIOS, EVENTOS Y RESERVAS
-- ====================================================================

-- general_schedule: Horario de atención general de las capillas
INSERT INTO public.general_schedule (id, chapel_id, day_of_week, start_time, end_time) VALUES
(1, 1, 0, '09:00:00', '13:00:00'), -- Capilla 1: Domingo de 9am a 1pm
(2, 1, 2, '10:00:00', '12:00:00'), -- Capilla 1: Martes de 10am a 12pm
(3, 3, 5, '09:30:00', '12:30:00'); -- Capilla 3: Viernes de 9:30am a 12:30pm

-- specific_schedule: Excepciones al horario general
INSERT INTO public.specific_schedule (id, chapel_id, date, start_time, end_time, exception_type, reason) VALUES
(1, 1, '2025-12-25', null, null, 'CLOSED', 'Navidad'),
(2, 3, '2025-12-24', '22:00:00', '23:59:00', 'OPEN', 'Misa de Gallo');

-- event: Catálogo de eventos base del sistema
INSERT INTO public.event (id, name, description, active) VALUES
(1, 'Bautismo', 'Ceremonia de iniciación cristiana', TRUE),
(2, 'Matrimonio', 'Sacramento del matrimonio', TRUE),
(3, 'Misa', 'Celebración litúrgica regular', TRUE);

-- chapel_event: Eventos que ofrece cada capilla
INSERT INTO public.chapel_event (id, chapel_id, event_id, active) VALUES
(1, 1, 1, TRUE), -- Capilla de la Paz ofrece Bautismo
(2, 1, 2, TRUE), -- Capilla de la Paz ofrece Matrimonio
(3, 3, 3, TRUE); -- Capilla San Judas Tadeo ofrece Misa

-- event_variant: Variantes de los eventos por capilla
INSERT INTO public.event_variant (id, chapel_event_id, name, description, current_price, max_capacity, active) VALUES
(1, 1, 'Bautismo Comunitario', 'Bautismo para varios grupos familiares', 50.00, 50, TRUE),
(2, 2, 'Matrimonio Estándar', 'Ceremonia de matrimonio sin extras', 300.00, 100, TRUE);

-- reservation: Reservas realizadas por personas
INSERT INTO public.reservation (id, event_variant_id, person_id, event_date, status, paid_amount) VALUES
(1, 1, 4, '2025-11-20 10:00:00', 'RESERVED', 50.00); -- Luis reservó un Bautismo Comunitario

-- ====================================================================
-- REQUISITOS DE EVENTOS Y RESERVAS
-- ====================================================================

-- base_requirement: Requisitos base por tipo de evento
INSERT INTO public.base_requirement (id, event_id, name, description, active) VALUES
(1, 1, 'Partida de Nacimiento del Bautizado', 'Copia de la partida de nacimiento del menor', TRUE),
(2, 1, 'Copia de DNI de los Padrinos', 'Copia de los documentos de los padrinos', TRUE);

-- chapel_event_requirement: Requisitos adicionales definidos por la capilla para un evento
INSERT INTO public.chapel_event_requirement (id, chapel_event_id, name, description, active) VALUES
(1, 1, 'Charla Pre-bautismal', 'Certificado de haber asistido a la charla pre-bautismal', TRUE);

-- reservation_requirement: Requisitos asociados a una reserva específica
INSERT INTO public.reservation_requirement (id, reservation_id, base_requirement_id, chapel_requirement_id, name, description, completed) VALUES
(1, 1, 1, NULL, 'Partida de Nacimiento del Bautizado', 'Copia de la partida de nacimiento del menor', FALSE),
(2, 1, 2, NULL, 'Copia de DNI de los Padrinos', 'Copia de los documentos de los padrinos', FALSE),
(3, 1, NULL, 1, 'Charla Pre-bautismal', 'Certificado de haber asistido a la charla pre-bautismal', FALSE);
