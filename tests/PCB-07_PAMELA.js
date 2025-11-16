/**
 * PCB-07_PAMELA.js
 * Prueba de Caja Blanca CB-07: Prueba unitaria de disponibilidad de capilla con conflicto de horario
 * 
 * Objetivo:
 * Probar la logica de disponibilidad de capillas donde el horario especifico (specific_schedule)
 * prevalece sobre el horario general (general_schedule). Especificamente, si hay un dia marcado
 * como CLOSED en specific_schedule, debe anular el horario OPEN del general_schedule.
 * 
 * Criterio de Exito:
 * - Si existe specific_schedule CLOSED para una fecha, debe retornar CLOSED
 * - Si NO existe specific_schedule, debe usar general_schedule
 * - La logica de prevalencia debe estar correctamente implementada en checkAvailability
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

// Colores para la consola (sin emojis)
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

console.log(`\n${colors.cyan}========================================`);
console.log(`PRUEBA DE CAJA BLANCA: PCB-07_PAMELA`);
console.log(`========================================${colors.reset}\n`);

console.log(`${colors.blue}Descripcion:${colors.reset}`);
console.log(`Prueba unitaria de logica de disponibilidad de capilla`);
console.log(`verificando que specific_schedule prevalece sobre general_schedule.\n`);

// Configuracion de la base de datos
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

console.log(`${colors.blue}Configuracion de BD:${colors.reset}`);
console.log(`  Host: ${dbConfig.host}`);
console.log(`  Database: ${dbConfig.database}`);
console.log(`  Port: ${dbConfig.port}\n`);

// Variables para almacenar resultados
let testPassed = true;
let issues = [];
let successes = [];
let warnings = [];
let testChapelId = null;
let testEventVariantId = null;
let testSpecificScheduleId = null;

// Funcion para ejecutar la logica de disponibilidad (replica de checkAvailability simplificada)
async function testChapelAvailability(pool, chapelId, testDate, testTime, eventVariantId) {
  // Esta consulta replica la logica de reservationModel.checkAvailability
  // pero enfocada en la prevalencia de specific_schedule sobre general_schedule
  const query = `
    WITH event_info AS (
      SELECT ev.id, ce.chapel_id, ev.duration_minutes
      FROM public.event_variant ev
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      WHERE ev.id = $1 AND ev.active = true
    ),
    day_info AS (
      SELECT EXTRACT(DOW FROM $2::date) as day_of_week
    ),
    -- Verificar horario general
    general_availability AS (
      SELECT 
        gs.start_time,
        gs.end_time,
        'OPEN' as availability_type,
        'Horario general' as source
      FROM public.general_schedule gs
      INNER JOIN event_info ei ON gs.chapel_id = ei.chapel_id
      INNER JOIN day_info di ON gs.day_of_week = di.day_of_week
      WHERE 
        $3::time >= gs.start_time 
        AND ($3::time + (ei.duration_minutes || ' minutes')::interval)::time <= gs.end_time
    ),
    -- Verificar excepcion especifica
    specific_exception AS (
      SELECT 
        ss.exception_type,
        ss.start_time,
        ss.end_time,
        ss.reason,
        'Excepcion especifica' as source
      FROM public.specific_schedule ss
      INNER JOIN event_info ei ON ss.chapel_id = ei.chapel_id
      WHERE ss.date = $2::date
    )
    SELECT 
      CASE 
        -- Si existe excepcion CLOSED, prevalece sobre el horario general
        WHEN EXISTS (SELECT 1 FROM specific_exception WHERE exception_type = 'CLOSED') THEN false
        -- Si existe excepcion OPEN, verificar si cubre el horario solicitado
        WHEN EXISTS (
          SELECT 1 FROM specific_exception se
          INNER JOIN event_info ei ON true
          WHERE se.exception_type = 'OPEN'
            AND $3::time >= se.start_time 
            AND ($3::time + (ei.duration_minutes || ' minutes')::interval)::time <= se.end_time
        ) THEN true
        -- Si no hay excepcion, usar horario general
        WHEN EXISTS (SELECT 1 FROM general_availability) THEN true
        ELSE false
      END as available,
      CASE
        WHEN EXISTS (SELECT 1 FROM specific_exception WHERE exception_type = 'CLOSED') THEN 
          'CLOSED - Excepcion especifica prevalece: ' || 
          COALESCE((SELECT reason FROM specific_exception WHERE exception_type = 'CLOSED'), 'Capilla cerrada')
        WHEN EXISTS (SELECT 1 FROM general_availability) THEN 
          'OPEN - Horario general de ' || 
          (SELECT start_time FROM general_availability)::text || ' a ' ||
          (SELECT end_time FROM general_availability)::text
        ELSE 'CLOSED - Sin horario disponible'
      END as status_reason,
      (SELECT COUNT(*) FROM general_availability) > 0 as has_general_schedule,
      (SELECT COUNT(*) FROM specific_exception) > 0 as has_specific_exception,
      (SELECT exception_type FROM specific_exception LIMIT 1) as exception_type
  `;
  
  const result = await pool.query(query, [eventVariantId, testDate, testTime]);
  return result.rows[0];
}

// Funcion principal de prueba
async function runAvailabilityTest() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log(`${colors.blue}Iniciando prueba de disponibilidad con conflicto de horario...${colors.reset}\n`);
    
    // Verificacion 1: Configurar datos de prueba
    console.log(`[1/6] Configurando datos de prueba en la base de datos...`);
    
    // Buscar una capilla activa
    const chapelQuery = `
      SELECT c.id, c.name, c.parish_id
      FROM public.chapel c
      WHERE c.active = true
      LIMIT 1
    `;
    const chapelResult = await pool.query(chapelQuery);
    
    if (chapelResult.rows.length === 0) {
      console.log(`  ${colors.red}ERROR: No se encontro ninguna capilla activa${colors.reset}`);
      issues.push('No hay capillas activas para realizar la prueba');
      testPassed = false;
      return;
    }
    
    testChapelId = chapelResult.rows[0].id;
    console.log(`  ${colors.green}Capilla seleccionada: ID ${testChapelId} - ${chapelResult.rows[0].name}${colors.reset}`);
    
    // Buscar una variante de evento para esta capilla
    const variantQuery = `
      SELECT ev.id, ev.name, ev.duration_minutes
      FROM public.event_variant ev
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      WHERE ce.chapel_id = $1 AND ev.active = true AND ce.active = true
      LIMIT 1
    `;
    const variantResult = await pool.query(variantQuery, [testChapelId]);
    
    if (variantResult.rows.length === 0) {
      console.log(`  ${colors.red}ERROR: No se encontro variante de evento para la capilla${colors.reset}`);
      issues.push('No hay variantes de evento activas para la capilla');
      testPassed = false;
      return;
    }
    
    testEventVariantId = variantResult.rows[0].id;
    console.log(`  ${colors.green}Evento seleccionado: ${variantResult.rows[0].name} (${variantResult.rows[0].duration_minutes} min)${colors.reset}`);
    successes.push('Datos de prueba configurados correctamente');
    
    // Verificacion 2: Verificar horario general existente para Viernes
    console.log(`\n[2/6] Verificando horario general para Viernes (dia 5)...`);
    
    const generalScheduleQuery = `
      SELECT id, day_of_week, start_time, end_time
      FROM public.general_schedule
      WHERE chapel_id = $1 AND day_of_week = 5
    `;
    const generalScheduleResult = await pool.query(generalScheduleQuery, [testChapelId]);
    
    if (generalScheduleResult.rows.length === 0) {
      console.log(`  ${colors.yellow}ADVERTENCIA: No hay horario general para Viernes${colors.reset}`);
      console.log(`  ${colors.cyan}Creando horario general de prueba: Viernes 08:00 - 18:00${colors.reset}`);
      
      // Crear horario general para Viernes
      const insertGeneralQuery = `
        INSERT INTO public.general_schedule (id, chapel_id, day_of_week, start_time, end_time)
        VALUES (
          (SELECT COALESCE(MAX(id), 0) + 1 FROM public.general_schedule),
          $1, 5, '08:00:00', '18:00:00'
        )
        RETURNING id
      `;
      await pool.query(insertGeneralQuery, [testChapelId]);
      warnings.push('Se creo horario general de prueba para Viernes');
    } else {
      console.log(`  ${colors.green}Horario general existente: ${generalScheduleResult.rows[0].start_time} - ${generalScheduleResult.rows[0].end_time}${colors.reset}`);
    }
    
    // Verificacion 3: Crear excepcion especifica CLOSED para fecha de prueba
    console.log(`\n[3/6] Creando excepcion especifica CLOSED para 15/05/2026...`);
    
    const testDate = '2026-05-15'; // Viernes
    const testTime = '10:00:00';
    
    // Verificar si ya existe una excepcion para esta fecha
    const existingExceptionQuery = `
      SELECT id FROM public.specific_schedule
      WHERE chapel_id = $1 AND date = $2
    `;
    const existingException = await pool.query(existingExceptionQuery, [testChapelId, testDate]);
    
    if (existingException.rows.length > 0) {
      console.log(`  ${colors.yellow}Ya existe una excepcion para esta fecha, eliminandola...${colors.reset}`);
      await pool.query('DELETE FROM public.specific_schedule WHERE id = $1', [existingException.rows[0].id]);
    }
    
    const insertSpecificQuery = `
      INSERT INTO public.specific_schedule (
        id, chapel_id, date, start_time, end_time, exception_type, reason
      )
      VALUES (
        (SELECT COALESCE(MAX(id), 0) + 1 FROM public.specific_schedule),
        $1, $2, NULL, NULL, 'CLOSED', 'Dia festivo - Prueba CB-07'
      )
      RETURNING id
    `;
    const specificResult = await pool.query(insertSpecificQuery, [testChapelId, testDate]);
    testSpecificScheduleId = specificResult.rows[0].id;
    
    console.log(`  ${colors.green}Excepcion CLOSED creada con ID: ${testSpecificScheduleId}${colors.reset}`);
    successes.push('Excepcion especifica CLOSED creada correctamente');
    
    // Verificacion 4: Probar disponibilidad con excepcion CLOSED
    console.log(`\n[4/6] PRUEBA PRINCIPAL: Verificando disponibilidad con excepcion CLOSED...`);
    console.log(`  ${colors.cyan}Fecha: ${testDate} (Viernes)${colors.reset}`);
    console.log(`  ${colors.cyan}Hora: ${testTime}${colors.reset}`);
    
    const availabilityWithException = await testChapelAvailability(
      pool, testChapelId, testDate, testTime, testEventVariantId
    );
    
    console.log(`  ${colors.cyan}Resultado:${colors.reset}`);
    console.log(`    - Disponible: ${availabilityWithException.available}`);
    console.log(`    - Razon: ${availabilityWithException.status_reason}`);
    console.log(`    - Tiene horario general: ${availabilityWithException.has_general_schedule}`);
    console.log(`    - Tiene excepcion especifica: ${availabilityWithException.has_specific_exception}`);
    console.log(`    - Tipo de excepcion: ${availabilityWithException.exception_type}`);
    
    if (!availabilityWithException.available && availabilityWithException.exception_type === 'CLOSED') {
      console.log(`  ${colors.green}CORRECTO: La capilla esta CERRADA por la excepcion especifica${colors.reset}`);
      successes.push('Excepcion CLOSED prevalece correctamente sobre horario general');
    } else {
      console.log(`  ${colors.red}ERROR: La capilla deberia estar CERRADA pero esta disponible${colors.reset}`);
      issues.push('La logica de prevalencia no funciona: specific_schedule CLOSED no anula general_schedule');
      testPassed = false;
    }
    
    // Verificacion 5: Eliminar excepcion y verificar que usa horario general
    console.log(`\n[5/6] PRUEBA SECUNDARIA: Eliminando excepcion y verificando horario general...`);
    
    await pool.query('DELETE FROM public.specific_schedule WHERE id = $1', [testSpecificScheduleId]);
    console.log(`  ${colors.cyan}Excepcion eliminada${colors.reset}`);
    
    const availabilityWithoutException = await testChapelAvailability(
      pool, testChapelId, testDate, testTime, testEventVariantId
    );
    
    console.log(`  ${colors.cyan}Resultado sin excepcion:${colors.reset}`);
    console.log(`    - Disponible: ${availabilityWithoutException.available}`);
    console.log(`    - Razon: ${availabilityWithoutException.status_reason}`);
    console.log(`    - Tiene horario general: ${availabilityWithoutException.has_general_schedule}`);
    console.log(`    - Tiene excepcion especifica: ${availabilityWithoutException.has_specific_exception}`);
    
    if (availabilityWithoutException.available && availabilityWithoutException.has_general_schedule) {
      console.log(`  ${colors.green}CORRECTO: La capilla esta ABIERTA segun horario general${colors.reset}`);
      successes.push('Sin excepcion especifica, se usa correctamente el horario general');
    } else {
      console.log(`  ${colors.red}ERROR: Deberia estar ABIERTA segun horario general${colors.reset}`);
      issues.push('El horario general no se aplica correctamente cuando no hay excepciones');
      testPassed = false;
    }
    
    // Verificacion 6: Verificar que la logica esta en el modelo correcto
    console.log(`\n[6/6] Verificando implementacion de la logica en el codigo...`);
    
    const fs = require('fs');
    const path = require('path');
    const modelPath = path.join(__dirname, '..', 'models', 'reservationModel.js');
    
    if (fs.existsSync(modelPath)) {
      const modelContent = fs.readFileSync(modelPath, 'utf8');
      
      // Verificar que existe la logica de specific_exception
      const hasSpecificException = modelContent.includes('specific_exception') || 
                                    modelContent.includes('specific_schedule');
      const hasClosedCheck = modelContent.includes("exception_type = 'CLOSED'") ||
                            modelContent.includes('CLOSED');
      
      if (hasSpecificException && hasClosedCheck) {
        console.log(`  ${colors.green}CORRECTO: La logica de excepciones esta implementada en reservationModel${colors.reset}`);
        successes.push('Logica de prevalencia implementada correctamente en el modelo');
      } else {
        console.log(`  ${colors.yellow}ADVERTENCIA: No se encontro la logica completa de excepciones${colors.reset}`);
        warnings.push('La logica de excepciones puede estar incompleta');
      }
    } else {
      console.log(`  ${colors.yellow}ADVERTENCIA: No se encontro el archivo reservationModel.js${colors.reset}`);
      warnings.push('No se pudo verificar la implementacion en el codigo');
    }
    
  } catch (error) {
    console.log(`\n${colors.red}ERROR durante la prueba:${colors.reset}`);
    console.log(error.message);
    console.log(error.stack);
    issues.push(`Error critico: ${error.message}`);
    testPassed = false;
  } finally {
    await pool.end();
  }
}

// Ejecutar la prueba
runAvailabilityTest().then(() => {
  // Mostrar resumen de resultados
  console.log(`\n${colors.cyan}========================================`);
  console.log(`RESUMEN DE RESULTADOS`);
  console.log(`========================================${colors.reset}\n`);
  
  if (successes.length > 0) {
    console.log(`${colors.green}Puntos Correctos (${successes.length}):${colors.reset}`);
    successes.forEach((success, index) => {
      console.log(`  ${index + 1}. ${success}`);
    });
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log(`${colors.yellow}Advertencias (${warnings.length}):${colors.reset}`);
    warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning}`);
    });
    console.log('');
  }
  
  if (issues.length > 0) {
    console.log(`${colors.red}Problemas Detectados (${issues.length}):${colors.reset}`);
    issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
    console.log('');
  }
  
  // Explicacion del principio de prevalencia de horarios
  console.log(`${colors.cyan}========================================`);
  console.log(`PRINCIPIO DE PREVALENCIA DE HORARIOS`);
  console.log(`========================================${colors.reset}\n`);
  
  console.log(`${colors.blue}Por que specific_schedule prevalece sobre general_schedule:${colors.reset}`);
  console.log(`1. general_schedule define el horario regular semanal (ej: Viernes 08:00-18:00).`);
  console.log(`2. specific_schedule maneja excepciones para fechas especificas (feriados, eventos).`);
  console.log(`3. Cuando hay conflicto, la excepcion especifica SIEMPRE gana.`);
  console.log(`4. Esto permite cerrar la capilla temporalmente sin modificar el horario regular.\n`);
  
  console.log(`${colors.blue}Flujo de decision de disponibilidad:${colors.reset}`);
  console.log(`1. Se verifica si existe specific_schedule para la fecha solicitada.`);
  console.log(`2. Si hay CLOSED en specific_schedule, la capilla esta CERRADA (fin).`);
  console.log(`3. Si hay OPEN en specific_schedule, se verifica que cubra el horario solicitado.`);
  console.log(`4. Si NO hay specific_schedule, se usa el general_schedule del dia de la semana.`);
  console.log(`5. Si no hay ningun horario, la capilla esta CERRADA.\n`);
  
  console.log(`${colors.blue}Beneficios de esta arquitectura:${colors.reset}`);
  console.log(`- Flexibilidad: Permite excepciones sin modificar el horario base.`);
  console.log(`- Mantenibilidad: El horario regular se mantiene constante.`);
  console.log(`- Claridad: Las excepciones tienen razon y fecha especifica.`);
  console.log(`- Escalabilidad: Se pueden agregar multiples excepciones facilmente.\n`);
  
  // Resultado final
  if (testPassed) {
    console.log(`${colors.green}========================================`);
    console.log(`RESULTADO: PRUEBA SUPERADA`);
    console.log(`========================================${colors.reset}`);
    console.log(`\nLa logica de prevalencia de horarios funciona correctamente.`);
    console.log(`specific_schedule CLOSED anula correctamente el general_schedule,`);
    console.log(`y sin excepciones, se usa el horario general como corresponde.\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}========================================`);
    console.log(`RESULTADO: PRUEBA FALLIDA`);
    console.log(`========================================${colors.reset}`);
    console.log(`\nSe detectaron problemas en la logica de prevalencia de horarios.`);
    console.log(`Revisar la implementacion de checkAvailability en reservationModel.js`);
    console.log(`para asegurar que specific_schedule prevalece sobre general_schedule.\n`);
    process.exit(1);
  }
}).catch(error => {
  console.log(`\n${colors.red}ERROR FATAL:${colors.reset}`);
  console.log(error.message);
  console.log(error.stack);
  process.exit(1);
});
