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
(43, 'PARROQUIA', 'PARROQUIA_CAPILLA_D', 'Eliminar capilla', 'Permite eliminar o inhabilitar una capilla.');

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

INSERT INTO public.parish (id, name, primary_color, secondary_color, admin_user_id, active) VALUES
(1, 'La Consolación', '#4A90E2', '#2C5F8D', 2, TRUE); 

INSERT INTO public.chapel (id, parish_id, name, coordinates, address, email, phone, profile_photo, cover_photo, chapel_base, active) VALUES 
(1, 1, 'La Consolación', '-6.770125, -79.845820', 'Av. Garcilaso de la Vega 1500, Lima', 
'conso.la@parroquia.org', '+51 1 4567890', 'chapel_cover_0001.jpg', 'chapel_cover_0001.jpg', TRUE, TRUE),
(2, 1, 'Nuestra Señora del Carmen', '-6.775430, -79.852140', 'Calle Junín 320, Barranco', 
'carmen.lc@parroquia.org', '+51 1 9876543', 'chapel_cover_0002.jpg', 'chapel_cover_0002.jpg', FALSE, TRUE),
(3, 1, 'Santa Rosa de Lima', '-6.780650, -79.858760', 'Jr. Callao 800, Cercado de Lima', 
'santarosa.lc@parroquia.org', '+51 1 3210987', 'chapel_cover_0003.jpg', 'chapel_cover_0003.jpg', FALSE, TRUE);


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


-- ====================================================================
-- DATOS ADICIONALES DE PRUEBA
-- ====================================================================

-- Nuevas personas (feligreses)
INSERT INTO public.person (id, first_names, paternal_surname, maternal_surname, email, document, document_type_id) VALUES
(5, 'María', 'Gonzales', 'Ramos', 'mariag@gmail.com', '70254896', 1),
(6, 'Carlos', 'Mendoza', 'Lopez', 'carlosm@gmail.com', '72156374', 1);

-- Nuevos usuarios feligreses
INSERT INTO public.user (id, person_id, username, password_hash, is_diocese, active) VALUES
(5, 5, 'mariag@gmail.com', '3f3ef786b34d6dd716e1812c8b74a7a0e1f05aa5f3230588f6f5bcd00c6c8392', FALSE, TRUE),
(6, 6, 'carlosm@gmail.com', '3f3ef786b34d6dd716e1812c8b74a7a0e1f05aa5f3230588f6f5bcd00c6c8392', FALSE, TRUE);

-- Personas administradoras de las nuevas parroquias
INSERT INTO public.person (id, first_names, paternal_surname, maternal_surname, email, document, document_type_id) VALUES
(7, 'Pedro', 'Ramirez', 'Castro', 'pramirez@parr2.net', '71429856', 1),
(8, 'Ana', 'Torres', 'Flores', 'atorres@parr3.net', '72558963', 1),
(9, 'Roberto', 'Silva', 'Vargas', 'rsilva@parr4.net', '70896542', 1),
(10, 'Sofia', 'Morales', 'Diaz', 'smorales@parr5.net', '73254789', 1);

-- Usuarios administradores de parroquias
INSERT INTO public.user (id, person_id, username, password_hash, is_diocese, active) VALUES
(7, 7, 'pramirez@parr2.net', '3f3ef786b34d6dd716e1812c8b74a7a0e1f05aa5f3230588f6f5bcd00c6c8392', FALSE, TRUE),
(8, 8, 'atorres@parr3.net', '3f3ef786b34d6dd716e1812c8b74a7a0e1f05aa5f3230588f6f5bcd00c6c8392', FALSE, TRUE),
(9, 9, 'rsilva@parr4.net', '3f3ef786b34d6dd716e1812c8b74a7a0e1f05aa5f3230588f6f5bcd00c6c8392', FALSE, TRUE),
(10, 10, 'smorales@parr5.net', '3f3ef786b34d6dd716e1812c8b74a7a0e1f05aa5f3230588f6f5bcd00c6c8392', FALSE, TRUE);

-- Nuevas parroquias
INSERT INTO public.parish (id, name, primary_color, secondary_color, admin_user_id, active) VALUES
(2, 'San José Obrero', '#8B4513', '#D2691E', 7, TRUE),
(3, 'Nuestra Señora de Fátima', '#9B59B6', '#6C3483', 8, TRUE),
(4, 'San Pedro Apóstol', '#E74C3C', '#922B21', 9, TRUE),
(5, 'Sagrado Corazón de Jesús', '#C0392B', '#7B241C', 10, TRUE);

INSERT INTO public.association (id, user_id, parish_id, active) VALUES
-- Admin de Parroquia 2: Pedro Ramirez (user_id 7)
(3, 7, 2, TRUE),
-- Admin de Parroquia 3: Ana Torres (user_id 8)
(4, 8, 3, TRUE),
-- Admin de Parroquia 4: Roberto Silva (user_id 9)
(5, 9, 4, TRUE),
-- Admin de Parroquia 5: Sofia Morales (user_id 10)
(6, 10, 5, TRUE);

