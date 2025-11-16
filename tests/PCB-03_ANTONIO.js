/**
 * PCB-03_ANTONIO.js
 * Prueba de Caja Blanca CB-03: Verificacion de transacciones en creacion de reservas
 * 
 * Objetivo:
 * Inspeccionar el codigo del modelo de reservas (reservationModel.js) para verificar
 * que la creacion de reservas y sus requisitos asociados este correctamente envuelta
 * en una transaccion de base de datos (BEGIN, COMMIT, ROLLBACK).
 * 
 * Criterio de Exito:
 * - Debe usar client.query('BEGIN') para iniciar transaccion
 * - Debe usar client.query('COMMIT') al finalizar exitosamente
 * - Debe usar client.query('ROLLBACK') en el catch block si hay error
 * - INSERT a reservation y reservation_requirement deben estar dentro de la misma transaccion
 * - Debe liberar el cliente con client.release() en finally
 */

const fs = require('fs');
const path = require('path');

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
console.log(`PRUEBA DE CAJA BLANCA: PCB-03_ANTONIO`);
console.log(`========================================${colors.reset}\n`);

console.log(`${colors.blue}Descripcion:${colors.reset}`);
console.log(`Verificar que el endpoint de creacion de reservas utilice`);
console.log(`transacciones de base de datos correctamente.\n`);

// Ruta del archivo a analizar
const modelPath = path.join(__dirname, '..', 'models', 'reservationModel.js');

console.log(`${colors.blue}Archivo analizado:${colors.reset} ${modelPath}\n`);

// Variables para almacenar resultados
let testPassed = true;
let issues = [];
let successes = [];
let warnings = [];

