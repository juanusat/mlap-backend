/**
 * PCB-04_ANTONIO.js
 * Prueba de Caja Blanca CB-04: Verificacion de validacion de User-Agent en middleware de autenticacion
 * 
 * Objetivo:
 * Inspeccionar el codigo del middleware de autenticacion (authMiddleware_new.js) para
 * verificar que implemente la validacion de User-Agent. El sistema debe comparar el
 * User-Agent de la peticion actual con el almacenado en el JWT, rechazando peticiones
 * donde no coincidan (posible robo de token).
 * 
 * Criterio de Exito:
 * - Debe extraer el User-Agent del header: req.headers['user-agent']
 * - Debe extraer el User-Agent del JWT decodificado: decoded.userAgent
 * - Debe comparar ambos User-Agent
 * - Debe retornar 401 Unauthorized cuando no coincidan
 * - Mensaje de error descriptivo sobre cambio de dispositivo
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
console.log(`PRUEBA DE CAJA BLANCA: PCB-04_ANTONIO`);
console.log(`========================================${colors.reset}\n`);

console.log(`${colors.blue}Descripcion:${colors.reset}`);
console.log(`Verificar que el middleware de autenticacion valide el User-Agent`);
console.log(`para prevenir uso de tokens robados desde otros dispositivos.\n`);

// Ruta del archivo a analizar
const middlewarePath = path.join(__dirname, '..', 'middleware', 'authMiddleware_new.js');

console.log(`${colors.blue}Archivo analizado:${colors.reset} ${middlewarePath}\n`);

// Variables para almacenar resultados
let testPassed = true;
let issues = [];
let successes = [];
let warnings = [];

try {
  // Leer el contenido del archivo
  const fileContent = fs.readFileSync(middlewarePath, 'utf8');
  
  console.log(`${colors.blue}Iniciando analisis del codigo...${colors.reset}\n`);
  
  // Verificacion 1: Verificar existencia del middleware
  console.log(`[1/8] Verificando existencia del middleware authMiddleware...`);
  
  const middlewarePattern = /(?:const|let|var)\s+authMiddleware\s*=\s*\(/;
  const hasMiddleware = middlewarePattern.test(fileContent);
  
  if (hasMiddleware) {
    console.log(`  ${colors.green}CORRECTO: Middleware authMiddleware encontrado${colors.reset}`);
    successes.push('Middleware authMiddleware existe');
  } else {
    console.log(`  ${colors.red}ERROR: No se encontro el middleware authMiddleware${colors.reset}`);
    issues.push('Middleware authMiddleware no encontrado');
    testPassed = false;
  }
  
  // Verificacion 2: Verificar extraccion de token
  console.log(`\n[2/8] Verificando extraccion de token del header Authorization...`);
  
  const tokenExtractionPattern = /(?:const|let|var)\s+.*token.*=.*req\.(?:cookies|headers)/;
  const hasTokenExtraction = tokenExtractionPattern.test(fileContent);
  
  if (hasTokenExtraction) {
    console.log(`  ${colors.green}CORRECTO: Se extrae el token de la peticion${colors.reset}`);
    successes.push('Token extraido de cookies o headers');
  } else {
    console.log(`  ${colors.red}ERROR: No se extrae el token${colors.reset}`);
    issues.push('No se extrae token de la peticion');
    testPassed = false;
  }
  
  // Verificacion 3: Verificar decodificacion del JWT
  console.log(`\n[3/8] Verificando decodificacion del JWT...`);
  
  const jwtVerifyPattern = /jwt\.verify\s*\(/;
  const hasJwtVerify = jwtVerifyPattern.test(fileContent);
  
  if (hasJwtVerify) {
    console.log(`  ${colors.green}CORRECTO: Se decodifica el JWT con jwt.verify()${colors.reset}`);
    successes.push('JWT decodificado correctamente');
  } else {
    console.log(`  ${colors.red}ERROR: No se decodifica el JWT${colors.reset}`);
    issues.push('No se usa jwt.verify() para decodificar token');
    testPassed = false;
  }
  
  // Verificacion 4: Verificar extraccion del User-Agent del request
  console.log(`\n[4/8] Verificando extraccion del User-Agent de la peticion...`);
  
  const requestUserAgentPattern = /req\.headers\[['"`]user-agent['"`]\]/i;
  const hasRequestUserAgent = requestUserAgentPattern.test(fileContent);
  
  if (hasRequestUserAgent) {
    console.log(`  ${colors.green}CORRECTO: Se extrae User-Agent del header de la peticion${colors.reset}`);
    successes.push('User-Agent extraido de req.headers["user-agent"]');
  } else {
    console.log(`  ${colors.red}ERROR: No se extrae el User-Agent del header${colors.reset}`);
    issues.push('No se lee req.headers["user-agent"]');
    testPassed = false;
  }
  
  // Verificacion 5: Verificar extraccion del User-Agent del JWT
  console.log(`\n[5/8] Verificando extraccion del User-Agent del JWT decodificado...`);
  
  const jwtUserAgentPattern = /decoded\.(?:userAgent|user_agent|ua)/i;
  const hasJwtUserAgent = jwtUserAgentPattern.test(fileContent);
  
  if (hasJwtUserAgent) {
    console.log(`  ${colors.green}CORRECTO: Se extrae User-Agent del JWT decodificado${colors.reset}`);
    successes.push('User-Agent extraido del payload del JWT');
  } else {
    console.log(`  ${colors.red}ERROR: No se extrae el User-Agent del JWT${colors.reset}`);
    issues.push('No se accede a decoded.userAgent (o similar)');
    testPassed = false;
  }
  
  // Verificacion 6: Verificar comparacion de User-Agent
  console.log(`\n[6/8] Verificando comparacion entre User-Agent actual y del JWT...`);
  
  // Buscar comparaciones de User-Agent (puede ser con === o !== )
  const userAgentComparisonPattern = /(?:user-agent|userAgent|ua).*(?:===|!==|!=|==)/i;
  const hasUserAgentComparison = userAgentComparisonPattern.test(fileContent);
  
  if (hasUserAgentComparison) {
    console.log(`  ${colors.green}CORRECTO: Se compara el User-Agent actual con el del JWT${colors.reset}`);
    successes.push('Comparacion de User-Agent implementada');
  } else {
    console.log(`  ${colors.red}ERROR: No se compara el User-Agent${colors.reset}`);
    issues.push('No se compara User-Agent actual vs JWT');
    testPassed = false;
  }
  
  // Verificacion 7: Verificar respuesta 401 cuando no coincidan
  console.log(`\n[7/8] Verificando respuesta 401 Unauthorized cuando no coinciden...`);
  
  const unauthorized401Pattern = /res\.status\s*\(\s*401\s*\)/;
  const has401Response = unauthorized401Pattern.test(fileContent);
  
  if (has401Response) {
    console.log(`  ${colors.green}CORRECTO: Se retorna status 401 Unauthorized${colors.reset}`);
    successes.push('Respuesta 401 implementada');
  } else {
    console.log(`  ${colors.yellow}ADVERTENCIA: No se encontro res.status(401)${colors.reset}`);
    warnings.push('Deberia retornar 401 cuando User-Agent no coincide');
  }
  
  // Verificacion 8: Verificar mensaje de error descriptivo
  console.log(`\n[8/8] Verificando mensaje de error descriptivo...`);
  
  const errorMessagePattern = /message\s*:\s*['"`].*(?:dispositivo|device|user-agent|navegador|browser).*['"`]/i;
  const hasErrorMessage = errorMessagePattern.test(fileContent);
  
  if (hasErrorMessage) {
    console.log(`  ${colors.green}CORRECTO: Mensaje de error descriptivo encontrado${colors.reset}`);
    successes.push('Mensaje de error indica problema de dispositivo/User-Agent');
  } else {
    console.log(`  ${colors.yellow}ADVERTENCIA: No se encontro mensaje descriptivo especifico${colors.reset}`);
    warnings.push('Se recomienda mensaje mas especifico sobre cambio de dispositivo');
  }
  
  // Analisis adicional: Verificar si el middleware actual NO tiene validacion
  console.log(`\n${colors.magenta}[ANALISIS ADICIONAL]${colors.reset}`);
  console.log(`Verificando si la validacion de User-Agent esta realmente implementada...\n`);
  
  // Contar cuantas verificaciones pasaron relacionadas con User-Agent
  const userAgentChecks = [hasRequestUserAgent, hasJwtUserAgent, hasUserAgentComparison];
  const userAgentChecksPassed = userAgentChecks.filter(check => check).length;
  
  if (userAgentChecksPassed === 0) {
    console.log(`  ${colors.red}CRITICO: La validacion de User-Agent NO esta implementada${colors.reset}`);
    console.log(`  ${colors.yellow}El middleware actual solo verifica el token JWT pero no valida${colors.reset}`);
    console.log(`  ${colors.yellow}que el User-Agent coincida con el registrado durante el login.${colors.reset}`);
    console.log(`  ${colors.yellow}Esto permite que tokens robados se usen desde cualquier dispositivo.${colors.reset}\n`);
    issues.push('CRITICO: Validacion de User-Agent completamente ausente');
    testPassed = false;
  } else if (userAgentChecksPassed < 3) {
    console.log(`  ${colors.yellow}ADVERTENCIA: Validacion de User-Agent parcialmente implementada${colors.reset}`);
    console.log(`  ${colors.yellow}Solo ${userAgentChecksPassed}/3 verificaciones relacionadas con User-Agent pasaron.${colors.reset}\n`);
    warnings.push('Validacion de User-Agent incompleta');
  } else {
    console.log(`  ${colors.green}CORRECTO: Validacion de User-Agent completamente implementada${colors.reset}\n`);
    successes.push('Todas las verificaciones de User-Agent pasaron');
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

// Explicacion del principio de validacion de User-Agent
console.log(`${colors.cyan}========================================`);
console.log(`PRINCIPIO DE VALIDACION DE USER-AGENT`);
console.log(`========================================${colors.reset}\n`);

console.log(`${colors.blue}Por que validar el User-Agent:${colors.reset}`);
console.log(`1. Prevenir uso de tokens robados desde otros dispositivos.`);
console.log(`2. Detectar si un atacante robo el JWT y lo usa desde otro navegador.`);
console.log(`3. Agregar capa adicional de seguridad mas alla del token JWT.`);
console.log(`4. Cumplir con mejores practicas de seguridad en autenticacion.\n`);

console.log(`${colors.blue}Como funciona la validacion:${colors.reset}`);
console.log(`1. Durante el login, se guarda el User-Agent en el payload del JWT.`);
console.log(`2. En cada peticion autenticada, el middleware:`);
console.log(`   a) Extrae el User-Agent del header: req.headers['user-agent']`);
console.log(`   b) Decodifica el JWT y extrae: decoded.userAgent`);
console.log(`   c) Compara ambos valores`);
console.log(`   d) Si NO coinciden: retorna 401 (token usado desde otro dispositivo)`);
console.log(`   e) Si coinciden: permite continuar con la peticion\n`);

console.log(`${colors.blue}Escenario de ataque sin validacion:${colors.reset}`);
console.log(`1. Usuario inicia sesion desde Chrome en Windows.`);
console.log(`2. Atacante intercepta el JWT (XSS, MITM, etc).`);
console.log(`3. Atacante usa el JWT desde Firefox en Linux.`);
console.log(`4. Sin validacion: El servidor acepta el token robado.`);
console.log(`5. Con validacion: El servidor detecta cambio de User-Agent y rechaza.\n`);

console.log(`${colors.blue}Implementacion recomendada:${colors.reset}`);
console.log(`Durante el login (authController.js):`);
console.log(`  const userAgent = req.headers['user-agent'];`);
console.log(`  const token = jwt.sign({ userId, userAgent, ... }, secret);`);
console.log(``);
console.log(`En el middleware (authMiddleware_new.js):`);
console.log(`  const decoded = jwt.verify(token, secret);`);
console.log(`  const currentUserAgent = req.headers['user-agent'];`);
console.log(`  if (decoded.userAgent !== currentUserAgent) {`);
console.log(`    return res.status(401).json({`);
console.log(`      message: 'Token usado desde dispositivo diferente'`);
console.log(`    });`);
console.log(`  }`);
console.log(``);

console.log(`${colors.blue}Limitaciones y consideraciones:${colors.reset}`);
console.log(`- El User-Agent puede ser falsificado por un atacante sofisticado.`);
console.log(`- No es una solucion perfecta, pero agrega capa de defensa.`);
console.log(`- Debe combinarse con otras medidas: HTTPS, tokens de corta duracion, etc.`);
console.log(`- Algunos navegadores/proxies modifican el User-Agent automaticamente.\n`);

// Resultado final
if (testPassed) {
  console.log(`${colors.green}========================================`);
  console.log(`RESULTADO: PRUEBA SUPERADA`);
  console.log(`========================================${colors.reset}`);
  console.log(`\nEl middleware implementa correctamente la validacion de User-Agent.`);
  console.log(`Se compara el User-Agent de la peticion con el almacenado en el JWT,`);
  console.log(`rechazando peticiones donde no coincidan con status 401.\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}========================================`);
  console.log(`RESULTADO: PRUEBA FALLIDA`);
  console.log(`========================================${colors.reset}`);
  console.log(`\nSe detectaron problemas en la validacion de User-Agent.`);
  console.log(`El middleware NO implementa la validacion requerida para prevenir`);
  console.log(`el uso de tokens robados desde dispositivos diferentes.`);
  console.log(`\nSe recomienda implementar la comparacion de User-Agent en:`);
  console.log(`  middleware/authMiddleware_new.js\n`);
  process.exit(1);
}
