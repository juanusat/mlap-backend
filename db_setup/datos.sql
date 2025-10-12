-- permission: Permisos base del sistema
INSERT INTO public.permission (id, code, name, description, category) VALUES
-- Actos Litúrgicos: Gestionar actos litúrgicos
(1, 'C_ACTOS_LITURGICOS_ACTOS', 'Crear acto litúrgico', 'Permite crear nuevos actos litúrgicos.', 'ACTOS LITÚRGICOS'),
(2, 'U_ESTADO_ACTOS_LITURGICOS', 'Actualizar estado acto litúrgico', 'Permite cambiar el estado de los actos litúrgicos.', 'ACTOS LITÚRGICOS'),
(3, 'R_ACTOS_LITURGICOS_ACTOS', 'Leer acto litúrgico', 'Permite visualizar los detalles de los actos litúrgicos.', 'ACTOS LITÚRGICOS'),
(4, 'U_ACTOS_LITURGICOS_ACTOS', 'Actualizar acto litúrgico', 'Permite modificar la información de los actos litúrgicos.', 'ACTOS LITÚRGICOS'),
(5, 'D_ACTOS_LITURGICOS_ACTOS', 'Eliminar acto litúrgico', 'Permite eliminar actos litúrgicos.', 'ACTOS LITÚRGICOS'),

-- Actos Litúrgicos: Gestionar requisitos
(6, 'C_ACTOS_LITURGICOS_REQ', 'Crear requisitos', 'Permite definir nuevos requisitos para actos litúrgicos.', 'ACTOS LITÚRGICOS'),
(7, 'U_ESTADO_REQ_ACTOS_LIT', 'Actualizar estado requisitos', 'Permite cambiar el estado de los requisitos.', 'ACTOS LITÚRGICOS'),
(8, 'R_ACTOS_LITURGICOS_REQ', 'Leer requisitos', 'Permite visualizar los requisitos definidos.', 'ACTOS LITÚRGICOS'),
(9, 'U_ACTOS_LITURGICOS_REQ', 'Actualizar requisitos', 'Permite modificar los requisitos existentes.', 'ACTOS LITÚRGICOS'),
(10, 'D_ACTOS_LITURGICOS_REQ', 'Eliminar requisitos', 'Permite eliminar requisitos.', 'ACTOS LITÚRGICOS'),

-- Actos Litúrgicos: Gestionar horarios
(11, 'C_ACTOS_LITURGICOS_HORA', 'Crear horario', 'Permite definir nuevos horarios de actos litúrgicos.', 'ACTOS LITÚRGICOS'),
(12, 'U_ACTOS_LITURGICOS_HORA', 'Actualizar horario', 'Permite modificar horarios existentes.', 'ACTOS LITÚRGICOS'),
(13, 'C_EXCEP_DISP', 'Crear Excepción - Disponibilidad', 'Permite crear excepciones de disponibilidad en el horario.', 'ACTOS LITÚRGICOS'),
(14, 'U_EXCEP_DISP', 'Actualizar Excepción - Disponibilidad', 'Permite modificar excepciones de disponibilidad existentes.', 'ACTOS LITÚRGICOS'),
(15, 'D_EXCEP_DISP', 'Eliminar Excepción - Disponibilidad', 'Permite eliminar excepciones de disponibilidad.', 'ACTOS LITÚRGICOS'),
(16, 'C_EXCEP_NO_DISP', 'Crear Excepción NO - Disponibilidad', 'Permite crear excepciones de NO disponibilidad en el horario.', 'ACTOS LITÚRGICOS'),
(17, 'U_EXCEP_NO_DISP', 'Actualizar Excepción NO - Disponibilidad', 'Permite modificar excepciones de NO disponibilidad existentes.', 'ACTOS LITÚRGICOS'),
(18, 'D_EXCEP_NO_DISP', 'Eliminar Excepción NO - Disponibilidad', 'Permite eliminar excepciones de NO disponibilidad.', 'ACTOS LITÚRGICOS'),

-- Actos Litúrgicos: Gestionar Reservas
(19, 'R_ACTOS_LITURGICOS_RESER', 'Leer reservas', 'Permite visualizar las reservas gestionadas.', 'ACTOS LITÚRGICOS'),
(20, 'U_ACTOS_LITURGICOS_RESER', 'Actualizar reservas', 'Permite modificar o cambiar el estado de las reservas gestionadas.', 'ACTOS LITÚRGICOS'),

-- Reservas: Reservas pendientes
(21, 'D_RESERVAS_PEND', 'Eliminar reserva (Pendientes)', 'Permite eliminar o rechazar reservas que están pendientes de aprobación.', 'RESERVAS'),

