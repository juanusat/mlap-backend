// test_api_flow.js - Prueba del flujo de autenticación según routes_public.yaml
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Configurar axios para manejar cookies
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  validateStatus: () => true // No rechazar códigos de estado
});

async function testAuthFlow() {
  console.log('🧪 Iniciando pruebas del flujo de autenticación...\n');

  try {
    // PASO 1: Registro de usuario
    console.log('📝 PASO 1: Registro de usuario');
    const registerData = {
      first_names: 'Juan Carlos',
      paternal_surname: 'Pérez',
      maternal_surname: 'García',
      email: 'jperez@example.com',
      document_type_id: 1,
      document: '12345678',
      username: 'jperez',
      password: 'password123'
    };

    const registerResponse = await axiosInstance.post('/auth/register', registerData);
    console.log(`Status: ${registerResponse.status}`);
    console.log(`Response:`, registerResponse.data);

    if (registerResponse.status !== 201) {
      console.log('❌ Error en registro, continuando con login...\n');
    } else {
      console.log('✅ Usuario registrado exitosamente\n');
    }

    // PASO 2: Login
    console.log('🔑 PASO 2: Login');
    const loginData = {
      email: 'jperez@example.com',
      password: 'password123'
    };

    const loginResponse = await axiosInstance.post('/auth/login', loginData);
    console.log(`Status: ${loginResponse.status}`);
    console.log(`Response:`, JSON.stringify(loginResponse.data, null, 2));

    if (loginResponse.status !== 200) {
      console.log('❌ Error en login. Deteniendo pruebas.');
      return;
    }
    console.log('✅ Login exitoso\n');

    // PASO 3: Seleccionar contexto de parroquia
    console.log('🏛️ PASO 3: Seleccionar contexto de parroquia');
    const selectContextData = {
      context_type: 'PARISH',
      parishId: 1 // Asumiendo que existe una parroquia con ID 1
    };

    const contextResponse = await axiosInstance.post('/auth/select-context', selectContextData);
    console.log(`Status: ${contextResponse.status}`);
    console.log(`Response:`, contextResponse.data);

    if (contextResponse.status !== 200) {
      console.log('❌ Error al seleccionar contexto\n');
    } else {
      console.log('✅ Contexto seleccionado exitosamente\n');
    }

    // PASO 4: Obtener roles disponibles
    console.log('👥 PASO 4: Obtener roles disponibles');
    const rolesResponse = await axiosInstance.get('/auth/roles');
    console.log(`Status: ${rolesResponse.status}`);
    console.log(`Response:`, JSON.stringify(rolesResponse.data, null, 2));

    if (rolesResponse.status !== 200) {
      console.log('❌ Error al obtener roles\n');
    } else {
      console.log('✅ Roles obtenidos exitosamente\n');
    }

    // PASO 5: Seleccionar rol (si hay roles disponibles)
    if (rolesResponse.status === 200 && rolesResponse.data.data && rolesResponse.data.data.length > 0) {
      console.log('🎭 PASO 5: Seleccionar rol');
      const selectRoleData = {
        roleId: rolesResponse.data.data[0].id
      };

      const roleResponse = await axiosInstance.post('/auth/select-role', selectRoleData);
      console.log(`Status: ${roleResponse.status}`);
      console.log(`Response:`, roleResponse.data);

      if (roleResponse.status !== 200) {
        console.log('❌ Error al seleccionar rol\n');
      } else {
        console.log('✅ Rol seleccionado exitosamente\n');
      }
    } else {
      console.log('⚠️ PASO 5: No hay roles disponibles para seleccionar\n');
    }

    // PASO 6: Obtener capillas (requiere contexto de parroquia)
    console.log('⛪ PASO 6: Obtener capillas de la parroquia');
    const chapelsResponse = await axiosInstance.get('/chapels');
    console.log(`Status: ${chapelsResponse.status}`);
    console.log(`Response:`, JSON.stringify(chapelsResponse.data, null, 2));

    if (chapelsResponse.status !== 200) {
      console.log('❌ Error al obtener capillas\n');
    } else {
      console.log('✅ Capillas obtenidas exitosamente\n');
    }

    // PASO 7: Probar contexto de diócesis
    console.log('🏛️ PASO 7: Seleccionar contexto de diócesis');
    const dioceseContextData = {
      context_type: 'DIOCESE'
    };

    const dioceseResponse = await axiosInstance.post('/auth/select-context', dioceseContextData);
    console.log(`Status: ${dioceseResponse.status}`);
    console.log(`Response:`, dioceseResponse.data);

    if (dioceseResponse.status !== 200) {
      console.log('❌ Error al seleccionar contexto de diócesis\n');
    } else {
      console.log('✅ Contexto de diócesis seleccionado exitosamente\n');
    }

    // PASO 8: Logout
    console.log('🚪 PASO 8: Logout');
    const logoutResponse = await axiosInstance.post('/auth/logout');
    console.log(`Status: ${logoutResponse.status}`);
    console.log(`Response:`, logoutResponse.data);

    if (logoutResponse.status !== 200) {
      console.log('❌ Error en logout\n');
    } else {
      console.log('✅ Logout exitoso\n');
    }

    console.log('🎉 Pruebas completadas!');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Ejecutar las pruebas si el archivo se ejecuta directamente
if (require.main === module) {
  testAuthFlow();
}

module.exports = { testAuthFlow };