-- Capillas de las nuevas parroquias (cada parroquia tiene capilla base + 1 adicional)
INSERT INTO public.chapel (id, parish_id, name, coordinates, address, email, phone, profile_photo, cover_photo, chapel_base, active) VALUES 
-- Parroquia 2: San José Obrero
(4, 2, 'San José Obrero', '-6.765320, -79.848560', 'Av. Alfonso Ugarte 850, Lima', 
'sjobrero@parroquia.org', '+51 1 4568901', 'chapel_cover_0004.jpg', 'chapel_cover_0004.jpg', TRUE, TRUE),
(5, 2, 'Capilla del Buen Pastor', '-6.770890, -79.841720', 'Calle Los Pinos 245, Lima', 
'buenpastor.sjo@parroquia.org', '+51 1 4568902', 'chapel_cover_0005.jpg', 'chapel_cover_0005.jpg', FALSE, TRUE),

-- Parroquia 3: Nuestra Señora de Fátima
(6, 3, 'Nuestra Señora de Fátima', '-6.776540, -79.855130', 'Jr. Huancavelica 620, Lima', 
'nsfatima@parroquia.org', '+51 1 4568903', 'chapel_cover_0006.jpg', 'chapel_cover_0006.jpg', TRUE, TRUE),
(7, 3, 'Capilla de la Inmaculada', '-6.782450, -79.862340', 'Av. Tacna 1250, Lima', 
'inmaculada.nsf@parroquia.org', '+51 1 4568904', 'chapel_cover_0007.jpg', 'chapel_cover_0007.jpg', FALSE, TRUE),

-- Parroquia 4: San Pedro Apóstol
(8, 4, 'San Pedro Apóstol', '-6.788120, -79.838650', 'Av. Brasil 1850, Lima', 
'spedro@parroquia.org', '+51 1 4568905', 'chapel_cover_0008.jpg', 'chapel_cover_0008.jpg', TRUE, TRUE),
(9, 4, 'Capilla San Pablo', '-6.793780, -79.845280', 'Calle San Martín 520, Lima', 
'sanpablo.sp@parroquia.org', '+51 1 4568906', 'chapel_cover_0009.jpg', 'chapel_cover_0009.jpg', FALSE, TRUE),

-- Parroquia 5: Sagrado Corazón de Jesús
(10, 5, 'Sagrado Corazón de Jesús', '-6.760150, -79.868450', 'Jr. Lampa 345, Lima', 
'scorazon@parroquia.org', '+51 1 4568907', 'chapel_cover_0010.jpg', 'chapel_cover_0010.jpg', TRUE, TRUE),
(11, 5, 'Capilla Santa Teresa', '-6.766820, -79.870120', 'Av. Abancay 980, Lima', 
'santateresa.sc@parroquia.org', '+51 1 4568908', 'chapel_cover_0011.jpg', 'chapel_cover_0011.jpg', FALSE, TRUE);

-- Activar eventos en las capillas (chapel_event)
-- Las capillas activarán varios eventos base definidos por la diócesis
INSERT INTO public.chapel_event (id, chapel_id, event_id, active) VALUES
-- Capilla 4: San José Obrero (capilla base)
(1, 4, 1, TRUE), -- Bautismo
(2, 4, 2, TRUE), -- Primera Comunión
(3, 4, 4, TRUE), -- Matrimonio
(4, 4, 5, TRUE), -- Misa Dominical

-- Capilla 5: Capilla del Buen Pastor
(5, 5, 1, TRUE), -- Bautismo
(6, 5, 5, TRUE), -- Misa Dominical

-- Capilla 6: Nuestra Señora de Fátima (capilla base)
(7, 6, 1, TRUE), -- Bautismo
(8, 6, 3, TRUE), -- Confirmación
(9, 6, 4, TRUE), -- Matrimonio
(10, 6, 6, TRUE), -- Funeral/Exequias

-- Capilla 7: Capilla de la Inmaculada
(11, 7, 2, TRUE), -- Primera Comunión
(12, 7, 5, TRUE), -- Misa Dominical

-- Capilla 8: San Pedro Apóstol (capilla base)
(13, 8, 1, TRUE), -- Bautismo
(14, 8, 4, TRUE), -- Matrimonio
(15, 8, 8, TRUE), -- Bendición de Casa

-- Capilla 9: Capilla San Pablo
(16, 9, 1, TRUE), -- Bautismo
(17, 9, 7, TRUE), -- Catequesis

-- Capilla 10: Sagrado Corazón de Jesús (capilla base)
(18, 10, 1, TRUE), -- Bautismo
(19, 10, 2, TRUE), -- Primera Comunión
(20, 10, 4, TRUE), -- Matrimonio
(21, 10, 10, TRUE), -- Hora Santa/Adoración

-- Capilla 11: Capilla Santa Teresa
(22, 11, 3, TRUE), -- Confirmación
(23, 11, 5, TRUE); -- Misa Dominical

-- Variantes de eventos (individual o comunitario)
-- Permite definir diferentes modalidades de cada evento
INSERT INTO public.event_variant (id, chapel_event_id, name, description, current_price, max_capacity, duration_minutes, active) VALUES
-- Capilla 4: San José Obrero
(1, 1, 'Bautismo Individual', 'Ceremonia de bautismo para un solo niño.', 50.00, 1, 60, TRUE),
(2, 1, 'Bautismo Comunitario', 'Ceremonia de bautismo para varios niños.', 30.00, 10, 90, TRUE),
(3, 2, 'Primera Comunión Individual', 'Primera comunión en ceremonia privada.', 80.00, 1, 60, TRUE),
(4, 2, 'Primera Comunión Grupal', 'Primera comunión en ceremonia colectiva.', 50.00, 15, 120, TRUE),
(5, 3, 'Matrimonio Privado', 'Ceremonia matrimonial privada.', 300.00, 1, 120, TRUE),
(6, 4, 'Misa Dominical 9:00 AM', 'Eucaristía dominical matutina.', 0.00, 150, 60, TRUE),

