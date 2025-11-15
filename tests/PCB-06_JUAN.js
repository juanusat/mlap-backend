/**
 * PCB-06_JUAN.js
 * Prueba de Caja Blanca CB-06: Politica de almacenamiento de archivos (No Blobs en BD)
 * 
 * Objetivo:
 * Verificar que el sistema NO guarda archivos (blobs) directamente en la base de datos,
 * sino que los almacena en el sistema de archivos (directorio uploads/) o en S3,
 * guardando solo la ruta o nombre del archivo en la BD.
 * 
 * Criterio de Exito:
 * - Los modelos NO deben contener operaciones INSERT/UPDATE con datos de tipo BYTEA o similares
 * - Debe existir logica para guardar archivos en disco o S3
 * - La BD debe almacenar solo rutas/nombres de archivo (strings)
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
console.log(`PRUEBA DE CAJA BLANCA: PCB-06_JUAN`);
console.log(`========================================${colors.reset}\n`);

console.log(`${colors.blue}Descripcion:${colors.reset}`);
console.log(`Verificar que los archivos se almacenan en el sistema de archivos`);
console.log(`y NO como blobs en la base de datos.\n`);

// Rutas de los archivos a analizar
const rootPath = path.join(__dirname, '..');
const chapelRoutesPath = path.join(rootPath, 'routes', 'chapelRoutes.js');
const chapelControllerPath = path.join(rootPath, 'controllers', 'chapelController.js');
const chapelModelPath = path.join(rootPath, 'models', 'chapelModel.js');
const userControllerPath = path.join(rootPath, 'controllers', 'userController.js');
const userModelPath = path.join(rootPath, 'models', 'userModel.js');
const uploadsDir = path.join(rootPath, 'uploads');

console.log(`${colors.blue}Archivos a analizar:${colors.reset}`);
console.log(`  - routes/chapelRoutes.js`);
console.log(`  - controllers/chapelController.js`);
console.log(`  - models/chapelModel.js`);
console.log(`  - controllers/userController.js`);
console.log(`  - models/userModel.js`);
console.log(`  - directorio uploads/\n`);

// Variables para almacenar resultados
let testPassed = true;
let issues = [];
let successes = [];
let warnings = [];
let storageStrategy = 'Desconocida';

try {
  console.log(`${colors.blue}Iniciando analisis de politica de almacenamiento...${colors.reset}\n`);
  
  // Verificacion 1: Verificar existencia del directorio uploads/
  console.log(`[1/6] Verificando directorio de almacenamiento uploads/...`);
  
  if (fs.existsSync(uploadsDir)) {
    console.log(`  ${colors.green}ENCONTRADO: Directorio uploads/ existe${colors.reset}`);
    successes.push('Directorio uploads/ existe para almacenamiento local');
    storageStrategy = 'Sistema de archivos local (uploads/)';
    
    // Contar archivos en uploads
    try {
      const files = fs.readdirSync(uploadsDir);
      console.log(`  ${colors.cyan}INFO: ${files.length} archivos en directorio uploads/${colors.reset}`);
    } catch (err) {
      console.log(`  ${colors.yellow}INFO: No se pudo leer el contenido de uploads/${colors.reset}`);
    }
  } else {
    console.log(`  ${colors.yellow}ADVERTENCIA: Directorio uploads/ no existe${colors.reset}`);
    warnings.push('Directorio uploads/ no encontrado (puede crearse dinamicamente)');
  }
  
  // Verificacion 2: Analizar chapelRoutes.js para configuracion de multer
  console.log(`\n[2/6] Analizando configuracion de multer en routes/chapelRoutes.js...`);
  
  if (fs.existsSync(chapelRoutesPath)) {
    const routesContent = fs.readFileSync(chapelRoutesPath, 'utf8');
    
    console.log(`  ${colors.green}ENCONTRADO: chapelRoutes.js existe${colors.reset}`);
    
    // Buscar configuracion de multer
    const hasMulter = /require\s*\(\s*['"]multer['"]\s*\)/i.test(routesContent);
    const hasMemoryStorage = /memoryStorage\s*\(\s*\)/i.test(routesContent);
    const hasDiskStorage = /diskStorage\s*\(\s*\)/i.test(routesContent);
    const hasMulterS3 = /multer-s3|multerS3/i.test(routesContent);
    
    if (hasMulter) {
      console.log(`  ${colors.green}CORRECTO: Multer configurado para manejo de archivos${colors.reset}`);
      successes.push('Multer configurado en las rutas');
      
      if (hasMemoryStorage) {
        console.log(`  ${colors.cyan}INFO: Usa memoryStorage (buffer en memoria)${colors.reset}`);
        console.log(`  ${colors.cyan}      Los archivos se procesaran en el controlador${colors.reset}`);
      }
      
      if (hasDiskStorage) {
        console.log(`  ${colors.cyan}INFO: Usa diskStorage (guardado directo a disco)${colors.reset}`);
      }
      
      if (hasMulterS3) {
        console.log(`  ${colors.cyan}INFO: Usa multer-s3 (almacenamiento en AWS S3)${colors.reset}`);
        storageStrategy = 'AWS S3';
      }
    } else {
      console.log(`  ${colors.yellow}INFO: No se detecta configuracion de multer${colors.reset}`);
    }
  } else {
    console.log(`  ${colors.yellow}NO ENCONTRADO: chapelRoutes.js no existe${colors.reset}`);
  }
  
  // Verificacion 3: Analizar chapelController.js
  console.log(`\n[3/6] Analizando logica en controllers/chapelController.js...`);
  
  if (fs.existsSync(chapelControllerPath)) {
    const controllerContent = fs.readFileSync(chapelControllerPath, 'utf8');
    
    console.log(`  ${colors.green}ENCONTRADO: chapelController.js existe${colors.reset}`);
    
    // Buscar manipulacion de archivos
    const hasFileWrite = /fs\.writeFile|fs\.writeFileSync/i.test(controllerContent);
    const hasBufferHandling = /req\.file\.buffer|req\.files/i.test(controllerContent);
    const passesBufferToModel = /buffer\s*:/i.test(controllerContent);
    
    if (hasFileWrite) {
      console.log(`  ${colors.green}CORRECTO: Controlador escribe archivos con fs${colors.reset}`);
      successes.push('Controlador gestiona escritura de archivos');
    }
    
    if (hasBufferHandling) {
      console.log(`  ${colors.cyan}INFO: Controlador maneja req.file.buffer${colors.reset}`);
    }
    
    if (passesBufferToModel) {
      console.log(`  ${colors.cyan}INFO: Controlador pasa buffer al modelo para procesamiento${colors.reset}`);
    }
  } else {
    console.log(`  ${colors.yellow}NO ENCONTRADO: chapelController.js no existe${colors.reset}`);
  }
  
  // Verificacion 4: Analizar chapelModel.js (CRITICO)
  console.log(`\n[4/6] Analizando models/chapelModel.js para deteccion de blobs en BD...`);
  
  if (fs.existsSync(chapelModelPath)) {
    const modelContent = fs.readFileSync(chapelModelPath, 'utf8');
    
    console.log(`  ${colors.green}ENCONTRADO: chapelModel.js existe${colors.reset}`);
    
    // VERIFICACION CRITICA: Buscar si se guardan blobs en la BD
    const hasByteaInsert = /INSERT[\s\S]*?BYTEA|UPDATE[\s\S]*?BYTEA/i.test(modelContent);
    const hasBufferInQuery = /\$\d+.*buffer|\$\{.*buffer.*\}/i.test(modelContent);
    const hasBase64Insert = /INSERT[\s\S]*?base64|UPDATE[\s\S]*?base64/i.test(modelContent);
    
    if (hasByteaInsert || hasBufferInQuery || hasBase64Insert) {
      console.log(`  ${colors.red}ERROR: Se detecta posible almacenamiento de blob en BD${colors.reset}`);
      issues.push('El modelo podria estar guardando archivos en la base de datos');
      testPassed = false;
    } else {
      console.log(`  ${colors.green}CORRECTO: No se detecta almacenamiento de blobs en BD${colors.reset}`);
      successes.push('Modelo NO guarda blobs en la base de datos');
    }
    
    // Buscar escritura de archivos a disco
    const hasFileWrite = /fs\.writeFile|fs\.writeFileSync/i.test(modelContent);
    const hasPathJoin = /path\.join.*uploads/i.test(modelContent);
    const hasFilenameStorage = /profile_photo|cover_photo|filename/i.test(modelContent);
    
    if (hasFileWrite && hasPathJoin) {
      console.log(`  ${colors.green}CORRECTO: Modelo escribe archivos al directorio uploads/${colors.reset}`);
      successes.push('Modelo implementa escritura de archivos a disco');
    }
    
    if (hasFilenameStorage) {
      console.log(`  ${colors.green}CORRECTO: Modelo almacena nombres de archivo en BD${colors.reset}`);
      successes.push('Solo se guardan nombres/rutas de archivo en BD');
      
      // Mostrar fragmento
      const filenameMatch = modelContent.match(/(profile_photo|cover_photo|filename)[\s\S]{0,100}/i);
      if (filenameMatch) {
        console.log(`\n  ${colors.cyan}Fragmento detectado:${colors.reset}`);
        const fragment = filenameMatch[0].split('\n').slice(0, 3).join('\n');
        console.log(`  ${fragment}`);
      }
    }
  } else {
    console.log(`  ${colors.yellow}NO ENCONTRADO: chapelModel.js no existe${colors.reset}`);
  }
  
  // Verificacion 5: Revisar userController.js y userModel.js
  console.log(`\n[5/6] Verificando gestion de fotos de perfil de usuario...`);
  
  let userFilesChecked = false;
  
  if (fs.existsSync(userControllerPath)) {
    const userControllerContent = fs.readFileSync(userControllerPath, 'utf8');
    console.log(`  ${colors.green}ENCONTRADO: userController.js existe${colors.reset}`);
    
    const hasFileHandling = /req\.file|multer|upload/i.test(userControllerContent);
    if (hasFileHandling) {
      console.log(`  ${colors.cyan}INFO: userController maneja subida de archivos${colors.reset}`);
      userFilesChecked = true;
    }
  }
  
  if (fs.existsSync(userModelPath)) {
    const userModelContent = fs.readFileSync(userModelPath, 'utf8');
    console.log(`  ${colors.green}ENCONTRADO: userModel.js existe${colors.reset}`);
    
    // Verificar que no guarde blobs
    const hasByteaInsert = /INSERT[\s\S]*?BYTEA|UPDATE[\s\S]*?BYTEA/i.test(userModelContent);
    const hasBufferInQuery = /\$\d+.*buffer/i.test(userModelContent);
    
    if (hasByteaInsert || hasBufferInQuery) {
      console.log(`  ${colors.red}ERROR: userModel podria guardar blobs en BD${colors.reset}`);
      issues.push('userModel podria estar guardando archivos en BD');
      testPassed = false;
    } else {
      console.log(`  ${colors.green}CORRECTO: userModel NO guarda blobs en BD${colors.reset}`);
      successes.push('userModel cumple politica de almacenamiento');
    }
    
    userFilesChecked = true;
  }
  
  if (!userFilesChecked) {
    console.log(`  ${colors.yellow}INFO: No se encontraron archivos de usuario para verificar${colors.reset}`);
  }
  
  // Verificacion 6: Buscar uso de AWS S3
  console.log(`\n[6/6] Buscando integracion con servicios de almacenamiento cloud...`);
  
  const filesToCheck = [chapelModelPath, chapelControllerPath, userModelPath, userControllerPath];
  let hasS3Integration = false;
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (/aws-sdk|@aws-sdk|s3\.putObject|s3\.upload/i.test(content)) {
        hasS3Integration = true;
      }
    }
  });
  
  if (hasS3Integration) {
    console.log(`  ${colors.green}DETECTADO: Integracion con AWS S3${colors.reset}`);
    successes.push('Sistema usa AWS S3 para almacenamiento cloud');
    storageStrategy = 'AWS S3 (cloud storage)';
  } else {
    console.log(`  ${colors.cyan}INFO: No se detecta integracion con S3${colors.reset}`);
    console.log(`  ${colors.cyan}      El almacenamiento es local (uploads/)${colors.reset}`);
  }
  
} catch (error) {
  console.log(`\n${colors.red}ERROR al realizar el analisis:${colors.reset}`);
  console.log(error.message);
  issues.push(`Error durante el analisis: ${error.message}`);
  testPassed = false;
}

// Mostrar resumen de resultados
console.log(`\n${colors.cyan}========================================`);
console.log(`RESUMEN DE RESULTADOS`);
console.log(`========================================${colors.reset}\n`);

console.log(`${colors.magenta}Estrategia de almacenamiento detectada:${colors.reset}`);
console.log(`  ${storageStrategy}\n`);

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

// Explicacion de la politica de almacenamiento
console.log(`${colors.cyan}========================================`);
console.log(`POLITICA DE ALMACENAMIENTO DE ARCHIVOS`);
console.log(`========================================${colors.reset}\n`);

console.log(`${colors.blue}Por que NO guardar archivos en la base de datos:${colors.reset}`);
console.log(`1. Rendimiento: Los blobs en BD aumentan el tamano y ralentizan queries`);
console.log(`2. Escalabilidad: Archivos grandes saturan el almacenamiento de BD`);
console.log(`3. Backups: Los backups de BD se vuelven muy pesados y lentos`);
console.log(`4. Costos: Almacenamiento de BD es mas costoso que disco/S3\n`);

console.log(`${colors.blue}Mejores practicas:${colors.reset}`);
console.log(`1. Guardar archivos en sistema de archivos (uploads/) o S3`);
console.log(`2. Almacenar solo la ruta/nombre del archivo en la BD`);
console.log(`3. Implementar limpieza periodica de archivos huerfanos`);
console.log(`4. Usar CDN para servir archivos estaticos en produccion\n`);

console.log(`${colors.blue}Flujo correcto:${colors.reset}`);
console.log(`1. Cliente sube archivo via multipart/form-data`);
console.log(`2. Multer procesa el archivo (memoryStorage o diskStorage)`);
console.log(`3. Controlador guarda archivo en uploads/ o S3`);
console.log(`4. Modelo guarda solo el nombre/ruta en BD (VARCHAR/TEXT)`);
console.log(`5. Para recuperar: se lee la ruta de BD y se sirve el archivo\n`);

// Resultado final
if (testPassed) {
  console.log(`${colors.green}========================================`);
  console.log(`RESULTADO: PRUEBA SUPERADA`);
  console.log(`========================================${colors.reset}`);
  console.log(`\nEl sistema cumple con la politica de almacenamiento de archivos.`);
  console.log(`Los archivos se guardan en el sistema de archivos (o S3) y solo`);
  console.log(`las rutas/nombres se almacenan en la base de datos.\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}========================================`);
  console.log(`RESULTADO: PRUEBA FALLIDA`);
  console.log(`========================================${colors.reset}`);
  console.log(`\nSe detectaron posibles violaciones a la politica de almacenamiento.`);
  console.log(`Revisar los problemas detectados y corregir el codigo para NO`);
  console.log(`guardar archivos (blobs) directamente en la base de datos.\n`);
  process.exit(1);
}
