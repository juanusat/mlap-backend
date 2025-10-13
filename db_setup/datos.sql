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

INSERT INTO public.person (id, first_names, paternal_surname, maternal_surname, email, document, document_type_id) VALUES
(1, 'Juan', 'Espinoza', 'Milian', 'jesp@admin.net', '71309030', 1),
(2, 'Luis', 'Barboza', 'Vilchez', 'lbar@parr1.net', '71573896', 1),
(3, 'Pamela', 'Saavedra', 'Sanchez', 'pamelas@gmail.com', '74863627', 1),
(4, 'Antonio', 'Errea', 'Torres', 'antonioe@gmail.com', '73111801', 1);

INSERT INTO public.user (id, person_id, username, password_hash, is_diocese, active) VALUES
(1, 1, 'jesp@admin.net', '3f3ef786b34d6dd716e1812c8b74a7a0e1f05aa5f3230588f6f5bcd00c6c8392', TRUE, TRUE),
(2, 2, 'lbar@parr1.net', '3f3ef786b34d6dd716e1812c8b74a7a0e1f05aa5f3230588f6f5bcd00c6c8392', FALSE, TRUE),
(3, 3, 'pamelas@gmail.com', '3f3ef786b34d6dd716e1812c8b74a7a0e1f05aa5f3230588f6f5bcd00c6c8392', FALSE, TRUE),
(4, 4, 'antonioe@gmail.com', '3f3ef786b34d6dd716e1812c8b74a7a0e1f05aa5f3230588f6f5bcd00c6c8392', FALSE, TRUE);

INSERT INTO public.parish (id, name, admin_user_id, active) VALUES
(1, 'La Consolación', 2, TRUE);

INSERT INTO public.association (id, user_id, parish_id, active) VALUES
(1, 2, 1, TRUE),
(2, 3, 1, TRUE);

INSERT INTO public.role (id, parish_id, name, description, active) VALUES
(1, 1, 'Secretario(a)', 'Apoyo administrativo y de gestión en la parroquia.', TRUE);

INSERT INTO public.user_role (id, association_id, role_id) VALUES
(1, 2, 1);