-- Capilla 5: Capilla del Buen Pastor
(7, 5, 'Bautismo Comunitario', 'Ceremonia de bautismo colectiva.', 25.00, 8, 90, TRUE),
(8, 6, 'Misa Dominical 11:00 AM', 'Eucaristía dominical.', 0.00, 100, 60, TRUE),

-- Capilla 6: Nuestra Señora de Fátima
(9, 7, 'Bautismo Individual', 'Ceremonia de bautismo personalizada.', 55.00, 1, 60, TRUE),
(10, 8, 'Confirmación Grupal', 'Sacramento de confirmación en grupo.', 45.00, 20, 90, TRUE),
(11, 9, 'Matrimonio Estándar', 'Ceremonia matrimonial estándar.', 280.00, 1, 120, TRUE),
(12, 10, 'Exequias Completas', 'Servicio funeral completo con misa.', 150.00, 1, 90, TRUE),

-- Capilla 7: Capilla de la Inmaculada
(13, 11, 'Primera Comunión Comunitaria', 'Ceremonia grupal de primera comunión.', 45.00, 12, 120, TRUE),
(14, 12, 'Misa Dominical 10:00 AM', 'Eucaristía dominical.', 0.00, 80, 60, TRUE),

-- Capilla 8: San Pedro Apóstol
(15, 13, 'Bautismo Individual', 'Bautismo personalizado.', 60.00, 1, 60, TRUE),
(16, 14, 'Matrimonio Premium', 'Ceremonia matrimonial con decoración especial.', 350.00, 1, 150, TRUE),
(17, 15, 'Bendición de Casa Estándar', 'Servicio de bendición doméstica.', 40.00, 1, 45, TRUE),

-- Capilla 9: Capilla San Pablo
(18, 16, 'Bautismo Comunitario', 'Bautismo en grupo.', 28.00, 6, 90, TRUE),
(19, 17, 'Catequesis Infantil', 'Proceso formativo para niños.', 30.00, 25, 120, TRUE),

-- Capilla 10: Sagrado Corazón de Jesús
(20, 18, 'Bautismo Individual', 'Bautismo personalizado.', 52.00, 1, 60, TRUE),
(21, 19, 'Primera Comunión Individual', 'Primera comunión privada.', 75.00, 1, 60, TRUE),
(22, 20, 'Matrimonio Clásico', 'Ceremonia matrimonial tradicional.', 290.00, 1, 120, TRUE),
(23, 21, 'Hora Santa Mensual', 'Adoración eucarística mensual.', 0.00, 50, 60, TRUE),

-- Capilla 11: Capilla Santa Teresa
(24, 22, 'Confirmación Individual', 'Sacramento de confirmación personalizado.', 60.00, 1, 75, TRUE),
(25, 23, 'Misa Dominical 8:00 AM', 'Eucaristía dominical temprana.', 0.00, 70, 60, TRUE);

-- Requisitos adicionales definidos por las capillas (chapel_event_requirement)
-- Estos se suman a los base_requirement definidos por la diócesis
INSERT INTO public.chapel_event_requirement (id, chapel_event_id, name, description, active) VALUES
-- Capilla 4: San José Obrero - Bautismo
(1, 1, 'Foto Digital del Bebé', 'Fotografía reciente del niño en formato digital.', TRUE),
(2, 1, 'Declaración de Compromiso Parental', 'Documento firmado por ambos padres.', TRUE),

-- Capilla 6: Nuestra Señora de Fátima - Bautismo
(3, 7, 'Certificado Médico del Niño', 'Constancia de buena salud del bebé.', TRUE),
(4, 7, 'Carta de Motivación de Padrinos', 'Documento explicando por qué desean ser padrinos.', TRUE),

-- Capilla 6: Nuestra Señora de Fátima - Matrimonio
(5, 9, 'Plan de Vida Conyugal', 'Documento donde los novios expresan sus proyectos.', TRUE),
(6, 9, 'Certificado de Compatibilidad', 'Documento de consejería prematrimonial.', TRUE),

-- Capilla 8: San Pedro Apóstol - Matrimonio
(7, 14, 'Lista de Invitados', 'Detalle de personas asistentes para control de aforo.', TRUE),
(8, 14, 'Contrato de Decoración', 'Documento firmado con empresa decoradora aprobada.', TRUE),

-- Capilla 10: Sagrado Corazón de Jesús - Primera Comunión
(9, 19, 'Portafolio de Catequesis', 'Carpeta con trabajos realizados durante la preparación.', TRUE),
(10, 19, 'Video de Testimonio', 'Grabación breve del niño expresando su fe.', FALSE);

-- Reservas realizadas por los feligreses
-- María Gonzales hace varias reservas
INSERT INTO public.reservation (id, user_id, event_variant_id, event_date, event_time, registration_date, status, paid_amount, beneficiary_full_name) VALUES
-- María reserva un bautismo individual en San José Obrero
(1, 5, 1, '2025-11-15', '10:00:00', '2025-10-20 14:30:00', 'RESERVED', 50.00, 'María Gonzales Ramos'),
-- María reserva una primera comunión en Sagrado Corazón
(2, 5, 21, '2025-12-08', '11:00:00', '2025-10-22 09:15:00', 'IN_PROGRESS', 75.00, 'María Gonzales Ramos'),

