/**
 * PCB-01_LUCHO.js
 * Prueba de Caja Blanca CB-01: Mantenibilidad Modular - Desacoplamiento de Reservas
 * 
 * Objetivo:
 * Validar que el controlador de reservas (reservationController.js) no depende
 * directamente de los modelos Event ni DocumentType, manteniendo el principio
 * de mantenibilidad modular.
 * 
 * Criterio de Exito:
 * - El controlador debe importar solo reservationService
 * - NO debe importar directamente Event ni DocumentType
 * - Toda la logica de negocio debe estar delegada al servicio
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
  cyan: '\x1b[36m'
};

console.log(`\n${colors.cyan}========================================`);
console.log(`PRUEBA DE CAJA BLANCA: PCB-01_LUCHO`);
console.log(`========================================${colors.reset}\n`);

console.log(`${colors.blue}Descripcion:${colors.reset}`);
console.log(`Validar el desacoplamiento del controlador de reservas`);
console.log(`respecto a los modelos Event y DocumentType.\n`);

// Ruta del archivo a analizar
const controllerPath = path.join(__dirname, '..', 'controllers', 'reservationController.js');

console.log(`${colors.blue}Archivo analizado:${colors.reset} ${controllerPath}\n`);

// Variable para almacenar el resultado de la prueba
let testPassed = true;
let issues = [];
let successes = [];

try {
  // Leer el contenido del archivo
  const fileContent = fs.readFileSync(controllerPath, 'utf8');
  
  console.log(`${colors.blue}Iniciando analisis del codigo...${colors.reset}\n`);
  
  // Verificacion 1: Buscar imports/requires de Event
  console.log(`[1/4] Verificando ausencia de import/require de "Event"...`);
  
  const eventImportPatterns = [
    /require\s*\(\s*['"].*Event.*['"]\s*\)/gi,
    /import\s+.*Event.*/gi,
    /from\s+['"].*Event.*['"]/gi
  ];
  
  let eventImportFound = false;
  eventImportPatterns.forEach(pattern => {
    const matches = fileContent.match(pattern);
    if (matches && matches.length > 0) {
      // Filtrar falsos positivos (como EventVariant)
      const validMatches = matches.filter(match => {
        const lowerMatch = match.toLowerCase();
        return lowerMatch.includes('event') && 
               !lowerMatch.includes('eventvariant') &&
               !lowerMatch.includes('chapel_event');
      });
      
      if (validMatches.length > 0) {
        eventImportFound = true;
        issues.push(`Encontrado import/require de Event: ${validMatches.join(', ')}`);
      }
    }
  });
  
  if (!eventImportFound) {
    console.log(`  ${colors.green}CORRECTO: No se encontro import/require de Event${colors.reset}`);
    successes.push('Ausencia de dependencia directa de Event');
  } else {
    console.log(`  ${colors.red}ERROR: Se encontro import/require de Event${colors.reset}`);
    testPassed = false;
  }
  
  // Verificacion 2: Buscar imports/requires de DocumentType
  console.log(`\n[2/4] Verificando ausencia de import/require de "DocumentType"...`);
  
  const documentTypePatterns = [
    /require\s*\(\s*['"].*DocumentType.*['"]\s*\)/gi,
    /import\s+.*DocumentType.*/gi,
    /from\s+['"].*DocumentType.*['"]/gi
  ];
  
  let documentTypeImportFound = false;
  documentTypePatterns.forEach(pattern => {
    const matches = fileContent.match(pattern);
    if (matches && matches.length > 0) {
      documentTypeImportFound = true;
      issues.push(`Encontrado import/require de DocumentType: ${matches.join(', ')}`);
    }
  });
  
  if (!documentTypeImportFound) {
    console.log(`  ${colors.green}CORRECTO: No se encontro import/require de DocumentType${colors.reset}`);
    successes.push('Ausencia de dependencia directa de DocumentType');
  } else {
    console.log(`  ${colors.red}ERROR: Se encontro import/require de DocumentType${colors.reset}`);
    testPassed = false;
  }
  
  // Verificacion 3: Confirmar que usa reservationService
  console.log(`\n[3/4] Verificando uso de reservationService...`);
  
  const servicePatterns = [
    /require\s*\(\s*['"].*reservationService.*['"]\s*\)/gi,
    /import\s+.*reservationService.*/gi
  ];
  
  let serviceFound = false;
  servicePatterns.forEach(pattern => {
    if (fileContent.match(pattern)) {
      serviceFound = true;
    }
  });
  
  if (serviceFound) {
    console.log(`  ${colors.green}CORRECTO: El controlador utiliza reservationService${colors.reset}`);
    successes.push('Uso correcto de la capa de servicio');
  } else {
    console.log(`  ${colors.yellow}ADVERTENCIA: No se encontro import de reservationService${colors.reset}`);
    issues.push('No se encontro import explicito de reservationService');
  }
  
  // Verificacion 4: Verificar que las llamadas van al servicio
  console.log(`\n[4/4] Verificando que las operaciones delegan al servicio...`);
  
  const serviceCalls = fileContent.match(/reservationService\.\w+/g);
  
  if (serviceCalls && serviceCalls.length > 0) {
    console.log(`  ${colors.green}CORRECTO: Se encontraron ${serviceCalls.length} llamadas al servicio${colors.reset}`);
    console.log(`  Llamadas identificadas: ${serviceCalls.slice(0, 5).join(', ')}${serviceCalls.length > 5 ? '...' : ''}`);
    successes.push(`Delegacion correcta (${serviceCalls.length} llamadas al servicio)`);
  } else {
    console.log(`  ${colors.yellow}ADVERTENCIA: No se encontraron llamadas al servicio${colors.reset}`);
    issues.push('No se detectaron llamadas a reservationService');
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

if (issues.length > 0) {
  console.log(`${colors.yellow}Observaciones (${issues.length}):${colors.reset}`);
  issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue}`);
  });
  console.log('');
}

// Resultado final
if (testPassed && issues.length === 0) {
  console.log(`${colors.green}========================================`);
  console.log(`RESULTADO: PRUEBA SUPERADA`);
  console.log(`========================================${colors.reset}`);
  console.log(`\nEl controlador de reservas cumple con el`);
  console.log(`principio de mantenibilidad modular.`);
  console.log(`No existe acoplamiento directo con Event ni DocumentType.\n`);
  process.exit(0);
} else if (testPassed && issues.length > 0) {
  console.log(`${colors.yellow}========================================`);
  console.log(`RESULTADO: PRUEBA SUPERADA CON OBSERVACIONES`);
  console.log(`========================================${colors.reset}`);
  console.log(`\nEl controlador cumple los requisitos minimos pero`);
  console.log(`existen puntos menores a revisar.\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}========================================`);
  console.log(`RESULTADO: PRUEBA FALLIDA`);
  console.log(`========================================${colors.reset}`);
  console.log(`\nEl controlador presenta acoplamiento directo`);
  console.log(`con modelos que deberian estar encapsulados.\n`);
  process.exit(1);
}
