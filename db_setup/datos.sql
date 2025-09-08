-- permission
INSERT INTO public.permission (id, code, name, description, category) VALUES
(1, 'CREATE_USER', 'Crear Usuario', 'Permite a un usuario crear nuevas cuentas de usuario', 'USUARIOS'),
(2, 'EDIT_PARISH', 'Editar Parroquia', 'Permite a un usuario modificar la información de una parroquia', 'CONFIGURACION'),
(3, 'MANAGE_RESERVATIONS', 'Gestionar Reservas', 'Permite a un usuario aceptar, rechazar o cancelar reservas', 'RESERVAS'),
(4, 'VIEW_REPORTS', 'Ver Informes', 'Acceso a reportes estadísticos del sistema', 'CONFIGURACION'),
(5, 'MANAGE_ROLES', 'Gestionar Roles', 'Permite crear, editar y eliminar roles y permisos', 'CONFIGURACION');

-- document_type
INSERT INTO public.document_type (id, code, name, active) VALUES
(1, 'DNI', 'Documento Nacional de Identidad', TRUE),
(2, 'PASAPORTE', 'Pasaporte', TRUE),
(3, 'CE', 'Carné de Extranjería', TRUE);

-- person
INSERT INTO public.person (id, first_names, paternal_surname, maternal_surname, email, document, document_type_id) VALUES
(1, 'Antonio', 'Errea', 'Torres', 'antonio.errea@example.com', '12345678', 1),
(2, 'Pamela', 'Saavedra', 'Sanchez', 'pamela.saavedra@example.com', '87654321', 1),
(3, 'Juan', 'Espinoza', 'Milian', 'juan.espinoza@example.com', '98765432', 2),
(4, 'Luis', 'Barboza', 'Vilchez', 'luis.barboza@example.com', '11223344', 1),
(5, 'Sofia', 'Ramos', 'Vargas', 'sofia.ramos@example.com', '55544433', 1),
(6, 'Carlos', 'Gomez', 'Mendoza', 'carlos.gomez@example.com', '22211100', 1),
(7, 'Andrea', 'Castro', 'Ruiz', 'andrea.castro@example.com', '99988877', 1),
(8, 'Pedro', 'Lopez', 'Fernandez', 'pedro.lopez@example.com', '66677788', 2),
(9, 'Maria', 'Soto', 'Quiroz', 'maria.soto@example.com', '12312312', 1),
(10, 'Javier', 'Perez', 'Chavez', 'javier.perez@example.com', '98765410', 1),
(11, 'Lucia', 'Morales', 'Rojas', 'lucia.morales@example.com', '10101010', 3);

-- user
INSERT INTO public.user (id, person_id, username, password_hash, is_diocese, active) VALUES
(1, 1, 'antonio.e', 'hashed_password_1', TRUE, TRUE),
(2, 2, 'pamela.s', 'hashed_password_2', FALSE, TRUE),
(3, 3, 'juan.e', 'hashed_password_3', FALSE, TRUE),
(4, 4, 'luis.b', 'hashed_password_4', FALSE, TRUE),
(5, 5, 'sofia.r', 'hashed_password_5', FALSE, TRUE),
(6, 6, 'carlos.g', 'hashed_password_6', FALSE, TRUE),
(7, 7, 'andrea.c', 'hashed_password_7', FALSE, TRUE),
(8, 8, 'pedro.l', 'hashed_password_8', FALSE, TRUE),
(9, 9, 'maria.s', 'hashed_password_9', FALSE, TRUE),
(10, 10, 'javier.p', 'hashed_password_10', FALSE, TRUE),
(11, 11, 'lucia.m', 'hashed_password_11', FALSE, TRUE);