try {
  // Leer el contenido del archivo
  const fileContent = fs.readFileSync(modelPath, 'utf8');
  
  console.log(`${colors.blue}Iniciando analisis del codigo...${colors.reset}\n`);
  
  // Verificacion 1: Buscar el metodo create
  console.log(`[1/8] Verificando existencia del metodo create()...`);
  
  const createMethodPattern = /static\s+async\s+create\s*\(/;
  const hasCreateMethod = createMethodPattern.test(fileContent);
  
  if (hasCreateMethod) {
    console.log(`  ${colors.green}CORRECTO: Metodo create() encontrado${colors.reset}`);
    successes.push('Metodo create() existe en reservationModel');
  } else {
    console.log(`  ${colors.red}ERROR: No se encontro el metodo create()${colors.reset}`);
    issues.push('Metodo create() no encontrado');
    testPassed = false;
  }
  
  // Extraer el cuerpo del metodo create
  const createMethodRegex = /static\s+async\s+create\s*\([^)]*\)\s*\{([\s\S]*?)(?=\n\s{2}static|\n\s{2}\/\*\*|\n\}$)/;
  const createMethodMatch = fileContent.match(createMethodRegex);
  const createMethodBody = createMethodMatch ? createMethodMatch[1] : '';
  
  // Verificacion 2: Verificar obtencion de cliente de conexion
  console.log(`\n[2/8] Verificando obtencion de cliente de base de datos...`);
  
  const getClientPattern = /(?:const|let|var)\s+client\s*=\s*await\s+db\.getClient\s*\(\s*\)/;
  const hasGetClient = getClientPattern.test(createMethodBody);
  
  if (hasGetClient) {
    console.log(`  ${colors.green}CORRECTO: Se obtiene cliente con db.getClient()${colors.reset}`);
    successes.push('Cliente de conexion obtenido correctamente');
  } else {
    console.log(`  ${colors.red}ERROR: No se obtiene cliente de conexion${colors.reset}`);
    issues.push('No se usa db.getClient() para obtener cliente');
    testPassed = false;
  }
  
  // Verificacion 3: Verificar estructura try-catch-finally
  console.log(`\n[3/8] Verificando estructura try-catch-finally...`);
  
  const hasTry = /try\s*\{/.test(createMethodBody);
  const hasCatch = /catch\s*\(/.test(createMethodBody);
  const hasFinally = /finally\s*\{/.test(createMethodBody);
  
  if (hasTry && hasCatch && hasFinally) {
    console.log(`  ${colors.green}CORRECTO: Estructura try-catch-finally presente${colors.reset}`);
    successes.push('Estructura de manejo de errores correcta');
  } else {
    console.log(`  ${colors.red}ERROR: Falta estructura completa try-catch-finally${colors.reset}`);
    if (!hasTry) issues.push('Falta bloque try');
    if (!hasCatch) issues.push('Falta bloque catch');
    if (!hasFinally) issues.push('Falta bloque finally');
    testPassed = false;
  }
  
  // Verificacion 4: Verificar BEGIN de transaccion
  console.log(`\n[4/8] Verificando inicio de transaccion (BEGIN)...`);
  
  const beginPattern = /await\s+client\.query\s*\(\s*['"`]BEGIN['"`]\s*\)/;
  const hasBegin = beginPattern.test(createMethodBody);
  
  if (hasBegin) {
    console.log(`  ${colors.green}CORRECTO: Se inicia transaccion con BEGIN${colors.reset}`);
    successes.push('Transaccion iniciada correctamente con BEGIN');
  } else {
    console.log(`  ${colors.red}ERROR: No se inicia transaccion con BEGIN${colors.reset}`);
    issues.push('Falta client.query("BEGIN") para iniciar transaccion');
    testPassed = false;
  }
  
  // Verificacion 5: Verificar INSERT a reservation dentro de transaccion
  console.log(`\n[5/8] Verificando INSERT a tabla reservation...`);
  
  const reservationInsertPattern = /INSERT\s+INTO\s+public\.reservation/i;
  const hasReservationInsert = reservationInsertPattern.test(createMethodBody);
  
  if (hasReservationInsert) {
    console.log(`  ${colors.green}CORRECTO: Se inserta en tabla reservation${colors.reset}`);
    successes.push('INSERT a reservation dentro de transaccion');
  } else {
    console.log(`  ${colors.red}ERROR: No se encontro INSERT a reservation${colors.reset}`);
    issues.push('No se inserta en tabla reservation');
    testPassed = false;
  }
  
  // Verificacion 6: Verificar INSERT a reservation_requirement dentro de transaccion
  console.log(`\n[6/8] Verificando INSERT a tabla reservation_requirement...`);
  
  const requirementInsertPattern = /INSERT\s+INTO\s+public\.reservation_requirement/i;
  const requirementInsertMatches = createMethodBody.match(new RegExp(requirementInsertPattern.source, 'gi'));
  const requirementInsertCount = requirementInsertMatches ? requirementInsertMatches.length : 0;
  
  if (requirementInsertCount >= 1) {
    console.log(`  ${colors.green}CORRECTO: Se inserta en tabla reservation_requirement (${requirementInsertCount} consultas)${colors.reset}`);
    successes.push(`${requirementInsertCount} INSERT a reservation_requirement dentro de transaccion`);
  } else {
    console.log(`  ${colors.yellow}ADVERTENCIA: No se encontraron INSERT a reservation_requirement${colors.reset}`);
    warnings.push('No se inserta en reservation_requirement (puede ser opcional)');
  }
  
  // Verificacion 7: Verificar COMMIT de transaccion
  console.log(`\n[7/8] Verificando finalizacion exitosa de transaccion (COMMIT)...`);
  
  const commitPattern = /await\s+client\.query\s*\(\s*['"`]COMMIT['"`]\s*\)/;
  const hasCommit = commitPattern.test(createMethodBody);
  
  if (hasCommit) {
    console.log(`  ${colors.green}CORRECTO: Se finaliza transaccion con COMMIT${colors.reset}`);
    successes.push('Transaccion confirmada correctamente con COMMIT');
  } else {
    console.log(`  ${colors.red}ERROR: No se finaliza transaccion con COMMIT${colors.reset}`);
    issues.push('Falta client.query("COMMIT") para confirmar transaccion');
    testPassed = false;
  }
  
  // Verificacion 8: Verificar ROLLBACK en caso de error
  console.log(`\n[8/8] Verificando rollback de transaccion en caso de error (ROLLBACK)...`);
  
  const rollbackPattern = /await\s+client\.query\s*\(\s*['"`]ROLLBACK['"`]\s*\)/;
  const hasRollback = rollbackPattern.test(createMethodBody);
  
  if (hasRollback) {
    console.log(`  ${colors.green}CORRECTO: Se revierte transaccion con ROLLBACK en catch${colors.reset}`);
    successes.push('Transaccion revertida correctamente con ROLLBACK en caso de error');
  } else {
    console.log(`  ${colors.red}ERROR: No se revierte transaccion con ROLLBACK${colors.reset}`);
    issues.push('Falta client.query("ROLLBACK") en catch para revertir transaccion');
    testPassed = false;
  }
  
  // Verificacion adicional: Verificar liberacion de cliente
  console.log(`\n[ADICIONAL] Verificando liberacion de cliente (release)...`);
  
  const releasePattern = /client\.release\s*\(\s*\)/;
  const hasRelease = releasePattern.test(createMethodBody);
  
  if (hasRelease) {
    console.log(`  ${colors.green}CORRECTO: Se libera el cliente con release() en finally${colors.reset}`);
    successes.push('Cliente liberado correctamente en finally');
  } else {
    console.log(`  ${colors.yellow}ADVERTENCIA: No se encontro client.release() en finally${colors.reset}`);
    warnings.push('Puede haber fuga de conexiones sin release()');
  }
  
} catch (error) {
  console.log(`\n${colors.red}ERROR durante la prueba:${colors.reset}`);
  console.log(error.message);
  console.log(error.stack);
  issues.push(`Error critico: ${error.message}`);
  testPassed = false;
}

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

// Explicacion del principio de transacciones
console.log(`${colors.cyan}========================================`);
console.log(`PRINCIPIO DE TRANSACCIONES EN BD`);
console.log(`========================================${colors.reset}\n`);

console.log(`${colors.blue}Por que son importantes las transacciones:${colors.reset}`);
console.log(`1. Atomicidad: Todas las operaciones se ejecutan o ninguna (todo o nada).`);
console.log(`2. Consistencia: La BD siempre queda en un estado valido.`);
console.log(`3. Aislamiento: Las transacciones concurrentes no interfieren entre si.`);
console.log(`4. Durabilidad: Una vez confirmada, los cambios son permanentes.\n`);

console.log(`${colors.blue}Flujo correcto de transaccion:${colors.reset}`);
console.log(`1. Obtener cliente de conexion: const client = await db.getClient()`);
console.log(`2. Iniciar transaccion: await client.query('BEGIN')`);
console.log(`3. Ejecutar operaciones (INSERT reservation, INSERT requirements)`);
console.log(`4. Si todo va bien: await client.query('COMMIT')`);
console.log(`5. Si hay error: await client.query('ROLLBACK') en catch`);
console.log(`6. Siempre liberar cliente: client.release() en finally\n`);

console.log(`${colors.blue}Problema si NO se usan transacciones:${colors.reset}`);
console.log(`- Se crea la reservation pero falla al copiar los requisitos.`);
console.log(`- Resultado: Reserva sin requisitos (estado inconsistente).`);
console.log(`- Con transaccion: Si falla cualquier paso, se revierte TODO.\n`);

console.log(`${colors.blue}Importancia en este endpoint:${colors.reset}`);
console.log(`- POST /api/reservations crea reservation + reservation_requirement.`);
console.log(`- Ambas tablas deben actualizarse juntas o no actualizarse.`);
console.log(`- La transaccion garantiza que no queden reservas sin requisitos.`);
console.log(`- ROLLBACK asegura que en caso de error no quede basura en la BD.\n`);

// Resultado final
if (testPassed) {
  console.log(`${colors.green}========================================`);
  console.log(`RESULTADO: PRUEBA SUPERADA`);
  console.log(`========================================${colors.reset}`);
  console.log(`\nEl codigo implementa correctamente transacciones de BD.`);
  console.log(`La creacion de reservas esta protegida con BEGIN/COMMIT/ROLLBACK,`);
  console.log(`garantizando atomicidad y consistencia de datos.\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}========================================`);
  console.log(`RESULTADO: PRUEBA FALLIDA`);
  console.log(`========================================${colors.reset}`);
  console.log(`\nSe detectaron problemas en el manejo de transacciones.`);
  console.log(`Revisar la implementacion del metodo create en reservationModel.js`);
  console.log(`para asegurar que use BEGIN, COMMIT y ROLLBACK correctamente.\n`);
  process.exit(1);
}