-- Reservas: Historial de reservas
(22, 'R_RESERVAS_HIST', 'Leer reserva (Historial)', 'Permite visualizar el historial completo de una reserva.', 'RESERVAS'),

-- Reservas: Reservar evento
(23, 'C_RESERVAS_EVENTO', 'Crear reserva', 'Permite generar una nueva solicitud de reserva de evento.', 'RESERVAS'),

-- Seguridad: Gestionar cuentas
(24, 'C_SEGURIDAD_ASOC_USER', 'Crear asociación usuario', 'Permite asociar un nuevo usuario al sistema.', 'SEGURIDAD'),
(25, 'U_ESTADO_ASOC_USER', 'Actualizar estado asociación usuario', 'Permite cambiar el estado de la asociación de un usuario.', 'SEGURIDAD'),
(26, 'R_SEGURIDAD_ASOC_USER', 'Leer asociación usuario', 'Permite visualizar la lista y detalles de las asociaciones de usuarios.', 'SEGURIDAD'),
(27, 'C_ROL_ASOC_USER', 'Crear rol - asociación usuario', 'Permite asignar un rol a un usuario al momento de la asociación.', 'SEGURIDAD'),
(28, 'D_SEGURIDAD_ASOC_USER', 'Eliminar asociación usuario', 'Permite desvincular o eliminar la asociación de un usuario.', 'SEGURIDAD'),

-- Seguridad: Gestionar roles
(29, 'C_SEGURIDAD_ROL', 'Crear rol', 'Permite crear nuevos roles de usuario.', 'SEGURIDAD'),
(30, 'U_ESTADO_ROL', 'Actualizar estado rol', 'Permite cambiar el estado de un rol (habilitar/deshabilitar).', 'SEGURIDAD'),
(31, 'R_SEGURIDAD_ROL', 'Leer rol', 'Permite visualizar la lista de roles existentes.', 'SEGURIDAD'),
(32, 'U_SEGURIDAD_ROL_PERMS', 'Actualizar rol - permisos', 'Permite modificar los permisos asignados a un rol.', 'SEGURIDAD'),
(33, 'U_SEGURIDAD_ROL_DATA', 'Actualizar rol', 'Permite modificar la información básica de un rol (nombre, descripción).', 'SEGURIDAD'),
(34, 'D_SEGURIDAD_ROL', 'Eliminar rol', 'Permite eliminar roles.', 'SEGURIDAD'),

-- Parroquia: Gestionar cuenta
(35, 'R_PARROQUIA_INFO', 'Leer información de la parroquia', 'Permite visualizar los datos generales de la parroquia.', 'PARROQUIA'),
(36, 'U_PARROQUIA_INFO', 'Actualizar información de la parroquia', 'Permite modificar los datos generales de la parroquia.', 'PARROQUIA'),
(37, 'R_PARROQUIA_DATOS_CUENTA', 'Leer Datos de la cuenta', 'Permite visualizar la información de la cuenta bancaria/financiera de la parroquia.', 'PARROQUIA'),
(38, 'U_PARROQUIA_DATOS_CUENTA', 'Actualizar Datos de la cuenta', 'Permite modificar la información de la cuenta bancaria/financiera de la parroquia.', 'PARROQUIA'),

-- Parroquia: Gestionar capilla
(39, 'C_PARROQUIA_CAPILLA', 'Crear capilla', 'Permite registrar una nueva capilla.', 'PARROQUIA'),
(40, 'U_ESTADO_CAPILLA', 'Actualizar estado capilla', 'Permite cambiar el estado de una capilla (habilitar/deshabilitar).', 'PARROQUIA'),
(41, 'R_PARROQUIA_CAPILLA', 'Leer capilla', 'Permite visualizar el listado y detalles de las capillas.', 'PARROQUIA'),
(42, 'U_PARROQUIA_CAPILLA', 'Actualizar capilla', 'Permite modificar la información de una capilla.', 'PARROQUIA'),
(43, 'D_PARROQUIA_CAPILLA', 'Eliminar capilla', 'Permite eliminar o inhabilitar una capilla.', 'PARROQUIA');

-- document_type: Tipos de documento de identidad
INSERT INTO public.document_type (id, code, name, active, description, created_at, updated_at) VALUES
(1, 'DNI', 'Documento Nacional de Identidad', TRUE, 'Documento principal de identificación para ciudadanos.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'PASAPORTE', 'Pasaporte', TRUE, 'Documento de identificación utilizado para viajes internacionales.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'CE', 'Carné de Extranjería', TRUE, 'Documento de identificación para residentes extranjeros en el país.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


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