-- parish
INSERT INTO public.parish (id, name, address, coordinates, email, phone, primary_color, secondary_color, admin_user_id) VALUES
(1, 'Parroquia San Miguel Arcángel', 'Calle Falsa 123, Ciudad del Sol', '(-12.046374, -77.042793)', 'sanmiguel@example.com', '998877665', '#b1b1b1', '#424242', 2),
(2, 'Parroquia San Francisco de Asís', 'Av. De los Incas 456, Lima', '(-12.083333, -77.083333)', 'sanfrancisco@example.com', '991122334', '#0d47a1', '#ffc107', 5),
(3, 'Parroquia del Sagrado Corazón', 'Jr. Arequipa 789, Cusco', '(-13.518333, -71.970278)', 'sagradocorazon@example.com', '995566778', '#b71c1c', '#eceff1', 6),
(4, 'Parroquia de la Santísima Trinidad', 'Calle El Sol 210, Trujillo', '(-8.109015, -79.020464)', 'santatrinidad@example.com', '993322110', '#1b5e20', '#c8e6c9', 7),
(5, 'Parroquia Nuestra Señora de la Asunción', 'Av. La Marina 500, Callao', '(-12.062083, -77.112101)', 'asuncion@example.com', '987654321', '#4a148c', '#e1bee7', 8);

-- chapel
INSERT INTO public.chapel (id, parish_id, name, address, phone) VALUES
(1, 1, 'Capilla de la Paz', 'Avenida Siempreviva 742', '987654321'),
(2, 2, 'Capilla de la Esperanza', 'Calle Los Jazmines 50, Lima', '987123456'),
(3, 2, 'Capilla San Judas Tadeo', 'Av. Panamericana 100, Lima', '987654123'),
(4, 3, 'Capilla Santa Rosa de Lima', 'Plaza de Armas S/N, Cusco', '998765432');

-- role
INSERT INTO public.role (id, parish_id, name, description) VALUES
(1, 1, 'Administrador', 'Encargado de la gestión de la parroquia'),
(2, 1, 'Sacerdote', 'Autorizado para realizar eventos y misas'),
(3, 1, 'Trabajador', 'Personal de apoyo para la gestión de reservas'),
(4, 2, 'Coordinador de Eventos', 'Encargado de la logística de eventos en la capilla'),
(5, 3, 'Secretario Parroquial', 'Maneja la administración de la parroquia'),
(6, 2, 'Voluntario', 'Apoyo en tareas administrativas y de organización');

-- role_permission
INSERT INTO public.role_permission (id, role_id, permission_id) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 4),
(5, 4, 3),
(6, 5, 2),
(7, 6, 3);

-- association
INSERT INTO public.association (id, user_id, parish_id, active) VALUES
(1, 2, 1, TRUE),
(2, 3, 1, TRUE),
(3, 7, 2, TRUE),
(4, 8, 3, TRUE),
(5, 9, 2, TRUE),
(6, 10, 1, TRUE),
(7, 11, 2, TRUE);

-- user_role
INSERT INTO public.user_role (id, association_id, role_id) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 4),
(4, 4, 5),
(5, 5, 2),
(6, 6, 3),
(7, 7, 6);

-- HORARIOS Y EVENTOS
-- general_schedule
INSERT INTO public.general_schedule (id, chapel_id, day_of_week, start_time, end_time) VALUES
(1, 1, 0, '09:00:00', '13:00:00'),
(2, 1, 2, '10:00:00', '12:00:00'),
(3, 1, 4, '16:00:00', '18:00:00'),
(4, 2, 1, '10:00:00', '14:00:00'),
(5, 2, 3, '15:00:00', '18:00:00'),
(6, 3, 0, '11:00:00', '13:00:00'),
(7, 4, 5, '09:30:00', '12:30:00');

-- specific_schedule
INSERT INTO public.specific_schedule (id, chapel_id, date, start_time, end_time, exception_type, reason) VALUES
(1, 1, '2025-12-25', null, null, 'CLOSED', 'Navidad'),
(2, 2, '2025-12-31', null, null, 'CLOSED', 'Fin de Año'),
(3, 3, '2025-12-24', '22:00:00', '23:59:00', 'OPEN', 'Misa de Gallo');

-- event
INSERT INTO public.event (id, name, description) VALUES
(1, 'Bautismo', 'Ceremonia de iniciación cristiana'),
(2, 'Matrimonio', 'Sacramento del matrimonio'),
(3, 'Misa', 'Celebración litúrgica regular'),
(4, 'Confirmación', 'Sacramento de la confirmación cristiana'),
(5, 'Comunión', 'Primera Comunión');

-- chapel_event
INSERT INTO public.chapel_event (id, chapel_id, event_id) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 2, 4),
(5, 3, 1),
(6, 3, 4),
(7, 1, 5),
(8, 2, 5);

