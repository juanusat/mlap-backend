# REQUISITOS DEL SISTEMA: GESTIÓN DE PARROQUIAS Y EVENTOS

## TABLAS PRINCIPALES

### Permiso (Permission)
    - Permisos del sistema definidos por el propietario y aplicables a todas las parroquias
    - Incluye código único, nombre, descripción y categoría (USUARIOS, EVENTOS, RESERVAS, CONFIGURACION)
    - Permite control granular de acceso a funcionalidades del sistema
    - Estado activo/inactivo con fechas de creación y actualización

### TipoDocumento (DocumentType)
    - Catálogo de tipos de documentos de identidad (cédula, pasaporte, documento extranjero, etc.)
    - Incluye código único, nombre descriptivo, descripción y estado activo
    - Permite normalizar y validar los tipos de documentos que pueden usar las personas
    - Controla qué tipos de documentos acepta el sistema

### Persona (Person)
    - Información personal básica: nombres, apellidos paterno y materno, email (único)
    - Documento de identidad vinculado a un tipo de documento específico
    - Foto de perfil opcional
    - Cualquier persona puede hacer reservas de eventos y trabajar para parroquias
    - Fechas de creación y actualización para auditoría

### Usuario (User)
    - Información de acceso asociada a una persona específica
    - Username único, hash de contraseña, indicador si es diocesano, estado activo
    - Manejo de tokens de recuperación de contraseña con expiración (6 caracteres)
    - Registro de último login para control de sesiones
    - Eliminación en cascada al eliminar la persona asociada

### Parroquia (Parish)
    - Funciona como una página institucional, administrada por un usuario específico
    - Datos: nombre, colores primario y secundario (formato hex), usuario administrador
    - Estado activo para controlar disponibilidad, fechas de auditoría
    - Una parroquia puede tener múltiples capillas asociadas
    - El usuario administrador debe existir previamente en el sistema

### Capilla (Chapel)
    - Entidad específica dentro de una parroquia donde se realizan los eventos
    - Datos: nombre, coordenadas, dirección completa, email, teléfono
    - Fotos de perfil y portada opcionales para identificación visual
    - Indicador chapel_base para identificar capilla principal de la parroquia
    - Cada capilla pertenece a una parroquia y maneja sus propios horarios y eventos
    - Nombres únicos por parroquia, eliminación en cascada con la parroquia

### Rol (Role)
    - Cada parroquia define sus propios roles con nombres y descripciones específicas
    - Las personas asociadas a una parroquia pueden tener múltiples roles
    - Define niveles de acceso granular para usuarios dentro de cada parroquia
    - Nombres únicos por parroquia, eliminación en cascada con la parroquia
    - Estado activo para controlar disponibilidad de roles

### RolPermiso (RolePermission)
    - Asigna permisos específicos del sistema a cada rol de parroquia
    - Permite otorgar y revocar permisos individualmente con fechas de control
    - Mantiene historial completo de asignación y revocación de permisos
    - Constraint único por rol-permiso activo para evitar duplicados
    - Eliminación en cascada al eliminar rol o permiso

### Asociacion (Association)
    - Histórico completo de qué usuario trabaja para qué parroquia
    - Fechas de inicio (requerida) y fin (opcional si sigue activo)
    - Permite mantener historial laboral sin crear registros duplicados
    - Validación de que fecha fin sea posterior o igual a fecha inicio
    - Estado activo para control de asociaciones vigentes

### UsuarioRol (UserRole)
    - Asigna roles específicos a usuarios dentro de sus asociaciones a parroquias
    - Un usuario puede tener múltiples roles en la misma parroquia
    - Mantiene historial de asignación y revocación de roles con fechas
    - Vincula la asociación (usuario-parroquia) con roles específicos de esa parroquia
    - Constraint único por asociación-rol-fecha_revocación para control de duplicados

## TABLAS DE HORARIOS

### HorarioGeneral (GeneralSchedule)
    - Disponibilidad recurrente semanal de cada capilla específica
    - Día de la semana (0-6: domingo a sábado), hora de inicio y fin
    - Una capilla puede tener múltiples horarios para diferentes días
    - Validación de que hora fin sea posterior a hora inicio
    - Constraint único por capilla-día-hora_inicio para evitar conflictos

### HorarioEspecifico (SpecificSchedule)
    - Excepciones al horario general de cada capilla (mayor jerarquía)
    - Tipos: OPEN (abierto en horario especial) o CLOSED (cerrado completamente)
    - Para OPEN: requiere hora inicio y fin válidas
    - Para CLOSED: solo requiere fecha, sin horarios específicos
    - Permite especificar razón de la excepción para comunicación clara

## TABLAS DE EVENTOS Y RESERVAS

### Evento (Event)
    - Catálogo base de eventos del sistema, definidos por diócesis (bautizo, matrimonio, misa, etc.)
    - Nombres únicos a nivel sistema para consistencia global
    - Actividades o servicios que pueden ser ofrecidos por las capillas
    - Estado activo para controlar disponibilidad en el sistema
    - Descripción opcional para mayor claridad

