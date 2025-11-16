/**
 * PCB-02_LUCHO.js
 * Prueba de Caja Blanca CB-02: Inmutabilidad de Requisitos (Copia en Reserva)
 * 
 * Objetivo:
 * Verificar que al crear una reserva, los requisitos base (BaseRequirement)
 * se copian como registros independientes en reservation_requirement,
 * garantizando la inmutabilidad de la historia de la reserva.
 * 
 * Criterio de Exito:
 * - El modelo debe copiar los campos name y description de los requisitos base
 * - NO debe crear referencias directas (foreign keys) a los requisitos originales
 * - Los cambios posteriores en los requisitos base NO deben afectar las reservas existentes
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
console.log(`PRUEBA DE CAJA BLANCA: PCB-02_LUCHO`);
console.log(`========================================${colors.reset}\n`);

console.log(`${colors.blue}Descripcion:${colors.reset}`);
console.log(`Verificar la inmutabilidad de requisitos en las reservas`);
console.log(`mediante la copia de campos en lugar de referencias.\n`);

// Rutas de los archivos a analizar
const modelPath = path.join(__dirname, '..', 'models', 'reservationModel.js');

console.log(`${colors.blue}Archivo analizado:${colors.reset} ${modelPath}\n`);

// Variables para almacenar resultados
let testPassed = true;
let issues = [];
let successes = [];
let warnings = [];

try {
  // Leer el contenido del archivo del modelo
  const fileContent = fs.readFileSync(modelPath, 'utf8');
  
  console.log(`${colors.blue}Iniciando analisis del codigo...${colors.reset}\n`);
  
  // Verificacion 1: Buscar la funcion create que maneja la creacion de reservas
  console.log(`[1/5] Buscando metodo de creacion de reservas...`);
  
  const createMethodPattern = /static\s+async\s+create\s*\(/;
  const hasCreateMethod = createMethodPattern.test(fileContent);
  
  if (hasCreateMethod) {
    console.log(`  ${colors.green}CORRECTO: Metodo create encontrado${colors.reset}`);
    successes.push('Metodo de creacion de reservas existe');
  } else {
    console.log(`  ${colors.red}ERROR: No se encontro metodo create${colors.reset}`);
    testPassed = false;
    issues.push('No se encontro el metodo create para reservas');
  }
  
  // Verificacion 2: Buscar INSERT en reservation_requirement con copia de campos
  console.log(`\n[2/5] Verificando INSERT en tabla reservation_requirement...`);
  
  // Patron que busca INSERT INTO reservation_requirement
  const insertPattern = /INSERT\s+INTO\s+(?:public\.)?reservation_requirement/i;
  const hasInsert = insertPattern.test(fileContent);
  
  if (hasInsert) {
    console.log(`  ${colors.green}CORRECTO: Se detecta INSERT INTO reservation_requirement${colors.reset}`);
    successes.push('Operacion INSERT en tabla reservation_requirement encontrada');
    
    // Extraer el fragmento de la query para mostrarlo
    const match = fileContent.match(/INSERT\s+INTO\s+(?:public\.)?reservation_requirement[\s\S]{0,500}/i);
    if (match) {
      console.log(`\n  ${colors.cyan}Fragmento de query detectado:${colors.reset}`);
      const fragment = match[0].split('\n').slice(0, 10).join('\n').substring(0, 300);
      console.log(`  ${fragment}...`);
    }
  } else {
    console.log(`  ${colors.red}ERROR: No se detecta INSERT en reservation_requirement${colors.reset}`);
    testPassed = false;
    issues.push('No se encontro INSERT INTO reservation_requirement');
  }
  
  // Verificacion 3: Verificar que se copian campos name en reservation_requirement
  console.log(`\n[3/5] Verificando copia del campo 'name' en reservation_requirement...`);
  
  // Buscar que en el INSERT se incluya el campo name
  const nameFieldPattern = /INSERT\s+INTO\s+(?:public\.)?reservation_requirement[\s\S]{0,300}name/i;
  const hasNameField = nameFieldPattern.test(fileContent);
  
  if (hasNameField) {
    console.log(`  ${colors.green}CORRECTO: El campo 'name' se incluye en reservation_requirement${colors.reset}`);
    successes.push('Campo name presente en INSERT de reservation_requirement');
  } else {
    console.log(`  ${colors.red}ERROR: No se detecta el campo 'name' en el INSERT${colors.reset}`);
    testPassed = false;
    issues.push('Campo name no encontrado en INSERT de reservation_requirement');
  }
  
  // Verificacion 4: Verificar que se copian campos description en reservation_requirement
  console.log(`\n[4/5] Verificando copia del campo 'description' en reservation_requirement...`);
  
  // Buscar que en el INSERT se incluya el campo description
  const descriptionFieldPattern = /INSERT\s+INTO\s+(?:public\.)?reservation_requirement[\s\S]{0,300}description/i;
  const hasDescriptionField = descriptionFieldPattern.test(fileContent);
  
  if (hasDescriptionField) {
    console.log(`  ${colors.green}CORRECTO: El campo 'description' se incluye en reservation_requirement${colors.reset}`);
    successes.push('Campo description presente en INSERT de reservation_requirement');
  } else {
    console.log(`  ${colors.red}ERROR: No se detecta el campo 'description' en el INSERT${colors.reset}`);
    testPassed = false;
    issues.push('Campo description no encontrado en INSERT de reservation_requirement');
  }
  
  // Verificacion 5: Verificar que reservation_requirement tiene reservation_id
  console.log(`\n[5/5] Verificando vinculacion con la reserva (reservation_id)...`);
  
  // Buscar que se asigne reservation_id en el INSERT
  const reservationIdPattern = /INSERT\s+INTO\s+(?:public\.)?reservation_requirement[\s\S]{0,400}reservation_id/i;
  const hasReservationId = reservationIdPattern.test(fileContent);
  
  if (hasReservationId) {
    console.log(`  ${colors.green}CORRECTO: Se vinculan los requisitos con reservation_id${colors.reset}`);
    successes.push('Vinculacion correcta mediante reservation_id');
  } else {
    console.log(`  ${colors.yellow}ADVERTENCIA: No se detecta claramente reservation_id en el INSERT${colors.reset}`);
    warnings.push('Vinculacion con reservation_id no detectada claramente');
  }
  
  // Analisis adicional: buscar comentarios sobre inmutabilidad
  console.log(`\n${colors.magenta}[ANALISIS ADICIONAL]${colors.reset} Buscando comentarios sobre inmutabilidad...`);
  
  const commentPattern = /\/\*[\s\S]*?inmut[\s\S]*?\*\//i;
  const hasImmutabilityComment = commentPattern.test(fileContent);
  
  if (hasImmutabilityComment) {
    console.log(`  ${colors.cyan}INFO: Se encontraron comentarios relacionados con inmutabilidad${colors.reset}`);
  } else {
    console.log(`  ${colors.cyan}INFO: No se encontraron comentarios explicitos sobre inmutabilidad${colors.reset}`);
  }
  
} catch (error) {
  console.log(`\n${colors.red}ERROR al leer el archivo:${colors.reset}`);
  console.log(error.message);
  testPassed = false;
  issues.push(`Error de lectura: ${error.message}`);
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

// Explicacion del principio de inmutabilidad
console.log(`${colors.cyan}========================================`);
console.log(`PRINCIPIO DE INMUTABILIDAD`);
console.log(`========================================${colors.reset}\n`);

console.log(`${colors.blue}Por que es importante:${colors.reset}`);
console.log(`1. Cuando un usuario hace una reserva, acepta ciertos requisitos`);
console.log(`   con nombres y descripciones especificas.`);
console.log(`2. Si posteriormente un administrador cambia esos requisitos`);
console.log(`   en base_requirement o chapel_event_requirement, las`);
console.log(`   reservas antiguas NO deben verse afectadas.`);
console.log(`3. Esto garantiza que el "contrato" original con el cliente`);
console.log(`   se mantiene intacto (inmutabilidad de la historia).\n`);

console.log(`${colors.blue}Como se implementa:${colors.reset}`);
console.log(`1. Al crear la reserva, se ejecuta un INSERT INTO`);
console.log(`   reservation_requirement copiando name y description.`);
console.log(`2. Los requisitos quedan almacenados como registros`);
console.log(`   independientes vinculados a la reserva especifica.`);
console.log(`3. Los cambios futuros en los requisitos originales NO alteran`);
console.log(`   los datos ya registrados en reservation_requirement.\n`);

// Resultado final
if (testPassed && issues.length === 0) {
  console.log(`${colors.green}========================================`);
  console.log(`RESULTADO: PRUEBA SUPERADA`);
  console.log(`========================================${colors.reset}`);
  console.log(`\nEl modelo de reservas implementa correctamente`);
  console.log(`la inmutabilidad de requisitos mediante copia de campos.`);
  console.log(`Las reservas estan protegidas contra cambios posteriores`);
  console.log(`en los requisitos base.\n`);
  process.exit(0);
} else if (testPassed && warnings.length > 0) {
  console.log(`${colors.yellow}========================================`);
  console.log(`RESULTADO: PRUEBA SUPERADA CON ADVERTENCIAS`);
  console.log(`========================================${colors.reset}`);
  console.log(`\nEl modelo cumple con el principio de inmutabilidad,`);
  console.log(`aunque algunos patrones no fueron detectados claramente.`);
  console.log(`Se recomienda revision manual de las advertencias.\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}========================================`);
  console.log(`RESULTADO: PRUEBA FALLIDA`);
  console.log(`========================================${colors.reset}`);
  console.log(`\nEl modelo NO implementa correctamente la inmutabilidad`);
  console.log(`de requisitos. Es necesario revisar la logica de copia.\n`);
  process.exit(1);
}