-- Carlos Mendoza hace sus reservas
-- Carlos reserva un matrimonio en Nuestra Señora de Fátima
(3, 6, 11, '2025-12-20', '16:00:00', '2025-10-25 11:45:00', 'RESERVED', 280.00, 'Carlos Mendoza Lopez'),
-- Carlos reserva una bendición de casa en San Pedro Apóstol
(4, 6, 17, '2025-11-05', '15:00:00', '2025-10-26 16:20:00', 'COMPLETED', 40.00, 'Carlos Mendoza Lopez');

-------------------------------------------------------------------
-- HORARIOS GENERALES DE LAS CAPILLAS
-------------------------------------------------------------------

-- Horarios para Capilla 1: La Consolación (capilla base)
-- Lunes a Viernes: 8:00 - 12:00 y 16:00 - 20:00
-- Sábados: 8:00 - 13:00 y 16:00 - 21:00
-- Domingos: 7:00 - 13:00 y 17:00 - 20:00

INSERT INTO public.general_schedule (id, chapel_id, day_of_week, start_time, end_time) VALUES
-- Lunes (1)
(1, 1, 1, '08:00:00', '12:00:00'),
(2, 1, 1, '16:00:00', '20:00:00'),
-- Martes (2)
(3, 1, 2, '08:00:00', '12:00:00'),
(4, 1, 2, '16:00:00', '20:00:00'),
-- Miércoles (3)
(5, 1, 3, '08:00:00', '12:00:00'),
(6, 1, 3, '16:00:00', '20:00:00'),
-- Jueves (4)
(7, 1, 4, '08:00:00', '12:00:00'),
(8, 1, 4, '16:00:00', '20:00:00'),
-- Viernes (5)
(9, 1, 5, '08:00:00', '12:00:00'),
(10, 1, 5, '16:00:00', '20:00:00'),
-- Sábado (6)
(11, 1, 6, '08:00:00', '13:00:00'),
(12, 1, 6, '16:00:00', '21:00:00'),
-- Domingo (0)
(13, 1, 0, '07:00:00', '13:00:00'),
(14, 1, 0, '17:00:00', '20:00:00');

-- Horarios para Capilla 2: Nuestra Señora del Carmen
-- Lunes a Viernes: 9:00 - 12:00 y 15:00 - 19:00
-- Sábados: 9:00 - 14:00 y 16:00 - 20:00
-- Domingos: 8:00 - 13:00 y 16:00 - 19:00

INSERT INTO public.general_schedule (id, chapel_id, day_of_week, start_time, end_time) VALUES
-- Lunes (1)
(15, 2, 1, '09:00:00', '12:00:00'),
(16, 2, 1, '15:00:00', '19:00:00'),
-- Martes (2)
(17, 2, 2, '09:00:00', '12:00:00'),
(18, 2, 2, '15:00:00', '19:00:00'),
-- Miércoles (3)
(19, 2, 3, '09:00:00', '12:00:00'),
(20, 2, 3, '15:00:00', '19:00:00'),
-- Jueves (4)
(21, 2, 4, '09:00:00', '12:00:00'),
(22, 2, 4, '15:00:00', '19:00:00'),
-- Viernes (5)
(23, 2, 5, '09:00:00', '12:00:00'),
(24, 2, 5, '15:00:00', '19:00:00'),
-- Sábado (6)
(25, 2, 6, '09:00:00', '14:00:00'),
(26, 2, 6, '16:00:00', '20:00:00'),
-- Domingo (0)
(27, 2, 0, '08:00:00', '13:00:00'),
(28, 2, 0, '16:00:00', '19:00:00');

-- Horarios para Capilla 3: Santa Rosa de Lima
-- Lunes a Viernes: 7:00 - 11:00 y 16:00 - 19:00
-- Sábados: 7:00 - 12:00 y 15:00 - 20:00
-- Domingos: 6:00 - 12:00 y 17:00 - 20:00

INSERT INTO public.general_schedule (id, chapel_id, day_of_week, start_time, end_time) VALUES
-- Lunes (1)
(29, 3, 1, '07:00:00', '11:00:00'),
(30, 3, 1, '16:00:00', '19:00:00'),
-- Martes (2)
(31, 3, 2, '07:00:00', '11:00:00'),
(32, 3, 2, '16:00:00', '19:00:00'),
-- Miércoles (3)
(33, 3, 3, '07:00:00', '11:00:00'),
(34, 3, 3, '16:00:00', '19:00:00'),
-- Jueves (4)
(35, 3, 4, '07:00:00', '11:00:00'),
(36, 3, 4, '16:00:00', '19:00:00'),
-- Viernes (5)
(37, 3, 5, '07:00:00', '11:00:00'),
(38, 3, 5, '16:00:00', '19:00:00'),
-- Sábado (6)
(39, 3, 6, '07:00:00', '12:00:00'),
(40, 3, 6, '15:00:00', '20:00:00'),
-- Domingo (0)
(41, 3, 0, '06:00:00', '12:00:00'),
(42, 3, 0, '17:00:00', '20:00:00');


-------------------------------------------------------------------
-- EXCEPCIONES DE HORARIO (SPECIFIC_SCHEDULE)
-------------------------------------------------------------------

-- Excepciones para fechas especiales y días festivos

