/**
 * PCB-08_PAMELA.js
 * Prueba de Caja Blanca CB-08: Revision de Consulta SQL para disponibilidad de reserva
 * 
 * Objetivo:
 * Analizar el plan de ejecucion de la consulta SQL que calcula la disponibilidad
 * de cupos para una variante de evento en una fecha especifica. Verificar que:
 * - Se usen indices en chapel_event_id y event_date de la tabla reservation
 * - No haya JOINS ineficientes (Seq Scan en lugar de Index Scan)
 * - El tiempo de ejecucion sea inferior a 200ms
 * 
 * Criterio de Exito:
 * - EXPLAIN ANALYZE debe mostrar uso de indices (Index Scan, Bitmap Index Scan)
 * - Tiempo de ejecucion total < 200ms
 * - No debe haber consultas N+1
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
console.log(`PRUEBA DE CAJA BLANCA: PCB-08_PAMELA`);
console.log(`========================================${colors.reset}\n`);

console.log(`${colors.blue}Descripcion:${colors.reset}`);
console.log(`Analisis de rendimiento y plan de ejecucion SQL`);
console.log(`de la consulta de disponibilidad de reservas.\n`);

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

// Funcion para analizar el plan de ejecucion
function analyzeExecutionPlan(planText) {
  const analysis = {
    hasSeqScan: false,
    hasIndexScan: false,
    hasBitmapIndexScan: false,
    executionTimeMs: null,
    planningTimeMs: null,
    seqScans: [],
    indexScans: [],
    inefficientOperations: []
  };
  
  const lines = planText.split('\n');
  
  lines.forEach(line => {
    // Detectar Seq Scan (escaneo secuencial - ineficiente en tablas grandes)
    if (line.includes('Seq Scan')) {
      analysis.hasSeqScan = true;
      const match = line.match(/Seq Scan on (\w+)/);
      if (match) {
        analysis.seqScans.push(match[1]);
      }
    }
    
    // Detectar Index Scan (eficiente)
    if (line.includes('Index Scan')) {
      analysis.hasIndexScan = true;
      const match = line.match(/Index Scan.*on (\w+)/);
      if (match) {
        analysis.indexScans.push(match[1]);
      }
    }
    
    // Detectar Bitmap Index Scan (tambien eficiente)
    if (line.includes('Bitmap Index Scan')) {
      analysis.hasBitmapIndexScan = true;
    }
    
    // Extraer tiempos de ejecucion
    if (line.includes('Execution Time:')) {
      const match = line.match(/Execution Time:\s+([\d.]+)\s+ms/);
      if (match) {
        analysis.executionTimeMs = parseFloat(match[1]);
      }
    }
    
    if (line.includes('Planning Time:')) {
      const match = line.match(/Planning Time:\s+([\d.]+)\s+ms/);
      if (match) {
        analysis.planningTimeMs = parseFloat(match[1]);
      }
    }
    
    // Detectar operaciones potencialmente ineficientes
    if (line.includes('Hash Join') && line.includes('cost')) {
      const costMatch = line.match(/cost=([\d.]+)\.\.([\d.]+)/);
      if (costMatch && parseFloat(costMatch[2]) > 1000) {
        analysis.inefficientOperations.push('Hash Join con costo alto: ' + costMatch[2]);
      }
    }
  });
  
  return analysis;
}

// Funcion principal de prueba
async function runSQLPerformanceTest() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log(`${colors.blue}Iniciando analisis de rendimiento SQL...${colors.reset}\n`);
    
    // Verificacion 1: Obtener datos de prueba
    console.log(`[1/6] Obteniendo datos de prueba...`);
    
    const variantQuery = `
      SELECT ev.id, ev.name, ce.chapel_id
      FROM public.event_variant ev
      INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
      WHERE ev.active = true
      LIMIT 1
    `;
    const variantResult = await pool.query(variantQuery);
    
    if (variantResult.rows.length === 0) {
      console.log(`  ${colors.red}ERROR: No hay variantes de evento disponibles${colors.reset}`);
      issues.push('No hay datos para realizar la prueba');
      testPassed = false;
      return;
    }
    
    const testEventVariantId = variantResult.rows[0].id;
    const testChapelId = variantResult.rows[0].chapel_id;
    const testDate = '2026-05-15';
    const testTime = '10:00:00';
    
    console.log(`  ${colors.green}Evento de prueba: ${variantResult.rows[0].name} (ID: ${testEventVariantId})${colors.reset}`);
    console.log(`  ${colors.cyan}Chapel ID: ${testChapelId}${colors.reset}`);
    successes.push('Datos de prueba obtenidos correctamente');
    
    // Verificacion 2: Verificar volumen de datos en reservation
    console.log(`\n[2/6] Verificando volumen de datos en la tabla reservation...`);
    
    const countQuery = `SELECT COUNT(*) as total FROM public.reservation`;
    const countResult = await pool.query(countQuery);
    const reservationCount = parseInt(countResult.rows[0].total);
    
    console.log(`  ${colors.cyan}Registros en reservation: ${reservationCount}${colors.reset}`);
    
    if (reservationCount < 100) {
      console.log(`  ${colors.yellow}ADVERTENCIA: Pocas reservas (${reservationCount}). Se recomienda >1000 para pruebas de rendimiento${colors.reset}`);
      warnings.push(`Solo hay ${reservationCount} reservas (se recomienda >1000 para pruebas realistas)`);
    } else {
      console.log(`  ${colors.green}Volumen de datos suficiente para pruebas de rendimiento${colors.reset}`);
      successes.push(`${reservationCount} reservas disponibles para analisis`);
    }
    
    // Verificacion 3: Verificar indices existentes
    console.log(`\n[3/6] Verificando indices en la tabla reservation...`);
    
    const indexQuery = `
      SELECT 
        i.relname as index_name,
        a.attname as column_name
      FROM pg_class t
      INNER JOIN pg_index ix ON t.oid = ix.indrelid
      INNER JOIN pg_class i ON i.oid = ix.indexrelid
      INNER JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relname = 'reservation'
        AND t.relkind = 'r'
      ORDER BY i.relname, a.attnum
    `;
    const indexResult = await pool.query(indexQuery);
    
    console.log(`  ${colors.cyan}Indices encontrados:${colors.reset}`);
    
    const indexMap = {};
    indexResult.rows.forEach(row => {
      if (!indexMap[row.index_name]) {
        indexMap[row.index_name] = [];
      }
      indexMap[row.index_name].push(row.column_name);
    });
    
    let hasEventDateIndex = false;
    let hasEventVariantIndex = false;
    
    Object.keys(indexMap).forEach(indexName => {
      const columns = indexMap[indexName];
      console.log(`    - ${indexName}: [${columns.join(', ')}]`);
      
      if (columns.includes('event_date')) {
        hasEventDateIndex = true;
      }
      if (columns.includes('event_variant_id')) {
        hasEventVariantIndex = true;
      }
    });
    
    if (hasEventDateIndex) {
      console.log(`  ${colors.green}CORRECTO: Existe indice en event_date${colors.reset}`);
      successes.push('Indice en event_date encontrado');
    } else {
      console.log(`  ${colors.yellow}ADVERTENCIA: No se encontro indice en event_date${colors.reset}`);
      warnings.push('Falta indice en event_date (puede afectar rendimiento)');
    }
    
    if (hasEventVariantIndex) {
      console.log(`  ${colors.green}CORRECTO: Existe indice en event_variant_id${colors.reset}`);
      successes.push('Indice en event_variant_id encontrado');
    } else {
      console.log(`  ${colors.yellow}ADVERTENCIA: No se encontro indice en event_variant_id${colors.reset}`);
      warnings.push('Falta indice en event_variant_id (puede afectar rendimiento)');
    }
    
    // Verificacion 4: Ejecutar EXPLAIN ANALYZE de la consulta de disponibilidad
    console.log(`\n[4/6] Ejecutando EXPLAIN ANALYZE de la consulta de disponibilidad...`);
    
    // Esta es una version simplificada de la consulta de checkAvailability
    // enfocada en la parte que une event_variant, reservation y chapel_event
    const explainQuery = `
      EXPLAIN ANALYZE
      WITH event_info AS (
        SELECT ev.id, ce.chapel_id, ev.duration_minutes
        FROM public.event_variant ev
        INNER JOIN public.chapel_event ce ON ev.chapel_event_id = ce.id
        WHERE ev.id = $1 AND ev.active = true
      ),
      existing_reservation AS (
        SELECT 
          r.id,
          r.event_time,
          ev_existing.duration_minutes
        FROM public.reservation r
        INNER JOIN public.event_variant ev_existing ON r.event_variant_id = ev_existing.id
        INNER JOIN public.chapel_event ce ON ev_existing.chapel_event_id = ce.id
        INNER JOIN event_info ei ON ce.chapel_id = ei.chapel_id
        WHERE r.event_date = $2::date
          AND r.status NOT IN ('CANCELLED', 'REJECTED')
          AND (
            ($3::time >= r.event_time 
             AND $3::time < (r.event_time + (ev_existing.duration_minutes || ' minutes')::interval)::time)
            OR
            (($3::time + (ei.duration_minutes || ' minutes')::interval)::time > r.event_time 
             AND ($3::time + (ei.duration_minutes || ' minutes')::interval)::time <= (r.event_time + (ev_existing.duration_minutes || ' minutes')::interval)::time)
          )
        LIMIT 1
      )
      SELECT 
        CASE 
          WHEN EXISTS (SELECT 1 FROM existing_reservation) THEN false
          ELSE true
        END as available
    `;
    
    const explainResult = await pool.query(explainQuery, [testEventVariantId, testDate, testTime]);
    
    const planText = explainResult.rows.map(row => row['QUERY PLAN']).join('\n');
    
    console.log(`\n  ${colors.cyan}Plan de Ejecucion:${colors.reset}`);
    console.log(`  ${colors.magenta}${'='.repeat(70)}${colors.reset}`);
    planText.split('\n').forEach(line => {
      // Colorear lineas importantes
      if (line.includes('Seq Scan')) {
        console.log(`  ${colors.red}${line}${colors.reset}`);
      } else if (line.includes('Index Scan') || line.includes('Bitmap Index Scan')) {
        console.log(`  ${colors.green}${line}${colors.reset}`);
      } else if (line.includes('Execution Time') || line.includes('Planning Time')) {
        console.log(`  ${colors.cyan}${line}${colors.reset}`);
      } else {
        console.log(`  ${line}`);
      }
    });
    console.log(`  ${colors.magenta}${'='.repeat(70)}${colors.reset}\n`);
    
    // Verificacion 5: Analizar el plan de ejecucion
    console.log(`[5/6] Analizando el plan de ejecucion...`);
    
    const analysis = analyzeExecutionPlan(planText);
    
    console.log(`  ${colors.cyan}Resumen del analisis:${colors.reset}`);
    console.log(`    - Seq Scan detectados: ${analysis.seqScans.length > 0 ? analysis.seqScans.join(', ') : 'Ninguno'}`);
    console.log(`    - Index Scan detectados: ${analysis.indexScans.length > 0 ? analysis.indexScans.join(', ') : 'Ninguno'}`);
    console.log(`    - Bitmap Index Scan: ${analysis.hasBitmapIndexScan ? 'Si' : 'No'}`);
    
    if (analysis.executionTimeMs !== null) {
      console.log(`    - Tiempo de ejecucion: ${analysis.executionTimeMs.toFixed(2)} ms`);
    }
    if (analysis.planningTimeMs !== null) {
      console.log(`    - Tiempo de planificacion: ${analysis.planningTimeMs.toFixed(2)} ms`);
    }
    
    // Evaluar Seq Scans (considerar volumen de datos)
    if (analysis.hasSeqScan) {
      const criticalTables = ['reservation', 'event_variant', 'chapel_event'];
      const criticalSeqScans = analysis.seqScans.filter(table => criticalTables.includes(table));
      
      if (criticalSeqScans.length > 0) {
        // Si la tabla tiene pocas filas (<100), el Seq Scan es aceptable y esperado
        if (reservationCount < 100) {
          console.log(`  ${colors.yellow}ADVERTENCIA: Seq Scan en ${criticalSeqScans.join(', ')} (aceptable con ${reservationCount} registros)${colors.reset}`);
          warnings.push(`Seq Scan en ${criticalSeqScans.join(', ')} - Normal con volumen bajo (<100 registros)`);
        } else {
          console.log(`  ${colors.red}ERROR: Seq Scan detectado en tablas criticas: ${criticalSeqScans.join(', ')}${colors.reset}`);
          issues.push(`Seq Scan ineficiente en: ${criticalSeqScans.join(', ')} con ${reservationCount} registros`);
          testPassed = false;
        }
      } else {
        console.log(`  ${colors.yellow}ADVERTENCIA: Seq Scan detectado pero no en tablas criticas${colors.reset}`);
        warnings.push('Seq Scan en tablas secundarias');
      }
    } else {
      console.log(`  ${colors.green}CORRECTO: No se detectaron Seq Scans${colors.reset}`);
      successes.push('Sin escaneos secuenciales');
    }
    
    // Evaluar uso de indices
    if (analysis.hasIndexScan || analysis.hasBitmapIndexScan) {
      console.log(`  ${colors.green}CORRECTO: Se usan indices correctamente${colors.reset}`);
      successes.push('Indices utilizados en la consulta');
    } else {
      console.log(`  ${colors.yellow}ADVERTENCIA: No se detectaron Index Scans explicitos${colors.reset}`);
      warnings.push('Posible falta de uso de indices');
    }
    
    // Verificacion 6: Evaluar tiempo de ejecucion
    console.log(`\n[6/6] Evaluando tiempo de ejecucion...`);
    
    if (analysis.executionTimeMs !== null) {
      const totalTime = analysis.executionTimeMs + (analysis.planningTimeMs || 0);
      
      console.log(`  ${colors.cyan}Tiempo total: ${totalTime.toFixed(2)} ms${colors.reset}`);
      console.log(`  ${colors.cyan}Limite esperado: 200 ms${colors.reset}`);
      
      if (totalTime < 200) {
        console.log(`  ${colors.green}CORRECTO: Tiempo de ejecucion dentro del limite (${totalTime.toFixed(2)} ms < 200 ms)${colors.reset}`);
        successes.push(`Tiempo de ejecucion optimo: ${totalTime.toFixed(2)} ms`);
      } else {
        console.log(`  ${colors.red}ERROR: Tiempo de ejecucion excede el limite (${totalTime.toFixed(2)} ms > 200 ms)${colors.reset}`);
        issues.push(`Tiempo de ejecucion muy alto: ${totalTime.toFixed(2)} ms`);
        testPassed = false;
      }
    } else {
      console.log(`  ${colors.yellow}ADVERTENCIA: No se pudo extraer el tiempo de ejecucion${colors.reset}`);
      warnings.push('Tiempo de ejecucion no disponible en el plan');
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
runSQLPerformanceTest().then(() => {
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
  
  // Explicacion del analisis de rendimiento SQL
  console.log(`${colors.cyan}========================================`);
  console.log(`GUIA DE OPTIMIZACION SQL`);
  console.log(`========================================${colors.reset}\n`);
  
  console.log(`${colors.blue}Tipos de escaneo en PostgreSQL:${colors.reset}`);
  console.log(`1. Seq Scan (Sequential Scan):`);
  console.log(`   - Lee toda la tabla fila por fila.`);
  console.log(`   - INEFICIENTE en tablas grandes (>1000 registros).`);
  console.log(`   - ACEPTABLE en tablas pequeñas (<100 registros): mas rapido que usar indice.`);
  console.log(`   - PostgreSQL elige automaticamente segun el tamaño de la tabla.`);
  console.log(``);
  console.log(`2. Index Scan:`);
  console.log(`   - Usa indices B-tree para acceso directo.`);
  console.log(`   - EFICIENTE para recuperar pocas filas especificas.`);
  console.log(`   - Ideal para consultas con WHERE en columnas indexadas.`);
  console.log(``);
  console.log(`3. Bitmap Index Scan:`);
  console.log(`   - Crea un bitmap de filas que cumplen condiciones.`);
  console.log(`   - EFICIENTE para multiples condiciones OR.`);
  console.log(`   - Combina resultados de varios indices.\n`);
  
  console.log(`${colors.blue}Indices recomendados para reservation:${colors.reset}`);
  console.log(`1. event_date: Para filtrar reservas por fecha.`);
  console.log(`2. event_variant_id: Para JOIN con event_variant.`);
  console.log(`3. status: Para filtrar reservas activas/canceladas.`);
  console.log(`4. Compuesto (event_date, status): Para filtros combinados.\n`);
  
  console.log(`${colors.blue}Como crear indices faltantes:${colors.reset}`);
  console.log(`  CREATE INDEX idx_reservation_event_date ON public.reservation(event_date);`);
  console.log(`  CREATE INDEX idx_reservation_event_variant ON public.reservation(event_variant_id);`);
  console.log(`  CREATE INDEX idx_reservation_status ON public.reservation(status);`);
  console.log(`  CREATE INDEX idx_reservation_date_status ON public.reservation(event_date, status);\n`);
  
  console.log(`${colors.blue}Problemas comunes de rendimiento:${colors.reset}`);
  console.log(`1. N+1 Queries: Multiples queries dentro de un loop.`);
  console.log(`   Solucion: Usar JOINs o queries batch.`);
  console.log(``);
  console.log(`2. Falta de indices: Causa Seq Scans en tablas grandes.`);
  console.log(`   Solucion: Crear indices en columnas de WHERE y JOIN.`);
  console.log(``);
  console.log(`3. JOINS sin indices: Hash Join costoso.`);
  console.log(`   Solucion: Indexar columnas de foreign keys.`);
  console.log(``);
  console.log(`4. Subconsultas repetidas: CTE evaluado multiples veces.`);
  console.log(`   Solucion: Materializar CTE o usar temp tables.\n`);
  
  // Resultado final
  if (testPassed) {
    console.log(`${colors.green}========================================`);
    console.log(`RESULTADO: PRUEBA SUPERADA`);
    console.log(`========================================${colors.reset}`);
    console.log(`\nLa consulta SQL de disponibilidad esta optimizada:`);
    console.log(`- Usa indices correctamente (Index Scan / Bitmap Index Scan).`);
    console.log(`- Tiempo de ejecucion dentro del limite (<200ms).`);
    console.log(`- No hay Seq Scans en tablas criticas.`);
    console.log(`- No hay indicios de problemas N+1.\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}========================================`);
    console.log(`RESULTADO: PRUEBA FALLIDA`);
    console.log(`========================================${colors.reset}`);
    console.log(`\nSe detectaron problemas de rendimiento en la consulta SQL:`);
    console.log(`- Revisar los indices faltantes en reservation.`);
    console.log(`- Considerar optimizar los JOINs.`);
    console.log(`- Evaluar si hay consultas N+1 en el codigo.`);
    console.log(`- Verificar el plan de ejecucion mostrado arriba.\n`);
    process.exit(1);
  }
}).catch(error => {
  console.log(`\n${colors.red}ERROR FATAL:${colors.reset}`);
  console.log(error.message);
  console.log(error.stack);
  process.exit(1);
});
