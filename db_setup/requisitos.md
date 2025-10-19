Parroquia (Parish)
    - Funciona como una página de facebook, debe tener un usuario/persona que es el lo creó y administra
    - Datos de cada parroquia: nombre, colores primario y secundario (hex), usuario administrador, estado activo
    - Una parroquia puede tener múltiples capillas asociadas

Capilla (Chapel)
    - Entidad específica dentro de una parroquia donde se realizan los eventos
    - Datos específicos: nombre, coordenadas, dirección, email, teléfono, fotos de perfil y portada
    - Cada capilla pertenece a una parroquia y maneja sus propios horarios y eventos
    - Nombres únicos por parroquia

HorarioGeneral (GeneralSchedule)
    - Disponibilidad recurrente de cada capilla (no de la parroquia directamente)
    - Día de la semana (0-6), hora de inicio y fin
    - Cada capilla puede tener múltiples horarios para diferentes días
    - Validación de que la hora de fin sea posterior a la de inicio

HorarioEspecifico (SpecificSchedule)
    - Añade excepciones al horario general de cada capilla (tiene más jerarquía)
    - Tipo de excepción: OPEN (abierto en horario especial) o CLOSED (cerrado)
    - Para tipo OPEN: debe especificar hora de inicio y fin
    - Para tipo CLOSED: solo fecha, sin horarios
    - Permite especificar razón de la excepción
Persona (Person)
    - Información personal: nombres, apellidos paterno y materno, email (único), documento, tipo de documento, foto de perfil
    - Cualquier persona puede hacer reserva de un evento en cualquier capilla y puede trabajar para una parroquia

Usuario (User)
    - Asociado a una persona, es la información de acceso a su cuenta
    - Incluye username único, hash de contraseña, indicador si es diocesano, estado activo
    - Manejo de tokens de recuperación de contraseña con expiración
    - Registro de último login

Asociacion (Association)
    - El histórico de qué usuario trabaja para qué parroquia desde una fecha inicial y una fecha final (nula si sigue trabajando)
    - Permite vincular a una persona a una parroquia sin que se tenga que crear otro registro si cambia de parroquia, manteniendo un histórico
    - Validación de que la fecha final sea posterior o igual a la inicial

Rol (Role)
    - Cada parroquia define qué roles tiene y los nombres de estos
    - Las personas asignadas a una parroquia tienen 0, 1 o más roles de dicha parroquia
    - Define niveles de acceso para los usuarios
    - Nombres únicos por parroquia

Evento (Event)
    - Catálogo base de eventos disponibles en el sistema (bautizo, matrimonio, etc.)
    - Actividades o servicios que pueden ser ofrecidos por las capillas
    - Nombres únicos a nivel sistema

CapillaEvento (ChapelEvent)
    - Tabla intermedia que relaciona qué eventos ofrece cada capilla
    - Una capilla puede ofrecer múltiples eventos y un evento puede ser ofrecido por múltiples capillas
    - Permite activar/desactivar eventos específicos por capilla

VarianteEvento (EventVariant)
    - Diferentes configuraciones de un evento específico en una capilla
    - Puede ser para un beneficiario (matrimonio individual) o varios (matrimonio comunitario)
    - Especifica precio actual, capacidad máxima, nombre y descripción
    - Nombres únicos por evento de capilla

Reserva (Reservation)
    - Vincula una persona a una variante de evento específica
    - Incluye fecha del evento, fecha de registro, posible reprogramación
    - Estados: RESERVED, REJECTED, IN_PROGRESS, COMPLETED, FULFILLED, CANCELLED
    - Monto pagado y validación de que el evento sea en el futuro
RequisitosBase (BaseRequirement)
    - Requisitos predefinidos por el sistema para cada tipo de evento
    - Aplicables a nivel de evento (no específicos de una capilla)
    - Pueden activarse/desactivarse pero son estándar del sistema
    - Nombres únicos por evento

RequisitosCapillaEvento (ChapelEventRequirement)
    - Requisitos adicionales definidos específicamente por cada capilla para sus eventos
    - Complementan a los requisitos base del sistema
    - Permiten personalización por capilla
    - Nombres únicos por evento de capilla

RequisitosReserva (ReservationRequirement)
    - Copia de todos los requisitos (base y adicionales) activos al momento de realizar una reserva
    - Permite saber qué reserva tiene qué requisitos pendientes o completados
    - Referencia tanto a requisitos base como a requisitos específicos de capilla
    - Marcado como completado por trabajadores de la capilla
TipoDocumento (DocumentType)
    - Catálogo de tipos de documentos de identidad (cédula, pasaporte, documento extranjero, etc.)
    - Permite normalizar y validar los tipos de documentos que pueden usar las personas
    - Incluye código único y nombre descriptivo, puede activarse/desactivarse
Permiso (Permission)
    - Define los permisos del sistema que pueden ser asignados a los roles
    - Permisos granulares como gestionar usuarios, crear eventos, aprobar reservas, etc.
    - Organizados por categorías (USUARIOS, EVENTOS, RESERVAS, CONFIGURACION)
    - Son definidos por el propietario del sistema y aplicables a todas las parroquias
RolPermiso (RolePermission)
    - Tabla intermedia que asigna permisos específicos a cada rol de una parroquia
    - Permite otorgar y revocar permisos individualmente
    - Mantiene historial de cuándo se asignó o revocó cada permiso
UsuarioRol (UserRole)
    - Tabla intermedia que asigna roles específicos a usuarios dentro de sus asociaciones
    - Un usuario puede tener múltiples roles en la misma parroquia
    - Mantiene historial de cuándo se asignó o revocó cada rol
    - Vincula la asociación (usuario-parroquia) con los roles específicos

Notificacion (Notification)
    - Almacena las notificaciones enviadas a los usuarios del sistema
    - Cada notificación tiene un título, cuerpo descriptivo y estado de lectura
    - Permite rastrear qué notificaciones han sido leídas por cada usuario
    - Se eliminan en cascada cuando se elimina el usuario asociado
    - Registra fecha de creación y última actualización