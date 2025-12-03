const errorMiddleware = (err, req, res, next) => {
  console.error('Error capturado:', {
    name: err.name,
    message: err.message,
    code: err.code,
    constraint: err.constraint,
    detail: err.detail
  });

  // Manejo de errores de PostgreSQL
  if (err.code) {
    switch (err.code) {
      // 23505: Violación de restricción de unicidad
      case '23505':
        let uniqueMessage = 'Ya existe un registro con esos datos';
        
        // Mapeo de constraints a mensajes específicos
        const constraintMessages = {
          'document_type_code_key': 'Ya existe un tipo de documento con ese nombre corto',
          'document_type_pkey': 'Ya existe un tipo de documento con ese ID',
          'person_email_key': 'Ya existe una persona registrada con ese correo',
          'user_username_key': 'Ya existe un usuario con ese nombre de usuario',
          'user_pkey': 'Ya existe un usuario con ese ID',
          'parish_pkey': 'Ya existe una parroquia con ese ID',
          'chapel_pkey': 'Ya existe una capilla con ese ID',
          'uk_chapel_parish_name': 'Ya existe una capilla con ese nombre en esta parroquia',
          'role_pkey': 'Ya existe un rol con ese ID',
          'uk_role_parish_name': 'Ya existe un rol con ese nombre en esta parroquia',
          'uk_role_permission_active': 'Este permiso ya está asignado a este rol',
          'uk_user_role_active': 'Este rol ya está asignado a este usuario o ya fue revocado anteriormente',
          'event_pkey': 'Ya existe un evento con ese ID',
          'uk_event_name': 'Ya existe un evento con ese nombre',
          'uk_chapel_event': 'Este evento ya está asignado a esta capilla',
          'uk_event_variant_name': 'Ya existe esa variante para este evento',
          'uk_base_requirement_event_name': 'Ya existe un requisito con ese nombre',
          'uk_chapel_event_requirement_name': 'Ya existe ese requisito para este evento',
          'uk_general_schedule_chapel_day': 'Ya existe un horario general para ese día y hora en esta capilla',
          'mention_type_code_key': 'Ya existe un tipo de mención con ese código',
          'mention_type_name_key': 'Ya existe un tipo de mención con ese nombre',
          'mention_type_pkey': 'Ya existe un tipo de mención con ese ID'
        };

        if (err.constraint && constraintMessages[err.constraint]) {
          uniqueMessage = constraintMessages[err.constraint];
        } else if (err.detail) {
          // Intentar extraer información del detalle
          const detailMatch = err.detail.match(/Key \((.+?)\)=\((.+?)\)/);
          if (detailMatch) {
            const field = detailMatch[1];
            const value = detailMatch[2];
            uniqueMessage = `Ya existe un registro con ${field} = '${value}'`;
          }
        }

        return res.status(409).json({
          success: false,
          status: 409,
          message: uniqueMessage,
          error: 'DUPLICATE_ENTRY',
          traceback: ''
        });

      // 23503: Violación de clave foránea
      case '23503':
        let foreignKeyMessage = 'Referencia inválida: el registro relacionado no existe';
        
        const foreignKeyMessages = {
          'fk_person_document_type': 'El tipo de documento especificado no existe',
          'fk_user_person': 'La persona especificada no existe',
          'fk_parish_admin': 'El usuario administrador especificado no existe',
          'fk_chapel_parish': 'La parroquia especificada no existe',
          'fk_role_parish': 'La parroquia especificada no existe',
          'fk_role_permission_role': 'El rol especificado no existe',
          'fk_role_permission_permission': 'El permiso especificado no existe',
          'fk_association_user': 'El usuario especificado no existe',
          'fk_association_parish': 'La parroquia especificada no existe',
          'fk_user_role_association': 'La asociación especificada no existe',
          'fk_user_role_role': 'El rol especificado no existe',
          'fk_general_schedule_chapel': 'La capilla especificada no existe',
          'fk_specific_schedule_chapel': 'La capilla especificada no existe',
          'fk_chapel_event_chapel': 'La capilla especificada no existe',
          'fk_chapel_event_event': 'El evento especificado no existe',
          'fk_event_variant_chapel_event': 'El evento de capilla especificado no existe',
          'fk_reservation_user': 'El usuario especificado no existe',
          'fk_reservation_event_variant': 'La variante de evento especificada no existe',
          'fk_base_requirement_event': 'El evento especificado no existe',
          'fk_chapel_event_requirement_chapel_event': 'El evento de capilla especificado no existe',
          'fk_reservation_requirement_reservation': 'La reserva especificada no existe',
          'fk_reservation_requirement_base': 'El requisito base especificado no existe',
          'fk_reservation_requirement_chapel': 'El requisito de capilla especificado no existe',
          'fk_mention_reservation': 'La reserva especificada no existe',
          'fk_mention_type': 'El tipo de mención especificado no existe',
          'fk_payment_reservation': 'La reserva especificada no existe',
          'fk_payment_registered_by_worker': 'El trabajador especificado no existe',
          'fk_notification_user': 'El usuario especificado no existe'
        };

        if (err.constraint && foreignKeyMessages[err.constraint]) {
          foreignKeyMessage = foreignKeyMessages[err.constraint];
        }

        return res.status(400).json({
          success: false,
          status: 400,
          message: foreignKeyMessage,
          error: 'FOREIGN_KEY_VIOLATION',
          traceback: ''
        });

      // 23502: Violación de NOT NULL
      case '23502':
        const column = err.column || 'un campo requerido';
        const notNullMessage = `El campo '${column}' es obligatorio y no puede estar vacío`;

        return res.status(400).json({
          success: false,
          status: 400,
          message: notNullMessage,
          error: 'MISSING_REQUIRED_FIELD',
          traceback: ''
        });

      // 23514: Violación de CHECK constraint
      case '23514':
        let checkMessage = 'Los datos no cumplen con las restricciones de validación';
        
        const checkMessages = {
          'chk_schedule_valid': 'La hora de fin debe ser posterior a la hora de inicio',
          'chk_specific_schedule_valid': 'Horario específico inválido: verifique los datos',
          'chk_dates_valid': 'La fecha de fin debe ser posterior a la fecha de inicio',
          'chk_permission_dates_valid': 'La fecha de revocación debe ser posterior a la fecha de asignación',
          'chk_role_dates_valid': 'La fecha de revocación debe ser posterior a la fecha de asignación',
          'reservation_status_check': 'Estado de reserva inválido',
          'general_schedule_day_of_week_check': 'El día de la semana debe estar entre 0 (domingo) y 6 (sábado)',
          'specific_schedule_exception_type_check': 'Tipo de excepción inválido',
          'event_variant_max_capacity_check': 'La capacidad máxima debe ser mayor a 0',
          'event_variant_duration_minutes_check': 'La duración debe ser mayor a 0 minutos',
          'payment_amount_check': 'El monto del pago debe ser mayor a 0'
        };

        if (err.constraint && checkMessages[err.constraint]) {
          checkMessage = checkMessages[err.constraint];
        }

        return res.status(400).json({
          success: false,
          status: 400,
          message: checkMessage,
          error: 'VALIDATION_FAILED',
          traceback: ''
        });

      // 22P02: Formato de dato inválido
      case '22P02':
        return res.status(400).json({
          success: false,
          status: 400,
          message: 'Formato de dato inválido. Verifique los tipos de datos enviados',
          error: 'INVALID_DATA_FORMAT',
          traceback: ''
        });

      // 22003: Valor numérico fuera de rango
      case '22003':
        return res.status(400).json({
          success: false,
          status: 400,
          message: 'Valor numérico fuera del rango permitido',
          error: 'NUMERIC_OUT_OF_RANGE',
          traceback: ''
        });

      // 22001: Dato demasiado largo
      case '22001':
        return res.status(400).json({
          success: false,
          status: 400,
          message: 'El dato proporcionado excede la longitud máxima permitida',
          error: 'DATA_TOO_LONG',
          traceback: ''
        });

      // 42P01: Tabla no existe
      case '42P01':
        return res.status(500).json({
          success: false,
          status: 500,
          message: 'Error interno: recurso no encontrado en la base de datos',
          error: 'INTERNAL_ERROR',
          traceback: ''
        });
    }
  }

  // Errores personalizados con statusCode
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  // Formato de respuesta según el patrón del proyecto
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    error: err.name || 'SERVER_ERROR',
    traceback: process.env.NODE_ENV === 'development' ? err.stack : ''
  });
};

module.exports = errorMiddleware;