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

INSERT INTO public.chapel (id, parish_id, name, coordinates, address, email, phone, profile_photo, cover_photo, chapel_base, active) VALUES 
(1, 1, 'La Consolación', '-12.0464, -77.0428', 'Av. Garcilaso de la Vega 1500, Lima', 
'conso.la@parroquia.org', '+51 1 4567890', 'chapel_profile.jpg', 'chapel_cover.jpg', TRUE, TRUE),
(2, 1, 'Nuestra Señora del Carmen', '-12.0917, -77.0253', 'Calle Junín 320, Barranco', 
'carmen.lc@parroquia.org', '+51 1 9876543', 'chapel_profile.jpg', 'chapel_cover.jpg', FALSE, TRUE),
(3, 1, 'Santa Rosa de Lima', '-11.995, -77.078', 'Jr. Callao 800, Cercado de Lima', 
'santarosa.lc@parroquia.org', '+51 1 3210987', 'chapel_profile.jpg', 'chapel_cover.jpg', FALSE, TRUE);


INSERT INTO public.association (id, user_id, parish_id, active) VALUES
(1, 2, 1, TRUE),
(2, 3, 1, TRUE);

INSERT INTO public.role (id, parish_id, name, description, active) VALUES
(1, 1, 'Secretario(a)', 'Apoyo administrativo y de gestión en la parroquia.', TRUE),
(2, 1, 'Notario(a)', 'Apoyo administrativo y de gestión en la parroquia.', TRUE);

INSERT INTO public.user_role (id, association_id, role_id) VALUES
(1, 2, 1),
(2, 2, 2); 

-------------------------------------------------------------------
-- Eventos BASE -- 
INSERT INTO public.event (id, name, description, active) VALUES
(1, 'Bautismo', 'Sacramento de iniciación cristiana.', TRUE),
(2, 'Primera Comunión', 'Celebración de la Eucaristía por primera vez.', TRUE),
(3, 'Confirmación', 'Sacramento que fortalece la gracia del bautismo.', TRUE),
(4, 'Matrimonio', 'Sacramento de la unión conyugal.', TRUE),
(5, 'Misa Dominical', 'Eucaristía regular del domingo.', TRUE),
(6, 'Funeral / Exequias', 'Celebración para difuntos.', TRUE),
(7, 'Catequesis', 'Proceso formativo para sacramentos.', TRUE),
(8, 'Bendición de Casa', 'Servicio de bendición para propiedades.', TRUE),
(9, 'Encuentro Pastoral', 'Reunión de grupos o movimientos pastorales.', TRUE),
(10, 'Hora Santa / Adoración', 'Tiempo dedicado a la adoración eucarística.', TRUE); 

-- Requisitos BASE de Eventos BASE -- 
INSERT INTO public.base_requirement (id, event_id, name, description, active) VALUES
(1, 1, 'Registro Civil del Niño', 'Copia fiel del registro civil de nacimiento.', TRUE),
(2, 1, 'Cédulas de Padrinos', 'Copia de documento de identidad de los padrinos.', TRUE),
(3, 1, 'Certificado de Matrimonio Eclesiástico', 'Para padres casados por la Iglesia.', TRUE),
(4, 1, 'Certificado de Charla Prebautismal', 'Comprobante de asistencia de los padres y padrinos.', TRUE),
(5, 1, 'Licencia Parroquial', 'Documento de permiso si los padres no residen en la jurisdicción.', TRUE),
(6, 1, 'Ficha de Datos de Contacto', 'Formulario con información de contacto de padres y padrinos.', TRUE),
(7, 1, 'Copia Libro de Bautismo de Padrinos', 'Copia del acta de bautismo de los padrinos.', TRUE),
(8, 1, 'Permiso de Obispado', 'Documento requerido en casos especiales y excepciones.', TRUE),
(9, 1, 'Comprobante de Ofrenda', 'Recibo o constancia de pago de la ofrenda establecida.', TRUE),
(10, 1, 'Ficha de Solicitud de Bautismo', 'Formulario de solicitud de sacramento diligenciado.', TRUE);