-- event_variant
INSERT INTO public.event_variant (id, chapel_event_id, name, description, current_price, max_capacity, preparation_time) VALUES
(1, 1, 'Bautismo Privado', 'Bautismo para un solo grupo familiar', 150.00, 20, '1 hour'),
(2, 1, 'Bautismo Comunitario', 'Bautismo para varios grupos familiares', 50.00, 50, '30 minutes'),
(3, 2, 'Matrimonio Estándar', 'Ceremonia de matrimonio sin extras', 300.00, 100, '2 hours'),
(4, 4, 'Confirmación Regular', 'Confirmación grupal para jóvenes', 80.00, 40, '1 hour'),
(5, 5, 'Bautismo Ceremonial', 'Ceremonia de bautismo tradicional', 120.00, 15, '45 minutes'),
(6, 6, 'Confirmación Especial', 'Confirmación para adultos', 90.00, 25, '1 hour'),
(7, 7, 'Primera Comunión Grupal', 'Celebración de la comunión en grupo', 75.00, 30, '1 hour'),
(8, 8, 'Primera Comunión Individual', 'Ceremonia de comunión personalizada', 110.00, 10, '1 hour 30 minutes');

-- reservation
INSERT INTO public.reservation (id, event_variant_id, person_id, event_date, status, paid_amount) VALUES
(1, 1, 4, '2025-11-20 10:00:00', 'RESERVED', 150.00),
(2, 4, 4, '2025-11-22 15:30:00', 'RESERVED', 80.00),
(3, 5, 9, '2025-11-28 11:00:00', 'IN_PROGRESS', 60.00),
(4, 7, 10, '2025-12-05 16:00:00', 'COMPLETED', 75.00),
(5, 8, 11, '2025-12-10 17:30:00', 'FULFILLED', 110.00);

-- base_requirement
INSERT INTO public.base_requirement (id, event_id, name, description) VALUES
(1, 1, 'Partida de Nacimiento del Bautizado', 'Copia de la partida de nacimiento del menor'),
(2, 1, 'Copia de DNI de los Padrinos', 'Copia de los documentos de los padrinos'),
(3, 4, 'Certificado de Bautismo', 'Copia del certificado de bautismo'),
(4, 4, 'Copia de DNI del Confirmado', 'Copia del documento de identidad'),
(5, 5, 'Certificado de Bautismo', 'Copia del certificado de bautismo');

-- chapel_event_requirement
INSERT INTO public.chapel_event_requirement (id, chapel_event_id, name, description) VALUES
(1, 1, 'Charla Pre-bautismal', 'Certificado de haber asistido a la charla pre-bautismal'),
(2, 4, 'Entrevista con el Párroco', 'Reunión previa para los confirmandos'),
(3, 7, 'Constancia de Preparación', 'Certificado de asistencia a la preparación para la comunión');

-- reservation_requirement
INSERT INTO public.reservation_requirement (id, reservation_id, base_requirement_id, chapel_requirement_id, name, description, completed) VALUES
(1, 1, 1, NULL, 'Partida de Nacimiento del Bautizado', 'Copia de la partida de nacimiento del menor', FALSE),
(2, 1, 2, NULL, 'Copia de DNI de los Padrinos', 'Copia de los documentos de los padrinos', FALSE),
(3, 1, NULL, 1, 'Charla Pre-bautismal', 'Certificado de haber asistido a la charla pre-bautismal', FALSE),
(4, 2, 3, NULL, 'Certificado de Bautismo', 'Copia del certificado de bautismo', FALSE),
(5, 2, 4, NULL, 'Copia de DNI del Confirmado', 'Copia del documento de identidad', FALSE),
(6, 2, NULL, 2, 'Entrevista con el Párroco', 'Reunión previa para los confirmandos', FALSE),
(7, 4, 5, NULL, 'Certificado de Bautismo', 'Copia del certificado de bautismo', TRUE),
(8, 4, NULL, 3, 'Constancia de Preparación', 'Certificado de asistencia a la preparación para la comunión', TRUE),
(9, 5, 5, NULL, 'Certificado de Bautismo', 'Copia del certificado de bautismo', TRUE),
(10, 5, NULL, 3, 'Constancia de Preparación', 'Certificado de asistencia a la preparación para la comunión', TRUE);