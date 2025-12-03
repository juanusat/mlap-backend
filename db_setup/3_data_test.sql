-- permission: Permisos base del sistema
INSERT INTO public.permission (id, category, code, name, description) VALUES
-- Actos Litúrgicos: Gestionar actos litúrgicos
(1, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_ACTOS_C', 'Crear acto litúrgico', 'Permite crear nuevos actos litúrgicos.'),
(2, 'ACTOS LITÚRGICOS', 'ESTADO_ACTOS_LITURGICOS_U', 'Actualizar estado acto litúrgico', 'Permite cambiar el estado de los actos litúrgicos.'),
(3, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_ACTOS_R', 'Leer acto litúrgico', 'Permite visualizar los detalles de los actos litúrgicos.'),
(4, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_ACTOS_U', 'Actualizar acto litúrgico', 'Permite modificar la información de los actos litúrgGICOS.'),
(5, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_ACTOS_D', 'Eliminar acto litúrgico', 'Permite eliminar actos litúrgicos.'),

-- Actos Litúrgicos: Gestionar requisitos
(6, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_REQ_C', 'Crear requisitos', 'Permite definir nuevos requisitos para actos litúrgicos.'),
(7, 'ACTOS LITÚRGICOS', 'ESTADO_REQ_ACTOS_LIT_U', 'Actualizar estado requisitos', 'Permite cambiar el estado de los requisitos.'),
(8, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_REQ_R', 'Leer requisitos', 'Permite visualizar los requisitos definidos.'),
(9, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_REQ_U', 'Actualizar requisitos', 'Permite modificar los requisitos existentes.'),
(10, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_REQ_D', 'Eliminar requisitos', 'Permite eliminar requisitos.'),

-- Actos Litúrgicos: Gestionar horarios
(11, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_HORA_R', 'Leer horarios', 'Permite visualizar los horarios de los actos litúrgicos.'),
(12, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_HORA_C', 'Crear horario', 'Permite definir nuevos horarios de actos litúrgicos.'),
(13, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_HORA_U', 'Actualizar horario', 'Permite modificar horarios existentes.'),
(14, 'ACTOS LITÚRGICOS', 'EXCEP_DISP_R', 'Leer excepciones - Disponibilidad', 'Permite visualizar las excepciones de disponibilidad.'),
(15, 'ACTOS LITÚRGICOS', 'EXCEP_DISP_C', 'Crear Excepción - Disponibilidad', 'Permite crear excepciones de disponibilidad en el horario.'),
(16, 'ACTOS LITÚRGICOS', 'EXCEP_DISP_U', 'Actualizar Excepción - Disponibilidad', 'Permite modificar excepciones de disponibilidad existentes.'),
(17, 'ACTOS LITÚRGICOS', 'EXCEP_DISP_D', 'Eliminar Excepción - Disponibilidad', 'Permite eliminar excepciones de disponibilidad.'),
(18, 'ACTOS LITÚRGICOS', 'EXCEP_NO_DISP_R', 'Leer excepciones - NO Disponibilidad', 'Permite visualizar las excepciones de NO disponibilidad.'),
(19, 'ACTOS LITÚRGICOS', 'EXCEP_NO_DISP_C', 'Crear Excepción - NO Disponibilidad', 'Permite crear excepciones de NO disponibilidad en el horario.'),
(20, 'ACTOS LITÚRGICOS', 'EXCEP_NO_DISP_U', 'Actualizar Excepción - NO Disponibilidad', 'Permite modificar excepciones de NO disponibilidad existentes.'),
(21, 'ACTOS LITÚRGICOS', 'EXCEP_NO_DISP_D', 'Eliminar Excepción - NO Disponibilidad', 'Permite eliminar excepciones de NO disponibilidad.'),

-- Actos Litúrgicos: Gestionar Reservas (Vista TDP)
(22, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_RESER_R', 'Leer reservas', 'Permite visualizar las reservas gestionadas.'),
(23, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_RESER_U', 'Actualizar reservas', 'Permite modificar o cambiar el estado de las reservas gestionadas.'),

-- Seguridad: Gestionar cuentas
(24, 'SEGURIDAD', 'SEGURIDAD_ASOC_USER_C', 'Crear asociación usuario', 'Permite asociar un nuevo usuario al sistema.'),
(25, 'SEGURIDAD', 'ESTADO_ASOC_USER_U', 'Actualizar estado asociación usuario', 'Permite cambiar el estado de la asociación de un usuario.'),
(26, 'SEGURIDAD', 'SEGURIDAD_ASOC_USER_R', 'Leer asociación usuario', 'Permite visualizar la lista y detalles de las asociaciones de usuarios.'),
(27, 'SEGURIDAD', 'ROL_ASOC_USER_C', 'Crear rol - asociación usuario', 'Permite asignar un rol a un usuario al momento de la asociación.'),
(28, 'SEGURIDAD', 'SEGURIDAD_ASOC_USER_D', 'Eliminar asociación usuario', 'Permite desvincular o eliminar la asociación de un usuario.'),

-- Seguridad: Gestionar roles
(29, 'SEGURIDAD', 'SEGURIDAD_ROL_C', 'Crear rol', 'Permite crear nuevos roles de usuario.'),
(30, 'SEGURIDAD', 'ESTADO_ROL_U', 'Actualizar estado rol', 'Permite cambiar el estado de un rol (habilitar/deshabilitar).'),
(31, 'SEGURIDAD', 'SEGURIDAD_ROL_R', 'Leer rol', 'Permite visualizar la lista de roles existentes.'),
(32, 'SEGURIDAD', 'SEGURIDAD_ROL_PERMS_U', 'Actualizar rol - permisos', 'Permite modificar los permisos asignados a un rol.'),
(33, 'SEGURIDAD', 'SEGURIDAD_ROL_DATA_U', 'Actualizar rol', 'Permite modificar la información básica de un rol (nombre, descripción).'),
(34, 'SEGURIDAD', 'SEGURIDAD_ROL_D', 'Eliminar rol', 'Permite eliminar roles.'),

-- Parroquia: Gestionar cuenta
(35, 'PARROQUIA', 'PARROQUIA_INFO_R', 'Leer información de la parroquia', 'Permite visualizar los datos generales de la parroquia.'),
(36, 'PARROQUIA', 'PARROQUIA_INFO_U', 'Actualizar información de la parroquia', 'Permite modificar los datos generales de la parroquia.'),
(37, 'PARROQUIA', 'PARROQUIA_DATOS_CUENTA_R', 'Leer Datos de la cuenta', 'Permite visualizar la información de la cuenta bancaria/financiera de la parroquia.'),
(38, 'PARROQUIA', 'PARROQUIA_DATOS_CUENTA_U', 'Actualizar Datos de la cuenta', 'Permite modificar la información de la cuenta bancaria/financiera de la parroquia.'),

-- Parroquia: Gestionar capilla
(39, 'PARROQUIA', 'PARROQUIA_CAPILLA_C', 'Crear capilla', 'Permite registrar una nueva capilla.'),
(40, 'PARROQUIA', 'ESTADO_CAPILLA_U', 'Actualizar estado capilla', 'Permite cambiar el estado de una capilla (habilitar/deshabilitar).'),
(41, 'PARROQUIA', 'PARROQUIA_CAPILLA_R', 'Leer capilla', 'Permite visualizar el listado y detalles de las capillas.'),
(42, 'PARROQUIA', 'PARROQUIA_CAPILLA_U', 'Actualizar capilla', 'Permite modificar la información de una capilla.'),
(43, 'PARROQUIA', 'PARROQUIA_CAPILLA_D', 'Eliminar capilla', 'Permite eliminar o inhabilitar una capilla.'),

-- Actos Litúrgicos: Gestionar Pagos
(44, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_RESER_PAY_R', 'Leer pagos de reserva', 'Permite visualizar los pagos registrados para una reserva.'),
(45, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_RESER_PAY_C', 'Registrar pago de reserva', 'Permite registrar nuevos pagos para una reserva.'),

-- Reportes: Actos Litúrgicos
(46, 'REPORTES', 'ACTOS_LITURGICOS_REP01', 'Ver Reporte 01 - Actos Litúrgicos', 'Permite visualizar el reporte de reservas por capilla.'),
(47, 'REPORTES', 'ACTOS_LITURGICOS_REP02', 'Ver Reporte 02 - Actos Litúrgicos', 'Permite visualizar el reporte de reservas por rango de fechas.'),
(48, 'REPORTES', 'ACTOS_LITURGICOS_REP03', 'Ver Reporte 03 - Actos Litúrgicos', 'Permite visualizar el mapa de ocupación de horarios.'),

-- Reportes: Parroquia
(49, 'REPORTES', 'PARROQUIA_REP01', 'Ver Reporte 01 - Parroquia', 'Permite visualizar el reporte de eventos generales realizados.'),

-- Reportes: Seguridad
(50, 'REPORTES', 'SEGURIDAD_REP01', 'Ver Reporte 01 - Seguridad', 'Permite visualizar el reporte de frecuencia de roles asignados.'),

-- Actos Litúrgicos: Gestionar Reservas (Vista TDP)
(51, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_RESER_REQ_R', 'Leer requisitos de una reserva', 'Permite visualizar los requisitos de las reservas gestionadas.'),
(52, 'ACTOS LITÚRGICOS', 'ACTOS_LITURGICOS_RESER_REQ_U', 'Actualizar requisitos de una reserva', 'Permite modificar o cambiar el estado de los requisitos de una reserva.');


-- document_type: Tipos de documento de identidad
INSERT INTO public.document_type (id, code, name, active, description, created_at, updated_at) VALUES
(1, 'DNI', 'Documento Nacional de Identidad', TRUE, 'Documento principal de identificación para ciudadanos.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ====================================================================
-- INSERCIÓN DE PERSONAS Y USUARIOS
-- ====================================================================

INSERT INTO public.person (id, first_names, paternal_surname, maternal_surname, email, document, document_type_id) VALUES
(1, 'Juan', 'Espinoza', 'Milian', 'jesp@admin.net', '71309030', 1);

INSERT INTO public.user (id, person_id, username, password_hash, is_diocese, active) VALUES
(1, 1, 'jesp@admin.net', '3f3ef786b34d6dd716e1812c8b74a7a0e1f05aa5f3230588f6f5bcd00c6c8392', TRUE, TRUE);