-- Capilla 1: La Consolación - Cerrada el 25 de diciembre de 2025 (Navidad)
INSERT INTO public.specific_schedule (id, chapel_id, date, start_time, end_time, exception_type, reason) VALUES
(1, 1, '2025-12-25', '06:00:00', '22:00:00', 'CLOSED', 'Día de Navidad - Capilla cerrada');

-- Capilla 1: La Consolación - Horario especial el 1 de enero de 2026 (Año Nuevo)
INSERT INTO public.specific_schedule (id, chapel_id, date, start_time, end_time, exception_type, reason) VALUES
(2, 1, '2026-01-01', '10:00:00', '14:00:00', 'OPEN', 'Año Nuevo - Horario especial de mañana solamente');

-- Capilla 1: La Consolación - Horario extendido el 24 de diciembre de 2025 (Nochebuena)
INSERT INTO public.specific_schedule (id, chapel_id, date, start_time, end_time, exception_type, reason) VALUES
(3, 1, '2025-12-24', '08:00:00', '23:00:00', 'OPEN', 'Nochebuena - Horario extendido para misa de medianoche');

-- Capilla 2: Nuestra Señora del Carmen - Cerrada el 1 de noviembre de 2025 (Día de Todos los Santos)
INSERT INTO public.specific_schedule (id, chapel_id, date, start_time, end_time, exception_type, reason) VALUES
(4, 2, '2025-11-01', '06:00:00', '22:00:00', 'CLOSED', 'Día de Todos los Santos - Evento especial en otra sede');

-- Capilla 2: Nuestra Señora del Carmen - Horario especial el 16 de julio de 2026 (Día del Carmen)
INSERT INTO public.specific_schedule (id, chapel_id, date, start_time, end_time, exception_type, reason) VALUES
(5, 2, '2026-07-16', '06:00:00', '22:00:00', 'OPEN', 'Día de Nuestra Señora del Carmen - Celebración patronal con horario extendido');

-- Capilla 3: Santa Rosa de Lima - Horario especial el 30 de agosto de 2026 (Santa Rosa de Lima)
INSERT INTO public.specific_schedule (id, chapel_id, date, start_time, end_time, exception_type, reason) VALUES
(6, 3, '2026-08-30', '05:00:00', '21:00:00', 'OPEN', 'Santa Rosa de Lima - Celebración patronal con horario extendido');

-- Capilla 3: Santa Rosa de Lima - Cerrada el 15 de noviembre de 2025 (Mantenimiento)
INSERT INTO public.specific_schedule (id, chapel_id, date, start_time, end_time, exception_type, reason) VALUES
(7, 3, '2025-11-15', '06:00:00', '22:00:00', 'CLOSED', 'Mantenimiento de instalaciones eléctricas');


-------------------------------------------------------------------
-- HORARIOS ADICIONALES - Capillas con Eventos Activados
-------------------------------------------------------------------

-- Horarios para Capilla 4: San José Obrero (capilla base)
-- Lunes a Viernes: 8:00 - 12:00 y 16:00 - 20:00
-- Sábado: 7:00 - 13:00 y 15:00 - 21:00
-- Domingo: 6:00 - 14:00 (horario extendido por Misas)

INSERT INTO public.general_schedule (id, chapel_id, day_of_week, start_time, end_time) VALUES
-- Lunes (1)
(43, 4, 1, '08:00:00', '12:00:00'),
(44, 4, 1, '16:00:00', '20:00:00'),
-- Martes (2)
(45, 4, 2, '08:00:00', '12:00:00'),
(46, 4, 2, '16:00:00', '20:00:00'),
-- Miércoles (3)
(47, 4, 3, '08:00:00', '12:00:00'),
(48, 4, 3, '16:00:00', '20:00:00'),
-- Jueves (4)
(49, 4, 4, '08:00:00', '12:00:00'),
(50, 4, 4, '16:00:00', '20:00:00'),
-- Viernes (5)
(51, 4, 5, '08:00:00', '12:00:00'),
(52, 4, 5, '16:00:00', '20:00:00'),
-- Sábado (6)
(53, 4, 6, '07:00:00', '13:00:00'),
(54, 4, 6, '15:00:00', '21:00:00'),
-- Domingo (0)
(55, 4, 0, '06:00:00', '14:00:00');


-- Horarios para Capilla 5: Capilla del Buen Pastor
-- Miércoles a Viernes: 9:00 - 12:00 y 17:00 - 19:00
-- Sábado: 8:00 - 13:00
-- Domingo: 8:00 - 12:00 (horario especial por Misa Dominical)

INSERT INTO public.general_schedule (id, chapel_id, day_of_week, start_time, end_time) VALUES
-- Miércoles (3)
(56, 5, 3, '09:00:00', '12:00:00'),
(57, 5, 3, '17:00:00', '19:00:00'),
-- Jueves (4)
(58, 5, 4, '09:00:00', '12:00:00'),
(59, 5, 4, '17:00:00', '19:00:00'),
-- Viernes (5)
(60, 5, 5, '09:00:00', '12:00:00'),
(61, 5, 5, '17:00:00', '19:00:00'),
-- Sábado (6)
(62, 5, 6, '08:00:00', '13:00:00'),
-- Domingo (0)
(63, 5, 0, '08:00:00', '12:00:00');


-- Horarios para Capilla 6: Nuestra Señora de Fátima (capilla base)
-- Lunes a Viernes: 7:00 - 13:00 y 15:00 - 20:00
-- Sábado: 6:00 - 14:00 y 16:00 - 21:00
-- Domingo: 6:00 - 13:00

