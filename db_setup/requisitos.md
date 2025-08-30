Parroquia (Parish)
    - Funciona como una página de facebook, debe tener un usuario/persona que es el lo creó y administra
    - Datos de cada parroquia (nombre, dirección, correo, celular, 2 colores, foto de perfil y portada, usuario administrador).
HorarioGeneral (GeneralSchedule)
    - Disponibilidad recurrente de la parroquia.
    - Día de la semana, hora de inicio y fin, estado (habilitado, deshabilitado, etc.).
HorarioEspecifico (SpecificSchedule)
    - Añade excepciones al horario (tiene más jerarquía)
    - Momentos en los que sí se atiende auqnue horario general indique que no
    - Momentos en los que no se atiende auqnue horario general indique que sí
Persona (Person)
    - Información personal: nombre, email, documento, tipo de documento, foto
    - Cualquier persona, puede hacer reserva de un evento en cualquier parroquia y puede trabajar para una en el momento actual
Usuario (User)
    - Asociado a una persona, es la información de acceso a su cuenta
Asociacion (Association)
    - El histórico de qué usuario trabaja para que parroquia desde un momento inicial y un momento final (nulo si sigue trabajando para dicha parroquia)
    - Permite vincular a una persona a una parroquita sin que se tenga que crear otro registro se cambia de parroquia y mantiendo un histórico, así no se "rompen" los datos a futuro
Rol (Role)
    - Cada parroquia define que roles tienes y los nombres de estos
    - Las personas asignadas a una parroquia, tiene 0, 1 o más roles de dicha parroquia
    - Define niveles de acceso para los usuarios.
Evento (Event)
    - Actividades o servicios ofrecidos por parroquita.
    - Tienen requisitos activos, los cuales deben ser cumplidos para realizar una reserva. 
VarianteEvento (EventVariant)
    - Puede ser para un benficiario (una pareja que se va a casar, una persona que se va a bautizar) o para varios (matrimonios comunitarios, bautizos comunitarios, etc)
    - Relacionados con los eventos de una parroquia.
    - Indica precio actual y capacidad
Reserva (Reservation)
    - Vincula una persona a la separación de un VarianteEvento o un Evento normal, si la cantidad de reservas para dicha VarianteEvento no excede aún la capacidad
    - Detalla la fecha y hora que se reerva y la fecha y hora del registro de esta.
    - Indica el estado, si está como una reservada aceptada de continuar su proceso o quizá es rechazada por cuestiones internas de la parroquia, si está en proceso (faltan requisitos), completada (todos los requisitos satisfechos) o cumplida (ya se realizó el evento).
RequisitosBase (BaseRequirement)
    - Indica un requisito activo o no activo de un evento de una parroquia
RequisitosReserva (ReservationRequirement)
    - Es la copia de los requisitos activos al momento de realizar una reserva
    - Permite saber que reserva tiene que requisitos por aprobar, o completados
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