### CapillaEvento (ChapelEvent)
    - Relación específica entre capillas y eventos que pueden ofrecer
    - Una capilla puede ofrecer múltiples eventos
    - Un evento puede ser ofrecido por múltiples capillas
    - Permite activar/desactivar eventos específicos por capilla
    - Constraint único por capilla-evento para evitar duplicados

### VarianteEvento (EventVariant)
    - Diferentes configuraciones de un evento específico en una capilla
    - Nombre y descripción específicos de la variante
    - Precio actual, capacidad máxima (mínimo 1), duración en minutos (mínimo 1)
    - Puede ser individual (matrimonio privado) o grupal (matrimonio comunitario)
    - Nombres únicos por evento de capilla, eliminación en cascada
    - Estado activo para controlar disponibilidad de variantes

### Reserva (Reservation)
    - Vincula un usuario específico con una variante de evento
    - Fecha y hora específica del evento, fecha de registro automática
    - Posibilidad de reprogramación con nueva fecha/hora
    - Estados: RESERVED, REJECTED, IN_PROGRESS, COMPLETED, FULFILLED, CANCELLED
    - Monto pagado (decimal) y nombre completo del beneficiario
    - Eliminación en cascada al eliminar usuario o variante de evento

## TABLAS DE REQUISITOS

### RequisitosBase (BaseRequirement)
    - Requisitos predefinidos por el sistema (diócesis) para cada tipo de evento específico
    - Aplicables a nivel de evento base (no específicos de capillas individuales)
    - Pueden activarse/desactivarse pero mantienen estándar del sistema
    - Nombres únicos por evento para evitar duplicados
    - Descripción opcional para mayor claridad del requisito

### RequisitosCapillaEvento (ChapelEventRequirement)
    - Requisitos adicionales definidos específicamente por cada capilla
    - Complementan y extienden los requisitos base del sistema
    - Permiten personalización completa por capilla según necesidades locales
    - Nombres únicos por evento de capilla, eliminación en cascada
    - Estado activo para controlar qué requisitos aplican actualmente

### RequisitosReserva (ReservationRequirement)
    - Copia inmutable de todos los requisitos activos al momento de crear reserva
    - Permite saber exactamente qué requisitos tiene cada reserva específica
    - Referencia tanto requisitos base como requisitos específicos de capilla
    - Estado de completado marcado por trabajadores autorizados de la capilla
    - Constraint que asegura origen único (base O capilla, no ambos)
    - Eliminación en cascada al eliminar la reserva asociada

## TABLAS DE MENCIONES E INTENCIONES

### TipoMencion (MentionType)
    - Catálogo de tipos de menciones/intenciones para eventos (Difunto, Salud, Acción de Gracias)
    - Código corto único para identificación rápida (ej: 'DIF', 'SAL', 'AGR')
    - Nombre descriptivo completo y descripción opcional
    - Estado activo para controlar disponibilidad en el sistema
    - Permite estandarizar las intenciones disponibles

### MencionReserva (ReservationMention)
    - Intenciones específicas asociadas a cada reserva individual
    - Vincula reserva con tipo de mención y nombre específico de la persona
    - Permite múltiples menciones por reserva (ej: varios difuntos en una misa)
    - Nombre completo de la persona mencionada (hasta 120 caracteres)
    - Eliminación en cascada al eliminar la reserva asociada
    - ID con BIGSERIAL para manejar alto volumen de menciones

## TABLAS ADICIONALES

### Notificacion (Notification)
    - Sistema de notificaciones internas para usuarios del sistema
    - Título conciso y cuerpo descriptivo para comunicación clara
    - Estado de lectura para tracking de notificaciones vistas
    - Eliminación en cascada al eliminar el usuario asociado
    - Fechas de creación y actualización para auditoría
    - ID con BIGSERIAL para manejar alto volumen de notificaciones

## TABLAS DE AUDITORÍA Y BITÁCORA

### RegistroAuditoriaSeguridad (SecurityAuditLog)
    - Registro de acciones relacionadas con seguridad del sistema
    - Vinculada a usuario específico que realizó la acción
    - Tipo de acción y descripción detallada del evento
    - Fecha automática de creación para timeline de eventos
    - Crítico para monitoreo de seguridad y compliance

### RegistroAuditoriaParroquia (ParishAuditLog)
    - Registro de acciones específicas relacionadas con gestión de parroquias
    - Usuario que realizó acción, tipo de acción y descripción
    - ID de parroquia afectada (opcional para acciones generales)
    - Permite rastrear cambios organizacionales y administrativos

### RegistroAuditoriaUsuario (UserAuditLog)
    - Registro de acciones relacionadas con gestión de usuarios
    - Tracking de cambios en perfiles, roles, asociaciones
    - Usuario que realizó la acción y descripción detallada
    - Esencial para compliance y resolución de incidencias

### RegistroAuditoriaEvento (EventAuditLog)
    - Registro completo de acciones relacionadas con eventos y reservas
    - Referencias opcionales a evento, capilla-evento, variante y reserva específica
    - Permite rastrear toda la cadena de cambios en gestión de eventos
    - Usuario responsable, tipo de acción y descripción detallada
    - Crítico para auditoría de procesos de reserva y eventos