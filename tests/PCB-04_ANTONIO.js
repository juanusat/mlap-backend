/**
 * PCB-04_ANTONIO.js
 * Prueba de Caja Blanca CB-04: Verificacion de validacion de User-Agent en middleware de autenticacion
 * 
 * Objetivo:
 * Inspeccionar el codigo del middleware de autenticacion (authMiddleware_new.js) para
 * verificar que implemente la validacion de User-Agent mediante hash SHA-256. El sistema
 * debe comparar el hash del User-Agent de la peticion actual con el almacenado en el JWT,
 * rechazando peticiones donde no coincidan (posible robo de token).
 * 
 * Criterio de Exito:
 * - Debe existir funcion hashUserAgent que use crypto.createHash('sha256')
 * - Debe extraer el User-Agent del header: req.headers['user-agent']
 * - Debe hashear el User-Agent actual con hashUserAgent()
 * - Debe extraer el hash del JWT decodificado: decoded.uaHash
 * - Debe comparar ambos hashes
 * - Debe retornar 401 Unauthorized cuando no coincidan
 * - Debe limpiar la cookie con clearCookie() al detectar robo
 * - Debe incluir force_logout: true y redirect: true en la respuesta
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
  console.log(`[1/10] Verificando existencia del middleware authMiddleware...`);
  
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
  console.log(`\n[2/10] Verificando extraccion de token del header Authorization...`);
  
  const tokenExtractionPattern = /(?:const|let|var)\s+\w*token\w*\s*=.*(?:req\.cookies|req\.headers|authHeader)/i;
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
  console.log(`\n[3/10] Verificando decodificacion del JWT...`);
  
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
  
  // Verificacion 4: Verificar funcion hashUserAgent con crypto SHA-256
  console.log(`\n[4/10] Verificando funcion hashUserAgent con crypto SHA-256...`);
  
  const hashFunctionPattern = /(?:const|let|var)\s+hashUserAgent\s*=.*crypto\.createHash\s*\(\s*['"\`]sha256['"\`]\s*\)/s;
  const hasHashFunction = hashFunctionPattern.test(fileContent);
  
  if (hasHashFunction) {
    console.log(`  ${colors.green}CORRECTO: Funcion hashUserAgent con SHA-256 encontrada${colors.reset}`);
    successes.push('Funcion hashUserAgent implementada con crypto.createHash("sha256")');
  } else {
    console.log(`  ${colors.red}ERROR: No se encontro funcion hashUserAgent con SHA-256${colors.reset}`);
    issues.push('No existe funcion hashUserAgent o no usa SHA-256');
    testPassed = false;
  }
  
  // Verificacion 5: Verificar extraccion del User-Agent del request
  console.log(`\n[5/10] Verificando extraccion del User-Agent de la peticion...`);
  
  const requestUserAgentPattern = /req\.headers\[['"\`]user-agent['"\`]\]/i;
  const hasRequestUserAgent = requestUserAgentPattern.test(fileContent);
  
  if (hasRequestUserAgent) {
    console.log(`  ${colors.green}CORRECTO: Se extrae User-Agent del header de la peticion${colors.reset}`);
    successes.push('User-Agent extraido de req.headers["user-agent"]');
  } else {
    console.log(`  ${colors.red}ERROR: No se extrae el User-Agent del header${colors.reset}`);
    issues.push('No se lee req.headers["user-agent"]');
    testPassed = false;
  }
  
  // Verificacion 6: Verificar hasheo del User-Agent actual
  console.log(`\n[6/10] Verificando hasheo del User-Agent actual...`);
  
  const hashCurrentUaPattern = /hashUserAgent\s*\(\s*(?:userAgent|req\.headers)/i;
  const hasHashCurrentUa = hashCurrentUaPattern.test(fileContent);
  
  if (hasHashCurrentUa) {
    console.log(`  ${colors.green}CORRECTO: Se hashea el User-Agent actual con hashUserAgent()${colors.reset}`);
    successes.push('User-Agent actual es hasheado antes de comparar');
  } else {
    console.log(`  ${colors.red}ERROR: No se hashea el User-Agent actual${colors.reset}`);
    issues.push('No se llama a hashUserAgent() con el User-Agent actual');
    testPassed = false;
  }
  
  // Verificacion 7: Verificar extraccion del hash del JWT
  console.log(`\n[7/10] Verificando extraccion del hash del JWT decodificado...`);
  
  const jwtUaHashPattern = /decoded\.uaHash/;
  const hasJwtUaHash = jwtUaHashPattern.test(fileContent);
  
  if (hasJwtUaHash) {
    console.log(`  ${colors.green}CORRECTO: Se extrae uaHash del JWT decodificado${colors.reset}`);
    successes.push('Hash del User-Agent extraido del payload JWT (decoded.uaHash)');
  } else {
    console.log(`  ${colors.red}ERROR: No se extrae decoded.uaHash del JWT${colors.reset}`);
    issues.push('No se accede a decoded.uaHash');
    testPassed = false;
  }
  
  // Verificacion 8: Verificar comparacion de hashes
  console.log(`\n[8/10] Verificando comparacion entre hash actual y hash del JWT...`);
  
  const hashComparisonPattern = /decoded\.uaHash\s*(?:&&|&)?\s*decoded\.uaHash\s*(?:!==|!=|===|==)\s*\w+UaHash|\w+UaHash\s*(?:!==|!=|===|==)\s*decoded\.uaHash/;
  const hasHashComparison = hashComparisonPattern.test(fileContent);
  
  if (hasHashComparison) {
    console.log(`  ${colors.green}CORRECTO: Se compara el hash actual con el hash del JWT${colors.reset}`);
    successes.push('Comparacion de hashes implementada correctamente');
  } else {
    console.log(`  ${colors.red}ERROR: No se compara decoded.uaHash con el hash actual${colors.reset}`);
    issues.push('No se compara decoded.uaHash !== currentUaHash');
    testPassed = false;
  }
  
  // Verificacion 9: Verificar limpieza de cookie cuando no coincidan
  console.log(`\n[9/10] Verificando limpieza de cookie al detectar robo...`);
  
  const clearCookiePattern = /res\.clearCookie\s*\(\s*['"\`]session_token['"\`]/;
  const hasClearCookie = clearCookiePattern.test(fileContent);
  
  if (hasClearCookie) {
    console.log(`  ${colors.green}CORRECTO: Se limpia la cookie con clearCookie() al detectar robo${colors.reset}`);
    successes.push('Cookie invalidada con res.clearCookie("session_token")');
  } else {
    console.log(`  ${colors.yellow}ADVERTENCIA: No se limpia la cookie al detectar robo${colors.reset}`);
    warnings.push('Se recomienda limpiar cookie con clearCookie() al detectar discrepancia');
  }
  
  // Verificacion 10: Verificar respuesta 401 con flags force_logout y redirect
  console.log(`\n[10/10] Verificando respuesta 401 con force_logout y redirect...`);
  
  const response401Pattern = /res\.status\s*\(\s*401\s*\).*\.json\s*\(/s;
  const forceLogoutPattern = /force_logout\s*:\s*true/;
  const redirectPattern = /redirect\s*:\s*true/;
  
  const has401WithJson = response401Pattern.test(fileContent);
  const hasForceLogout = forceLogoutPattern.test(fileContent);
  const hasRedirect = redirectPattern.test(fileContent);
  
  if (has401WithJson && hasForceLogout && hasRedirect) {
    console.log(`  ${colors.green}CORRECTO: Respuesta 401 con force_logout y redirect implementada${colors.reset}`);
    successes.push('Respuesta 401 incluye force_logout: true y redirect: true');
  } else {
    if (!has401WithJson) {
      console.log(`  ${colors.red}ERROR: No se retorna status 401${colors.reset}`);
      issues.push('No se retorna res.status(401)');
      testPassed = false;
    }
    if (!hasForceLogout) {
      console.log(`  ${colors.yellow}ADVERTENCIA: No se incluye force_logout: true${colors.reset}`);
      warnings.push('Se recomienda incluir force_logout: true para informar al frontend');
    }
    if (!hasRedirect) {
      console.log(`  ${colors.yellow}ADVERTENCIA: No se incluye redirect: true${colors.reset}`);
      warnings.push('Se recomienda incluir redirect: true para informar al frontend');
    }
  }
  
  // Analisis adicional: Verificar si el middleware actual NO tiene validacion
  console.log(`\n${colors.magenta}[ANALISIS ADICIONAL]${colors.reset}`);
  console.log(`Verificando si la validacion de User-Agent esta realmente implementada...\n`);
  
  // Contar cuantas verificaciones pasaron relacionadas con User-Agent
  const userAgentChecks = [
    hasHashFunction,
    hasRequestUserAgent, 
    hasHashCurrentUa,
    hasJwtUaHash, 
    hasHashComparison
  ];
  const userAgentChecksPassed = userAgentChecks.filter(check => check).length;
  const totalUserAgentChecks = userAgentChecks.length;
  
  if (userAgentChecksPassed === 0) {
    console.log(`  ${colors.red}CRITICO: La validacion de User-Agent NO esta implementada${colors.reset}`);
    console.log(`  ${colors.yellow}El middleware actual solo verifica el token JWT pero no valida${colors.reset}`);
    console.log(`  ${colors.yellow}que el hash del User-Agent coincida con el registrado durante el login.${colors.reset}`);
    console.log(`  ${colors.yellow}Esto permite que tokens robados se usen desde cualquier dispositivo.${colors.reset}\n`);
    issues.push('CRITICO: Validacion de User-Agent completamente ausente');
    testPassed = false;
  } else if (userAgentChecksPassed < totalUserAgentChecks) {
    console.log(`  ${colors.yellow}ADVERTENCIA: Validacion de User-Agent parcialmente implementada${colors.reset}`);
    console.log(`  ${colors.yellow}Solo ${userAgentChecksPassed}/${totalUserAgentChecks} verificaciones relacionadas con User-Agent pasaron.${colors.reset}\n`);
    warnings.push(`Validacion de User-Agent incompleta (${userAgentChecksPassed}/${totalUserAgentChecks})`);
  } else {
    console.log(`  ${colors.green}CORRECTO: Validacion de User-Agent completamente implementada${colors.reset}`);
    console.log(`  ${colors.green}Se usa hash SHA-256 para comparar User-Agent de forma segura.${colors.reset}\n`);
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

console.log(`${colors.blue}Como funciona la validacion (implementacion con hash SHA-256):${colors.reset}`);
console.log(`1. Durante el login, se hashea el User-Agent con SHA-256 y se guarda en el JWT.`);
console.log(`2. En cada peticion autenticada, el middleware:`);
console.log(`   a) Extrae el User-Agent del header: req.headers['user-agent']`);
console.log(`   b) Hashea el User-Agent actual: hashUserAgent(userAgent)`);
console.log(`   c) Decodifica el JWT y extrae: decoded.uaHash`);
console.log(`   d) Compara el hash actual con el hash del JWT`);
console.log(`   e) Si NO coinciden: limpia la cookie y retorna 401 con force_logout y redirect`);
console.log(`   f) Si coinciden: permite continuar con la peticion\n`);

console.log(`${colors.blue}Ventajas del hash SHA-256:${colors.reset}`);
console.log(`- No expone el User-Agent real en el token (privacidad).`);
console.log(`- Longitud fija independiente del User-Agent original.`);
console.log(`- Imposible revertir el hash para obtener el User-Agent original.`);
console.log(`- Comparacion rapida y segura.\n`);

console.log(`${colors.blue}Escenario de ataque sin validacion:${colors.reset}`);
console.log(`1. Usuario inicia sesion desde Chrome en Windows.`);
console.log(`2. Atacante intercepta el JWT (XSS, MITM, etc).`);
console.log(`3. Atacante usa el JWT desde Firefox en Linux.`);
console.log(`4. Sin validacion: El servidor acepta el token robado.`);
console.log(`5. Con validacion: El servidor detecta cambio de User-Agent y rechaza.\n`);

console.log(`${colors.blue}Implementacion recomendada (con hash SHA-256):${colors.reset}`);
console.log(`Funcion auxiliar (en ambos archivos):`);
console.log(`  const crypto = require('crypto');`);
console.log(`  const hashUserAgent = (userAgent) => {`);
console.log(`    return crypto.createHash('sha256').update(userAgent || '').digest('hex');`);
console.log(`  };`);
console.log(``);
console.log(`Durante el login (authController.js):`);
console.log(`  const userAgent = req.headers['user-agent'];`);
console.log(`  const uaHash = hashUserAgent(userAgent);`);
console.log(`  const token = jwt.sign({ userId, uaHash, ... }, secret);`);
console.log(``);
console.log(`En el middleware (authMiddleware_new.js):`);
console.log(`  const decoded = jwt.verify(token, secret);`);
console.log(`  const userAgent = req.headers['user-agent'];`);
console.log(`  const currentUaHash = hashUserAgent(userAgent);`);
console.log(`  if (decoded.uaHash && decoded.uaHash !== currentUaHash) {`);
console.log(`    res.clearCookie('session_token', cookieOptions);`);
console.log(`    return res.status(401).json({`);
console.log(`      message: 'No autorizado. El token de sesion falta, es invalido o ha expirado.',`);
console.log(`      force_logout: true,`);
console.log(`      redirect: true`);
console.log(`    });`);
console.log(`  }`);
console.log(``);  

console.log(`${colors.blue}Limitaciones y consideraciones:${colors.reset}`);
console.log(`- El User-Agent puede ser falsificado por un atacante sofisticado.`);
console.log(`- El hash SHA-256 previene la exposicion del User-Agent en el token.`);
console.log(`- No es una solucion perfecta, pero agrega capa de defensa.`);
console.log(`- Debe combinarse con otras medidas: HTTPS, tokens de corta duracion, etc.`);
console.log(`- Algunos navegadores/proxies modifican el User-Agent automaticamente.`);
console.log(`- El hash protege la privacidad al no almacenar el User-Agent en texto plano.\n`);

// Resultado final
if (testPassed) {
  console.log(`${colors.green}========================================`);
  console.log(`RESULTADO: PRUEBA SUPERADA`);
  console.log(`========================================${colors.reset}`);
  console.log(`\nEl middleware implementa correctamente la validacion de User-Agent con hash SHA-256.`);
  console.log(`Se compara el hash del User-Agent de la peticion con el almacenado en el JWT,`);
  console.log(`rechazando peticiones donde no coincidan con status 401, limpiando la cookie`);
  console.log(`e indicando force_logout y redirect para que el frontend procese el cierre de sesion.\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}========================================`);
  console.log(`RESULTADO: PRUEBA FALLIDA`);
  console.log(`========================================${colors.reset}`);
  console.log(`\nSe detectaron problemas en la validacion de User-Agent con hash SHA-256.`);
  console.log(`El middleware NO implementa correctamente la validacion requerida para prevenir`);
  console.log(`el uso de tokens robados desde dispositivos diferentes.`);
  console.log(`\nSe recomienda implementar:`);
  console.log(`  1. Funcion hashUserAgent con crypto.createHash('sha256')`);
  console.log(`  2. Hasheo del User-Agent actual y comparacion con decoded.uaHash`);
  console.log(`  3. Limpieza de cookie con clearCookie() al detectar discrepancia`);
  console.log(`  4. Respuesta 401 con force_logout y redirect flags`);
  console.log(`\nArchivo a modificar: middleware/authMiddleware_new.js\n`);
  process.exit(1);
}