INSERT INTO public.general_schedule (id, chapel_id, day_of_week, start_time, end_time) VALUES
-- Lunes (1)
(64, 6, 1, '07:00:00', '13:00:00'),
(65, 6, 1, '15:00:00', '20:00:00'),
-- Martes (2)
(66, 6, 2, '07:00:00', '13:00:00'),
(67, 6, 2, '15:00:00', '20:00:00'),
-- Miércoles (3)
(68, 6, 3, '07:00:00', '13:00:00'),
(69, 6, 3, '15:00:00', '20:00:00'),
-- Jueves (4)
(70, 6, 4, '07:00:00', '13:00:00'),
(71, 6, 4, '15:00:00', '20:00:00'),
-- Viernes (5)
(72, 6, 5, '07:00:00', '13:00:00'),
(73, 6, 5, '15:00:00', '20:00:00'),
-- Sábado (6)
(74, 6, 6, '06:00:00', '14:00:00'),
(75, 6, 6, '16:00:00', '21:00:00'),
-- Domingo (0)
(76, 6, 0, '06:00:00', '13:00:00');


-------------------------------------------------------------------
-- EXCEPCIONES DE HORARIO ADICIONALES
-------------------------------------------------------------------

-- San José Obrero - Cerrado por Mantenimiento (15 de Noviembre 2025)
INSERT INTO public.specific_schedule (id, chapel_id, date, start_time, end_time, exception_type, reason) VALUES
(8, 4, '2025-11-15', '06:00:00', '22:00:00', 'CLOSED', 'Mantenimiento general de instalaciones');

-- San José Obrero - Horario Especial por Fiesta Patronal (20 de noviembre de 2025)
INSERT INTO public.specific_schedule (id, chapel_id, date, start_time, end_time, exception_type, reason) VALUES
(9, 4, '2025-11-20', '13:00:00', '16:00:00', 'OPEN', 'Fiesta Patronal de San José Obrero');

-- Capilla del Buen Pastor - Cerrado por Evento Especial (20 de Diciembre 2025)
INSERT INTO public.specific_schedule (id, chapel_id, date, start_time, end_time, exception_type, reason) VALUES
(10, 5, '2025-12-20', '06:00:00', '22:00:00', 'CLOSED', 'Evento privado programado');

-- Nuestra Señora de Fátima - Horario Extendido por Vigilia (24 de Diciembre 2025)
-- Abierto de 6:00 AM - 11:59 PM
INSERT INTO public.specific_schedule (id, chapel_id, date, start_time, end_time, exception_type, reason) VALUES
(11, 6, '2025-12-24', '06:00:00', '23:59:00', 'OPEN', 'Vigilia de Navidad');

-- Nuestra Señora de Fátima - Horario Especial por Fiesta Patronal (20 de noviembre de 2025)
INSERT INTO public.specific_schedule (id, chapel_id, date, start_time, end_time, exception_type, reason) VALUES
(12, 6, '2025-11-20', '13:00:00', '16:00:00', 'OPEN', 'Celebración de Nuestra Señora de Fátima');


-- ====================================================================
-- RESERVAS DE USUARIO 5: María Gonzales
-- ====================================================================

INSERT INTO public.reservation (id, user_id, event_variant_id, event_date, event_time, registration_date, status, paid_amount, beneficiary_full_name) VALUES
(5, 5, 1, '2025-11-20', '10:00:00', '2025-10-15 14:30:00', 'RESERVED', 50.00, 'María Gonzales Ramos'),
(6, 5, 3, '2025-12-10', '11:00:00', '2025-10-18 09:45:00', 'IN_PROGRESS', 80.00, 'María Gonzales Ramos'),
(7, 5, 7, '2026-01-15', '15:00:00', '2025-10-20 16:20:00', 'RESERVED', 25.00, 'María Gonzales Ramos'),
(8, 5, 15, '2026-02-08', '10:30:00', '2025-10-25 11:10:00', 'IN_PROGRESS', 60.00, 'María Gonzales Ramos'),
(9, 5, 21, '2026-03-20', '12:00:00', '2025-10-27 13:45:00', 'RESERVED', 75.00, 'María Gonzales Ramos');

INSERT INTO public.reservation (id, user_id, event_variant_id, event_date, event_time, registration_date, status, paid_amount, beneficiary_full_name) VALUES
(10, 5, 2, '2025-05-15', '09:00:00', '2025-04-10 10:30:00', 'COMPLETED', 30.00, 'María Gonzales Ramos'),
(11, 5, 9, '2025-06-20', '11:00:00', '2025-05-15 14:20:00', 'FULFILLED', 55.00, 'María Gonzales Ramos'),
(12, 5, 17, '2025-07-10', '15:00:00', '2025-06-05 16:45:00', 'COMPLETED', 40.00, 'María Gonzales Ramos'),
(13, 5, 13, '2025-08-05', '10:00:00', '2025-07-01 09:15:00', 'CANCELLED', 0.00, 'María Gonzales Ramos'),
(14, 5, 18, '2025-08-25', '14:00:00', '2025-07-20 11:30:00', 'FULFILLED', 28.00, 'María Gonzales Ramos'),
(15, 5, 19, '2025-09-12', '16:00:00', '2025-08-10 15:50:00', 'REJECTED', 0.00, 'María Gonzales Ramos'),
(16, 5, 23, '2025-10-01', '18:00:00', '2025-09-05 10:25:00', 'COMPLETED', 0.00, 'María Gonzales Ramos'),
(17, 5, 20, '2025-10-18', '11:30:00', '2025-09-15 14:10:00', 'FULFILLED', 52.00, 'María Gonzales Ramos');


