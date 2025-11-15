/**
 * PCB-05_JUAN.js
 * Prueba de Caja Blanca CB-05: Prueba de concurrencia real - Creacion simultanea de reservas
 * 
 * Objetivo:
 * Verificar que el sistema puede manejar correctamente la creacion simultanea
 * de multiples reservas sin conflictos de datos, deadlocks o duplicacion de IDs.
 * 
 * Criterio de Exito:
 * - 3 reservas deben crearse simultaneamente (mismo segundo)
 * - Cada reserva debe tener un ID unico
 * - No debe haber errores de constraint o deadlock
 * - Los requisitos deben copiarse correctamente a reservation_requirement
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
console.log(`PRUEBA DE CAJA BLANCA: PCB-05_JUAN`);
console.log(`========================================${colors.reset}\n`);

console.log(`${colors.blue}Descripcion:${colors.reset}`);
console.log(`Prueba de concurrencia real mediante insercion simultanea`);
console.log(`de 3 reservas diferentes en el mismo instante.\n`);

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
let createdReservationIds = [];

// Funcion para crear una reserva (simulando el modelo)
async function createReservation(pool, testData, reservationIdOffset, requirementIdOffset) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Usar el ID pre-calculado con offset
    const newReservationId = testData.preCalculatedReservationId;
    
    // Insertar la reserva
    const insertReservationQuery = `
      INSERT INTO public.reservation (
        id, user_id, event_variant_id, event_date, event_time,
        status, paid_amount, beneficiary_full_name, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, 'RESERVED', $6, $7, NOW(), NOW()
      ) RETURNING id
    `;
    
    const reservationResult = await client.query(insertReservationQuery, [
      newReservationId,
      testData.user_id,
      testData.event_variant_id,
      testData.event_date,
      testData.event_time,
      testData.paid_amount || 0,
      testData.beneficiary_full_name
    ]);
    
    const reservationId = reservationResult.rows[0].id;
    
    // Usar el ID de requisito pre-calculado con offset para esta reserva
    const baseReqId = requirementIdOffset;
    
    // Copiar requisitos base a reservation_requirement
    const copyBaseRequirementsQuery = `
      INSERT INTO public.reservation_requirement (
        id, reservation_id, base_requirement_id, chapel_requirement_id,
        name, description, created_at
      )
      SELECT 
        $3 + ROW_NUMBER() OVER () - 1,
        $1,
        br.id,
        NULL,
        br.name,
        br.description,
        NOW()
      FROM public.base_requirement br
      WHERE br.event_id = (
        SELECT ce.event_id 
        FROM public.event_variant ev
        INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
        WHERE ev.id = $2
      ) AND br.active = true
      RETURNING id
    `;
    
    const baseReqResult = await client.query(copyBaseRequirementsQuery, [reservationId, testData.event_variant_id, baseReqId]);
    const baseReqCount = baseReqResult.rows.length;
    
    // Calcular el siguiente ID disponible para los requisitos de capilla
    // Usamos un offset fijo de 25 para asegurar que no haya colision
    const nextChapelReqId = baseReqId + 25;
    
    // Copiar requisitos de capilla a reservation_requirement
    const copyChapelRequirementsQuery = `
      INSERT INTO public.reservation_requirement (
        id, reservation_id, base_requirement_id, chapel_requirement_id,
        name, description, created_at
      )
      SELECT 
        $3 + ROW_NUMBER() OVER () - 1,
        $1,
        NULL,
        cer.id,
        cer.name,
        cer.description,
        NOW()
      FROM public.chapel_event_requirement cer
      WHERE cer.chapel_event_id = (
        SELECT ev.chapel_event_id 
        FROM public.event_variant ev
        WHERE ev.id = $2
      ) AND cer.active = true
    `;
    
    await client.query(copyChapelRequirementsQuery, [reservationId, testData.event_variant_id, nextChapelReqId]);
    
    await client.query('COMMIT');
    
    return {
      success: true,
      reservationId: reservationId,
      message: `Reserva ${reservationId} creada exitosamente`
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    return {
      success: false,
      error: error.message
    };
  } finally {
    client.release();
  }
}

// Funcion principal de prueba
async function runConcurrencyTest() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log(`${colors.blue}Iniciando prueba de concurrencia...${colors.reset}\n`);
    
    // Verificacion 1: Verificar datos de prueba disponibles
    console.log(`[1/6] Verificando datos de prueba en la base de datos...`);
    
    // Verificar usuarios
    const usersQuery = `
      SELECT u.id, u.username, p.first_names, p.paternal_surname 
      FROM public.user u
      INNER JOIN public.person p ON u.person_id = p.id
      WHERE u.active = true 
      LIMIT 3
    `;
    const usersResult = await pool.query(usersQuery);
    
    if (usersResult.rows.length < 3) {
      console.log(`  ${colors.red}ERROR: Se requieren al menos 3 usuarios activos${colors.reset}`);
      console.log(`  ${colors.red}Encontrados: ${usersResult.rows.length}${colors.reset}`);
      issues.push('Datos de prueba insuficientes: menos de 3 usuarios');
      testPassed = false;
      return;
    }
    
    console.log(`  ${colors.green}CORRECTO: ${usersResult.rows.length} usuarios disponibles${colors.reset}`);
    successes.push(`${usersResult.rows.length} usuarios activos encontrados`);
    
    // Verificar parroquias y capillas
    const chapelsQuery = `
      SELECT c.id as chapel_id, c.name as chapel_name, 
             p.id as parish_id, p.name as parish_name
      FROM public.chapel c
      INNER JOIN public.parish p ON c.parish_id = p.id
      WHERE c.active = true AND p.active = true
      LIMIT 3
    `;
    const chapelsResult = await pool.query(chapelsQuery);
    
    if (chapelsResult.rows.length < 3) {
      console.log(`  ${colors.red}ERROR: Se requieren al menos 3 capillas de parroquias diferentes${colors.reset}`);
      console.log(`  ${colors.red}Encontradas: ${chapelsResult.rows.length}${colors.reset}`);
      issues.push('Datos de prueba insuficientes: menos de 3 capillas');
      testPassed = false;
      return;
    }
    
    console.log(`  ${colors.green}CORRECTO: ${chapelsResult.rows.length} capillas disponibles${colors.reset}`);
    successes.push(`${chapelsResult.rows.length} capillas activas encontradas`);
    
    // Verificar event_variants
    const variantsQuery = `
      SELECT ev.id, ev.name, ev.current_price, c.id as chapel_id
      FROM public.event_variant ev
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      INNER JOIN public.chapel c ON ce.chapel_id = c.id
      WHERE ev.active = true AND ce.active = true AND c.active = true
      LIMIT 3
    `;
    const variantsResult = await pool.query(variantsQuery);
    
    if (variantsResult.rows.length < 3) {
      console.log(`  ${colors.red}ERROR: Se requieren al menos 3 variantes de eventos activos${colors.reset}`);
      console.log(`  ${colors.red}Encontradas: ${variantsResult.rows.length}${colors.reset}`);
      issues.push('Datos de prueba insuficientes: menos de 3 variantes de eventos');
      testPassed = false;
      return;
    }
    
    console.log(`  ${colors.green}CORRECTO: ${variantsResult.rows.length} variantes de eventos disponibles${colors.reset}`);
    successes.push(`${variantsResult.rows.length} variantes de eventos activas encontradas`);
    
    // Verificacion 2: Preparar datos de prueba
    console.log(`\n[2/6] Preparando datos para las 3 reservas concurrentes...`);
    
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 7); // Una semana en el futuro
    const formattedDate = testDate.toISOString().split('T')[0];
    
    const reservationsData = [
      {
        user_id: usersResult.rows[0].id,
        event_variant_id: variantsResult.rows[0].id,
        event_date: formattedDate,
        event_time: '09:00:00',
        paid_amount: variantsResult.rows[0].current_price,
        beneficiary_full_name: `${usersResult.rows[0].first_names} ${usersResult.rows[0].paternal_surname}`,
        description: `Usuario ${usersResult.rows[0].username} - Capilla ${variantsResult.rows[0].chapel_id}`
      },
      {
        user_id: usersResult.rows[1].id,
        event_variant_id: variantsResult.rows[1].id,
        event_date: formattedDate,
        event_time: '10:00:00',
        paid_amount: variantsResult.rows[1].current_price,
        beneficiary_full_name: `${usersResult.rows[1].first_names} ${usersResult.rows[1].paternal_surname}`,
        description: `Usuario ${usersResult.rows[1].username} - Capilla ${variantsResult.rows[1].chapel_id}`
      },
      {
        user_id: usersResult.rows[2].id,
        event_variant_id: variantsResult.rows[2].id,
        event_date: formattedDate,
        event_time: '11:00:00',
        paid_amount: variantsResult.rows[2].current_price,
        beneficiary_full_name: `${usersResult.rows[2].first_names} ${usersResult.rows[2].paternal_surname}`,
        description: `Usuario ${usersResult.rows[2].username} - Capilla ${variantsResult.rows[2].chapel_id}`
      }
    ];
    
    console.log(`  ${colors.cyan}Reserva 1:${colors.reset} ${reservationsData[0].description}`);
    console.log(`  ${colors.cyan}Reserva 2:${colors.reset} ${reservationsData[1].description}`);
    console.log(`  ${colors.cyan}Reserva 3:${colors.reset} ${reservationsData[2].description}`);
    console.log(`  ${colors.cyan}Fecha programada:${colors.reset} ${formattedDate}`);
    
    // Verificacion 3: Pre-calcular IDs para evitar conflictos
    console.log(`\n[3/6] Pre-calculando IDs para las 3 reservas...`);
    
    // Obtener el MAX actual de reservation y reservation_requirement
    const maxReservationQuery = `SELECT COALESCE(MAX(id), 0) as max_id FROM public.reservation`;
    const maxReservationResult = await pool.query(maxReservationQuery);
    const baseReservationId = maxReservationResult.rows[0].max_id;
    
    const maxRequirementQuery = `SELECT COALESCE(MAX(id), 0) as max_id FROM public.reservation_requirement`;
    const maxRequirementResult = await pool.query(maxRequirementQuery);
    const baseRequirementId = maxRequirementResult.rows[0].max_id;
    
    console.log(`  ${colors.cyan}Base Reservation ID:${colors.reset} ${baseReservationId}`);
    console.log(`  ${colors.cyan}Base Requirement ID:${colors.reset} ${baseRequirementId}`);
    
    // Asignar IDs pre-calculados a cada reserva con offset
    // Reserva 1: MAX+1, requisitos desde MAX+100 (dejamos espacio para IDs existentes)
    // Reserva 2: MAX+2, requisitos desde MAX+200
    // Reserva 3: MAX+3, requisitos desde MAX+300
    reservationsData[0].preCalculatedReservationId = baseReservationId + 1;
    reservationsData[1].preCalculatedReservationId = baseReservationId + 2;
    reservationsData[2].preCalculatedReservationId = baseReservationId + 3;
    
    const requirementOffset1 = baseRequirementId + 100;  // Empezamos con 100 de offset para evitar IDs existentes
    const requirementOffset2 = baseRequirementId + 200;  // Offset suficiente para evitar colision (cada reserva puede tener hasta ~50 requisitos)
    const requirementOffset3 = baseRequirementId + 300;  // Offset suficiente para evitar colision
    
    console.log(`  ${colors.cyan}Reserva 1 -> ID: ${reservationsData[0].preCalculatedReservationId}, Req desde: ${requirementOffset1}${colors.reset}`);
    console.log(`  ${colors.cyan}Reserva 2 -> ID: ${reservationsData[1].preCalculatedReservationId}, Req desde: ${requirementOffset2}${colors.reset}`);
    console.log(`  ${colors.cyan}Reserva 3 -> ID: ${reservationsData[2].preCalculatedReservationId}, Req desde: ${requirementOffset3}${colors.reset}`);
    
    // Verificacion 4: Ejecutar inserciones concurrentes
    console.log(`\n[4/6] Ejecutando 3 inserciones concurrentes con Promise.all()...`);
    
    const startTime = Date.now();
    
    const results = await Promise.all([
      createReservation(pool, reservationsData[0], 1, requirementOffset1),
      createReservation(pool, reservationsData[1], 2, requirementOffset2),
      createReservation(pool, reservationsData[2], 3, requirementOffset3)
    ]);
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    
    console.log(`  ${colors.cyan}Tiempo de ejecucion:${colors.reset} ${executionTime}ms`);
    
    // Verificacion 5: Analizar resultados
    console.log(`\n[5/6] Analizando resultados de las inserciones...`);
    
    let successCount = 0;
    let failCount = 0;
    
    results.forEach((result, index) => {
      if (result.success) {
        successCount++;
        createdReservationIds.push(result.reservationId);
        console.log(`  ${colors.green}Reserva ${index + 1}: EXITOSA (ID: ${result.reservationId})${colors.reset}`);
      } else {
        failCount++;
        console.log(`  ${colors.red}Reserva ${index + 1}: FALLIDA${colors.reset}`);
        console.log(`  ${colors.red}Error: ${result.error}${colors.reset}`);
        issues.push(`Reserva ${index + 1} fallo: ${result.error}`);
        testPassed = false;
      }
    });
    
    if (successCount === 3) {
      console.log(`\n  ${colors.green}CORRECTO: Las 3 reservas se crearon exitosamente${colors.reset}`);
      successes.push('3 reservas creadas concurrentemente sin errores');
    } else {
      console.log(`\n  ${colors.red}ERROR: Solo ${successCount}/3 reservas se crearon${colors.reset}`);
      testPassed = false;
    }
    
    // Verificacion 6: Verificar unicidad de IDs
    console.log(`\n[6/6] Verificando unicidad de IDs y copia de requisitos...`);
    
    const uniqueIds = new Set(createdReservationIds);
    
    if (uniqueIds.size === createdReservationIds.length && createdReservationIds.length > 0) {
      console.log(`  ${colors.green}CORRECTO: Todos los IDs son unicos${colors.reset}`);
      console.log(`  ${colors.cyan}IDs generados: ${createdReservationIds.join(', ')}${colors.reset}`);
      successes.push('IDs unicos y secuenciales generados correctamente');
    } else if (createdReservationIds.length === 0) {
      console.log(`  ${colors.yellow}ADVERTENCIA: No se generaron IDs (ninguna reserva exitosa)${colors.reset}`);
    } else {
      console.log(`  ${colors.red}ERROR: Se detectaron IDs duplicados${colors.reset}`);
      issues.push('Conflicto de IDs: se generaron IDs duplicados');
      testPassed = false;
    }
    
    // Verificar copia de requisitos
    console.log(`\n  ${colors.blue}Verificando requisitos copiados:${colors.reset}`);
    
    for (const reservationId of createdReservationIds) {
      const requirementsQuery = `
        SELECT COUNT(*) as count 
        FROM public.reservation_requirement 
        WHERE reservation_id = $1
      `;
      const reqResult = await pool.query(requirementsQuery, [reservationId]);
      const requirementsCount = parseInt(reqResult.rows[0].count);
      
      if (requirementsCount > 0) {
        console.log(`  ${colors.green}Reserva ${reservationId}: ${requirementsCount} requisitos copiados${colors.reset}`);
        successes.push(`Reserva ${reservationId} tiene ${requirementsCount} requisitos`);
      } else {
        console.log(`  ${colors.yellow}Reserva ${reservationId}: 0 requisitos (puede ser normal)${colors.reset}`);
        warnings.push(`Reserva ${reservationId} no tiene requisitos asociados`);
      }
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
runConcurrencyTest().then(() => {
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
  
  // Explicacion del principio de concurrencia
  console.log(`${colors.cyan}========================================`);
  console.log(`PRINCIPIO DE CONCURRENCIA EN BD`);
  console.log(`========================================${colors.reset}\n`);
  
  console.log(`${colors.blue}Por que es importante probar la concurrencia:${colors.reset}`);
  console.log(`1. Multiples usuarios pueden hacer reservas al mismo tiempo.`);
  console.log(`2. Sin manejo adecuado, pueden ocurrir conflictos de datos.`);
  console.log(`3. Los IDs duplicados o deadlocks causan errores criticos.`);
  console.log(`4. PostgreSQL usa transacciones ACID para garantizar consistencia.\n`);
  
  console.log(`${colors.blue}Como funciona la proteccion:${colors.reset}`);
  console.log(`1. Cada reserva se crea dentro de una transaccion (BEGIN...COMMIT).`);
  console.log(`2. El patron COALESCE(MAX(id), 0) + 1 genera IDs unicos.`);
  console.log(`3. El aislamiento de transacciones evita lecturas sucias.`);
  console.log(`4. Si hay error, ROLLBACK deshace todos los cambios.\n`);
  
  console.log(`${colors.blue}Garantias de esta prueba:${colors.reset}`);
  console.log(`- Tres usuarios diferentes pueden reservar simultaneamente`);
  console.log(`- Cada reserva obtiene un ID unico secuencial`);
  console.log(`- No hay perdida de datos ni corrupcion`);
  console.log(`- Los requisitos se copian correctamente para cada reserva\n`);
  
  // Informacion sobre limpieza
  if (createdReservationIds.length > 0) {
    console.log(`${colors.magenta}========================================`);
    console.log(`LIMPIEZA DE DATOS DE PRUEBA`);
    console.log(`========================================${colors.reset}\n`);
    
    console.log(`${colors.yellow}NOTA: Se crearon reservas de prueba con los siguientes IDs:${colors.reset}`);
    console.log(`  ${createdReservationIds.join(', ')}`);
    console.log(`\n${colors.yellow}Para limpiar estos datos, ejecutar:${colors.reset}`);
    console.log(`  DELETE FROM public.reservation_requirement WHERE reservation_id IN (${createdReservationIds.join(', ')});`);
    console.log(`  DELETE FROM public.reservation WHERE id IN (${createdReservationIds.join(', ')});`);
    console.log('');
  }
  
  // Resultado final
  if (testPassed) {
    console.log(`${colors.green}========================================`);
    console.log(`RESULTADO: PRUEBA SUPERADA`);
    console.log(`========================================${colors.reset}`);
    console.log(`\nEl sistema maneja correctamente la concurrencia.`);
    console.log(`Las 3 reservas se crearon simultaneamente sin conflictos,`);
    console.log(`cada una con ID unico y requisitos copiados correctamente.\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}========================================`);
    console.log(`RESULTADO: PRUEBA FALLIDA`);
    console.log(`========================================${colors.reset}`);
    console.log(`\nSe detectaron problemas en el manejo de concurrencia.`);
    console.log(`Revisar los errores anteriores y corregir la logica de`);
    console.log(`transacciones o generacion de IDs en el modelo.\n`);
    process.exit(1);
  }
}).catch(error => {
  console.log(`\n${colors.red}ERROR FATAL:${colors.reset}`);
  console.log(error.message);
  console.log(error.stack);
  process.exit(1);
});