INSERT INTO public.base_requirement (id, event_id, name, description, active) VALUES
(11, 2, 'Certificado de Bautismo', 'Copia del certificado de bautismo.', TRUE),
(12, 2, 'Constancia de Catequesis', 'Certificado de haber completado el ciclo de catequesis.', TRUE),
(13, 2, 'Ficha de Inscripción', 'Formulario de registro del niño/a.', TRUE),
(14, 2, 'Foto Tipo Carnet', 'Una foto reciente del niño/a.', TRUE),
(15, 2, 'Acta de Entrevista con el Párroco', 'Documento que confirma la idoneidad y fecha de la entrevista.', TRUE),
(16, 2, 'Documento de Compromiso de Padres', 'Documento firmado por los padres.', TRUE),
(17, 2, 'Copia de Documento del Representante', 'Copia del DNI/Cédula del acudiente.', TRUE),
(18, 2, 'Paz y Salvo Parroquial', 'Certificado de que no hay deudas o pendientes (si viene de otra parroquia).', TRUE),
(19, 2, 'Formulario de Datos de Contacto Tutor', 'Teléfono y email de contacto principal.', TRUE),
(20, 2, 'Recibo de Inscripción', 'Comprobante de pago de la inscripción.', TRUE); 

INSERT INTO public.base_requirement (id, event_id, name, description, active) VALUES
(21, 3, 'Certificado de Bautismo', 'Copia del certificado de bautismo.', TRUE),
(22, 3, 'Certificado de Primera Comunión', 'Copia del certificado de Primera Comunión.', TRUE),
(23, 3, 'Certificado de Asistencia a Catequesis', 'Comprobante del ciclo de preparación.', TRUE),
(24, 3, 'Documento de Identidad del Joven', 'Copia del documento de identidad.', TRUE),
(25, 3, 'Copia de Padrinos (Confirmados)', 'Copia de DNI/Cédula del padrino/madrina.', TRUE),
(26, 3, 'Carta de Solicitud', 'Carta firmada solicitando el sacramento.', TRUE),
(27, 3, 'Acta de Compromiso del Confirmando', 'Documento de compromiso firmado por el joven.', TRUE),
(28, 3, 'Licencia Parroquial', 'Permiso si no reside en la zona.', TRUE),
(29, 3, 'Comprobante de Ofrenda por el Sacramento', 'Comprobante de ofrenda.', TRUE),
(30, 3, 'Ficha de Datos de Contacto Padrinos', 'Información de contacto de los padrinos.', TRUE);

INSERT INTO public.base_requirement (id, event_id, name, description, active) VALUES
(31, 4, 'Partida de Bautismo Actualizada', 'De ambos contrayentes, reciente (máx. 3 meses).', TRUE),
(32, 4, 'Partida de Confirmación', 'De ambos contrayentes.', TRUE),
(33, 4, 'Documentos de Identidad', 'Copia de DNI/Cédula de ambos contrayentes.', TRUE),
(34, 4, 'Certificado de Curso Prematrimonial', 'Constancia de asistencia al curso.', TRUE),
(35, 4, 'Ficha de Testigos', 'Datos y copia de cédula de dos testigos (mayores de edad).', TRUE),
(36, 4, 'Certificado de Soltería', 'Declaración jurada o documento legal que lo confirme.', TRUE),
(37, 4, 'Comprobante de Avisos Parroquiales', 'Comprobante de publicación de avisos (si aplica).', TRUE),
(38, 4, 'Licencia Matrimonial', 'Si uno de los novios es de otra jurisdicción.', TRUE),
(39, 4, 'Recibo de Estipendio', 'Comprobante del pago del estipendio matrimonial.', TRUE),
(40, 4, 'Compromiso Acta Civil', 'Documento que compromete a presentar acta de matrimonio civil.', TRUE); 

INSERT INTO public.base_requirement (id, event_id, name, description, active) VALUES
(41, 5, 'Ficha de Registro de Asistencia', 'Formulario de registro de ingreso para control de aforo.', FALSE),
(42, 5, 'Comprobante de Ofrenda', 'Recibo o constancia de la ofrenda económica entregada.', TRUE); 