-- ====================================================================
-- 1. INSERCIÓN DE 5 NUEVOS ROLES PARA LA PARROQUIA 1 ('La Consolación')
-- (Los roles existentes son 1 y 2, continuamos desde el ID 3)
-- ====================================================================
INSERT INTO public.role (id, parish_id, name, description, active) VALUES
(3, 1, 'Catequista Principal', 'Coordina las actividades de catequesis y confirmación.', TRUE),
(4, 1, 'Gestor de Eventos', 'Encargado de gestionar reservas y actos litúrgicos.', TRUE),
(5, 1, 'Tesorero(a)', 'Gestión de finanzas y datos de la cuenta parroquial.', TRUE),
(6, 1, 'Mantenimiento y Sede', 'Acceso para ver información de capillas y horarios.', TRUE),
(7, 1, 'Comunicador Social', 'Encargado de la comunicación parroquial (acceso de lectura).', TRUE);

---

-- ====================================================================
-- 2. ASIGNACIÓN DE PERMISOS A LOS NUEVOS ROLES
-- (Se mezclan permisos activados 'granted = TRUE' y desactivados 'granted = FALSE')
-- (Iniciamos IDs desde 1)
-- ====================================================================
INSERT INTO public.role_permission (id, role_id, permission_id, granted) VALUES
-- Rol 3: Catequista Principal (Lectura básica de eventos y reservas)
(1, 3, 3, TRUE),  -- Leer acto litúrgico
(2, 3, 8, TRUE),  -- Leer requisitos
(3, 3, 19, TRUE), -- Leer reservas
(4, 3, 20, FALSE),-- Actualizar reservas (Desactivado)

-- Rol 4: Gestor de Eventos (Control casi total de actos y reservas)
(5, 4, 1, TRUE),  -- Crear acto litúrgico
(6, 4, 3, TRUE),  -- Leer acto litúrgico
(7, 4, 4, TRUE),  -- Actualizar acto litúrgico
(8, 4, 19, TRUE), -- Leer reservas
(9, 4, 20, TRUE), -- Actualizar reservas
(10, 4, 11, TRUE),-- Crear horario
(11, 4, 13, TRUE),-- Crear Excepción - Disponibilidad
(12, 4, 16, TRUE),-- Crear Excepción NO - Disponibilidad
(13, 4, 31, FALSE),-- Eliminar rol (Desactivado - Seguridad)

-- Rol 5: Tesorero(a) (Control de info de parroquia y cuenta)
(14, 5, 32, TRUE), -- Leer información de la parroquia
(15, 5, 33, TRUE), -- Actualizar información de la parroquia
(16, 5, 34, TRUE), -- Leer Datos de la cuenta
(17, 5, 35, TRUE), -- Actualizar Datos de la cuenta
(18, 5, 26, FALSE),-- Crear rol (Desactivado)

-- Rol 6: Mantenimiento y Sede (Control de capillas)
(19, 6, 38, TRUE), -- Leer capilla
(20, 6, 39, TRUE), -- Actualizar capilla
(21, 6, 12, TRUE), -- Actualizar horario
(22, 6, 36, FALSE),-- Crear capilla (Desactivado)
(23, 6, 37, FALSE),-- Actualizar estado capilla (Desactivado)

-- Rol 7: Comunicador Social (Lectura general)
(24, 7, 3, TRUE),  -- Leer acto litúrgico
(25, 7, 19, TRUE), -- Leer reservas
(26, 7, 38, TRUE), -- Leer capilla
(27, 7, 32, TRUE); -- Leer información de la parroquia

---

-- ====================================================================
-- 3. ASIGNACIÓN DE LOS NUEVOS ROLES A PAMELA
-- (La persona 'Pamela' es user_id=3. Su association_id en la Parroquia 1 es 2)
-- (Los user_role existentes son 1 y 2, continuamos desde el ID 3)
-- ====================================================================
INSERT INTO public.user_role (id, association_id, role_id) VALUES
(3, 2, 3), -- Asignando rol 'Catequista Principal' a Pamela (association_id 2)
(4, 2, 4), -- Asignando rol 'Gestor de Eventos' a Pamela
(5, 2, 5), -- Asignando rol 'Tesorero(a)' a Pamela
(6, 2, 6), -- Asignando rol 'Mantenimiento y Sede' a Pamela
(7, 2, 7); -- Asignando rol 'Comunicador Social' a Pamela

-- ====================================================================
-- 1. ASOCIAR LOS EVENTOS BASE A LA CAPILLA 'La Consolación' (ID 1)
-- (Se asocian los 10 eventos base proporcionados)
-- ====================================================================
INSERT INTO public.chapel_event (id, chapel_id, event_id, active) VALUES
(24, 1, 1, TRUE),  -- Bautismo en La Consolación
(25, 1, 2, TRUE),  -- Primera Comunión en La Consolación
(26, 1, 3, TRUE),  -- Confirmación en La Consolación
(27, 1, 4, TRUE),  -- Matrimonio en La Consolación
(28, 1, 5, TRUE),  -- Misa Dominical en La Consolación
(29, 1, 6, TRUE),  -- Funeral / Exequias en La Consolación
(30, 1, 7, TRUE),  -- Catequesis en La Consolación
(31, 1, 8, TRUE),  -- Bendición de Casa en La Consolación
(32, 1, 9, TRUE),  -- Encuentro Pastoral en La Consolación
(33, 1, 10, TRUE); -- Hora Santa / Adoración en La Consolación

---

-- ====================================================================
-- 2. CREACIÓN DE 12 VARIANTES DE EVENTOS PARA LA CAPILLA 1
-- (IDs 1-12. Se añaden 2 variantes a Matrimonio y 2 a Misa Dominical)
-- ====================================================================
INSERT INTO public.event_variant (id, chapel_event_id, name, description, current_price, max_capacity, duration_minutes, active) VALUES
-- Bautismo (Asociado a chapel_event_id 11)
(26, 24, 'Bautismo Comunitario (Sábado)', 'Celebración grupal de bautismo que se realiza los sábados.', 50.00, 20, 60, TRUE),

-- Primera Comunión (Asociado a chapel_event_id 12)
(27, 25, 'Misa de Primera Comunión', 'Misa de primera comunión para el grupo anual de catequesis.', 0.00, 100, 90, TRUE),

-- Confirmación (Asociado a chapel_event_id 13)
(28, 26, 'Confirmación Anual', 'Celebración anual de confirmaciones presidida por el obispo.', 0.00, 150, 120, TRUE),

-- Matrimonio (Asociado a chapel_event_id 14) - Variante 1
(29, 27, 'Matrimonio Regular', 'Ceremonia de matrimonio estándar sin Misa.', 350.00, 200, 60, TRUE),
-- Matrimonio (Asociado a chapel_event_id 14) - Variante 2
(30, 27, 'Matrimonio (Misa Completa)', 'Ceremonia de matrimonio con Eucaristía completa y coro parroquial.', 500.00, 200, 90, TRUE),

-- Misa Dominical (Asociado a chapel_event_id 15) - Variante 1
(31, 28, 'Intención Misa Dominical (Coro)', 'Intención para la Misa de domingo 7:00 PM (Coro Juvenil).', 10.00, 1, 60, TRUE),
-- Misa Dominical (Asociado a chapel_event_id 15) - Variante 2
(32, 28, 'Intención Misa Dominical (Niños)', 'Intención para la Misa adaptada a niños (Domingo 11:00 AM).', 10.00, 1, 60, TRUE),

-- Funeral / Exequias (Asociado a chapel_event_id 16)
(33, 29, 'Misa de Cuerpo Presente', 'Celebración de exequias en la capilla principal.', 150.00, 200, 60, TRUE),

-- Catequesis (Asociado a chapel_event_id 17)
(34, 30, 'Inscripción Catequesis (Anual)', 'Reserva de cupo para el ciclo de catequesis (Comunión o Confirmación).', 25.00, 50, 30, TRUE),

-- Bendición de Casa (Asociado a chapel_event_id 18)
(35, 31, 'Bendición a Domicilio', 'Visita del sacerdote para bendición (requiere coordinación de transporte).', 30.00, 1, 45, TRUE),

-- Encuentro Pastoral (Asociado a chapel_event_id 19)
(36, 32, 'Reserva de Salón Pastoral', 'Uso del salón de reuniones para grupos pastorales (Máx 2h).', 0.00, 30, 120, TRUE),

-- Hora Santa / Adoración (Asociado a chapel_event_id 20)
(37, 33, 'Intención Hora Santa', 'Registro de intenciones para la adoración eucarística del Jueves.', 5.00, 1, 60, TRUE);

---

-- ====================================================================
-- 3. REQUISITOS ADICIONALES DEFINIDOS POR LA CAPILLA
-- (Un requisito para cada 'chapel_event' creado anteriormente)
-- ====================================================================
INSERT INTO public.chapel_event_requirement (id, chapel_event_id, name, description, active) VALUES
(11, 1, 'Constancia de Charlas Pre-Bautismales', 'Presentar la constancia física firmada por el catequista de la parroquia.', TRUE),
(12, 2, 'Certificado de Bautismo (Copia)', 'Adjuntar copia simple del certificado de bautismo del niño/a.', TRUE),
(13, 3, 'Constancia de Catequesis Completa', 'Certificado de haber completado los 2 años de catequesis de confirmación.', TRUE),
(14, 4, 'Apertura de Pliego Matrimonial', 'Realizar la apertura del pliego en secretaría al menos 3 meses antes de la fecha.', TRUE),
(15, 5, 'Comprobante de Intención (Misas)', 'Entregar el comprobante de intención impreso en secretaría antes de la Misa.', TRUE),
(16, 6, 'Acta de Defunción (Copia)', 'Presentar copia del acta de defunción civil para el registro parroquial.', TRUE),
(17, 7, 'Ficha de Matrícula (Catequesis)', 'Completar y firmar la ficha de datos personales y de contacto del estudiante.', TRUE),
(18, 8, 'Coordinación de Transporte', 'Confirmar si la familia proveerá transporte de ida y vuelta al sacerdote.', TRUE),
(19, 9, 'Carta del Coordinador Pastoral', 'Solicitud formal firmada por el coordinador general del grupo pastoral.', TRUE),
(20, 10, 'Registro en Cuaderno de Intenciones', 'Anotar la intención en el cuaderno de la Hora Santa antes de la exposición.', TRUE);