INSERT INTO public.base_requirement (id, event_id, name, description, active) VALUES
(43, 6, 'Certificado de Defunción', 'Copia del certificado oficial de defunción.', TRUE),
(44, 6, 'Identificación del Solicitante', 'Copia del documento de identidad de quien solicita.', TRUE),
(45, 6, 'Partida de Bautismo del Difunto', 'Si está disponible.', TRUE),
(46, 6, 'Formulario de Solicitud de Exequias', 'Detalles logísticos del entierro o cremación.', TRUE),
(47, 6, 'Datos de Contacto de la Funeraria', 'Información de la empresa fúnebre a cargo.', TRUE),
(48, 6, 'Declaración de Tipo de Rito', 'Formulario especificando si es Misa de cuerpo presente o solo exequias.', TRUE),
(49, 6, 'Ficha de Elección de Lecturas', 'Selección de lecturas bíblicas (si aplica).', FALSE),
(50, 6, 'Testimonio de Vida (Opcional)', 'Nota o documento breve sobre la vida del difunto.', FALSE),
(51, 6, 'Comprobante de Estipendio de Misa', 'Comprobante de pago del estipendio.', TRUE),
(52, 6, 'Aprobación de la Diócesis', 'Documento de aprobación en casos especiales o fuera de horario.', TRUE); 

INSERT INTO public.base_requirement (id, event_id, name, description, active) VALUES
(53, 7, 'Ficha de Matrícula', 'Formulario de inscripción completo del estudiante.', TRUE),
(54, 7, 'Certificado de Bautismo', 'Copia del certificado de bautismo (si aplica).', TRUE),
(55, 7, 'Comprobante de Cuota de Materiales', 'Recibo de pago de los materiales de estudio.', TRUE),
(56, 7, 'Documento de Compromiso de Padres', 'Documento firmado por el acudiente aceptando las normas.', TRUE),
(57, 7, 'Copia de DNI del Estudiante', 'Para registro interno de identidad.', FALSE),
(58, 7, 'Comprobante de Adquisición de Libro', 'Recibo o factura de la adquisición del libro de texto.', TRUE),
(59, 7, 'Ficha Médica Relevante', 'Documento con información de alergias o condiciones de salud.', FALSE); 

INSERT INTO public.base_requirement (id, event_id, name, description, active) VALUES
(60, 8, 'Acta de Solicitud de Bendición', 'Documento que incluye la dirección y detalles de la propiedad.', TRUE),
(61, 8, 'Formulario de Datos de Contacto Propietario', 'Nombre, teléfono y email de contacto.', TRUE),
(62, 8, 'Comprobante de Ofrenda de Agradecimiento', 'Recibo de ofrenda sugerida por la bendición.', TRUE),
(63, 8, 'Documento de Residencia', 'Acreditación de residencia dentro de la jurisdicción parroquial.', TRUE); 

INSERT INTO public.base_requirement (id, event_id, name, description, active) VALUES
(64, 9, 'Agenda Oficial del Encuentro', 'Documento detallando los temas, horarios y objetivos.', TRUE),
(65, 9, 'Ficha de Solicitud y Responsable', 'Documento que identifica al coordinador y el propósito del grupo.', TRUE),
(66, 9, 'Acuerdo de Uso de Instalaciones', 'Documento firmado por el coordinador sobre las normas del espacio.', TRUE),
(67, 9, 'Aprobación Escrita del Párroco', 'Documento formal con el permiso directo del administrador de la parroquia.', TRUE),
(68, 9, 'Comprobante de Tasa de Uso', 'Recibo de pago por el uso de las instalaciones parroquiales.', TRUE); 

INSERT INTO public.base_requirement (id, event_id, name, description, active) VALUES
(69, 10, 'Guía Oficial de Oración', 'Documento o libreto con las meditaciones y oraciones a seguir.', FALSE),
(70, 10, 'Acta de Permiso de Exposición', 'Documento que aprueba la exposición solemne del Santísimo.', TRUE),
(71, 10, 'Lista Formal de Intenciones', 'Documento que contiene las intenciones de oración a presentar durante el rito.', FALSE);

