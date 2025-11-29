# Sistema de Control de Acceso - Nivel 2: Permisos Basados en Roles

## Descripción General

El **Nivel 2** controla **QUÉ puede hacer** un usuario dentro de los módulos a los que tiene acceso según su contexto de sesión (Nivel 1). Este nivel aplica **exclusivamente a trabajadores de parroquia** que no son el párroco administrador.

Este sistema de permisos granulares permite que cada parroquia defina roles personalizados (Secretario, Tesorero, Coordinador de Liturgia, etc.) y asigne permisos específicos de lectura (R), creación (C), actualización (U) y/o eliminación (D) para cada funcionalidad.

## Alcance del Nivel 2

### Usuarios Afectados

**SÍ aplica Nivel 2:**
- ✅ Trabajadores de parroquia con roles asignados (`association` activa + `user_role`)
- ✅ Usuario debe estar en contexto PARISH
- ✅ Debe tener un rol seleccionado activamente

**NO aplica Nivel 2:**
- ❌ **Párroco/Administrador de la parroquia** (`parish.admin_user_id`)
  - Tiene acceso completo automático sin necesidad de permisos
  - No requiere seleccionar roles
  - Sistema lo identifica como `is_parish_admin = true`
- ❌ Usuarios en contexto DIOCESE (tienen permisos completos diocesanos)
- ❌ Usuarios en contexto PARISHIONER (permisos fijos de categoría 'PARISHIONER')

### Módulos Controlados

Los permisos de Nivel 2 se aplican a los tres módulos administrativos de parroquia:

1. **Actos Litúrgicos** (incluye reportes específicos)
2. **Seguridad** (incluye reportes específicos)
3. **Parroquia** (incluye reportes específicos)

## Estructura de Permisos

### Categorías de Permisos

Todos los permisos están organizados en la tabla `permission` con las siguientes categorías:

#### 1. ACTOS LITÚRGICOS (27 permisos)

**Gestionar actos litúrgicos (5 permisos):**
- `ACTOS_LITURGICOS_ACTOS_C` - Crear acto litúrgico
- `ESTADO_ACTOS_LITURGICOS_U` - Actualizar estado acto litúrgico
- `ACTOS_LITURGICOS_ACTOS_R` - Leer acto litúrgico
- `ACTOS_LITURGICOS_ACTOS_U` - Actualizar acto litúrgico
- `ACTOS_LITURGICOS_ACTOS_D` - Eliminar acto litúrgico

**Gestionar requisitos (5 permisos):**
- `ACTOS_LITURGICOS_REQ_C` - Crear requisitos
- `ESTADO_REQ_ACTOS_LIT_U` - Actualizar estado requisitos
- `ACTOS_LITURGICOS_REQ_R` - Leer requisitos
- `ACTOS_LITURGICOS_REQ_U` - Actualizar requisitos
- `ACTOS_LITURGICOS_REQ_D` - Eliminar requisitos

**Gestionar horarios (11 permisos):**
- `ACTOS_LITURGICOS_HORA_R` - Leer horarios
- `ACTOS_LITURGICOS_HORA_C` - Crear horario
- `ACTOS_LITURGICOS_HORA_U` - Actualizar horario
- `EXCEP_DISP_R` - Leer excepciones de disponibilidad
- `EXCEP_DISP_C` - Crear excepción de disponibilidad
- `EXCEP_DISP_U` - Actualizar excepción de disponibilidad
- `EXCEP_DISP_D` - Eliminar excepción de disponibilidad
- `EXCEP_NO_DISP_R` - Leer excepciones de NO disponibilidad
- `EXCEP_NO_DISP_C` - Crear excepción de NO disponibilidad
- `EXCEP_NO_DISP_U` - Actualizar excepción de NO disponibilidad
- `EXCEP_NO_DISP_D` - Eliminar excepción de NO disponibilidad

**Gestionar reservas (4 permisos):**
- `ACTOS_LITURGICOS_RESER_R` - Leer reservas
- `ACTOS_LITURGICOS_RESER_U` - Actualizar reservas
- `ACTOS_LITURGICOS_RESER_PAY_R` - Leer pagos de reserva
- `ACTOS_LITURGICOS_RESER_PAY_C` - Registrar pago de reserva

**Reportes (2 permisos):**
- `ACTOS_LITURGICOS_REP01` - Ver Reporte 01 (Reservas por capilla)
- `ACTOS_LITURGICOS_REP02` - Ver Reporte 02 (Reservas por rango de fechas)
- `ACTOS_LITURGICOS_REP03` - Ver Reporte 03 (Mapa de ocupación de horarios)

#### 2. SEGURIDAD (12 permisos)

**Gestionar cuentas (5 permisos):**
- `SEGURIDAD_ASOC_USER_C` - Crear asociación usuario
- `ESTADO_ASOC_USER_U` - Actualizar estado asociación usuario
- `SEGURIDAD_ASOC_USER_R` - Leer asociación usuario
- `ROL_ASOC_USER_C` - Crear rol para asociación usuario
- `SEGURIDAD_ASOC_USER_D` - Eliminar asociación usuario

**Gestionar roles (6 permisos):**
- `SEGURIDAD_ROL_C` - Crear rol
- `ESTADO_ROL_U` - Actualizar estado rol
- `SEGURIDAD_ROL_R` - Leer rol
- `SEGURIDAD_ROL_PERMS_U` - Actualizar permisos de rol
- `SEGURIDAD_ROL_DATA_U` - Actualizar datos de rol
- `SEGURIDAD_ROL_D` - Eliminar rol

**Reportes (1 permiso):**
- `SEGURIDAD_REP01` - Ver Reporte 01 (Frecuencia de roles asignados)

#### 3. PARROQUIA (10 permisos)

**Gestionar cuenta de parroquia (4 permisos):**
- `PARROQUIA_INFO_R` - Leer información de la parroquia
- `PARROQUIA_INFO_U` - Actualizar información de la parroquia
- `PARROQUIA_DATOS_CUENTA_R` - Leer datos de cuenta
- `PARROQUIA_DATOS_CUENTA_U` - Actualizar datos de cuenta

**Gestionar capilla (5 permisos):**
- `PARROQUIA_CAPILLA_C` - Crear capilla
- `ESTADO_CAPILLA_U` - Actualizar estado capilla
- `PARROQUIA_CAPILLA_R` - Leer capilla
- `PARROQUIA_CAPILLA_U` - Actualizar capilla
- `PARROQUIA_CAPILLA_D` - Eliminar capilla

**Reportes (1 permiso):**
- `PARROQUIA_REP01` - Ver Reporte 01 (Eventos generales realizados)

## Implementación Técnica

### Base de Datos

**Tablas Principales:**

```sql
-- Definición de permisos del sistema
permission (
  id, category, code, name, description
)

-- Roles personalizados por parroquia
role (
  id, parish_id, name, description, active
)

-- Asignación de permisos a roles
role_permission (
  role_id, permission_id
)

-- Asignación de roles a usuarios
user_role (
  user_id, role_id, parish_id
)
```

**Flujo de Permisos:**
1. Parroquia crea roles personalizados en tabla `role`
2. Administrador asigna permisos al rol en `role_permission`
3. Usuario trabajador es asociado a la parroquia en `association`
4. Se le asigna uno o más roles en `user_role`
5. Usuario selecciona un rol al iniciar sesión
6. Sistema carga permisos del rol seleccionado

### Backend

**Middleware de Permisos:**
```javascript
// Valida que el usuario tenga al menos uno de los permisos especificados
checkPermissions(['ACTOS_LITURGICOS_ACTOS_R', 'ACTOS_LITURGICOS_ACTOS_U'])

// Excepciones automáticas:
// - Párroco (is_parish_admin): bypass completo
// - Usuario diocesano en contexto DIOCESE: bypass completo
```

**Ejemplo de Ruta Protegida:**
```javascript
router.post(
  '/parishes/:parishId/chapels/create',
  authMiddleware,
  checkPermissions(['PARROQUIA_CAPILLA_C']),
  chapelController.createChapel
);
```

**Endpoint de Sesión:**
El endpoint `/api/auth/session` devuelve:
```javascript
{
  is_parish_admin: boolean,  // true si es el párroco
  current_role: { id, name }, // rol seleccionado
  available_roles: [...],     // roles disponibles
  permissions: [              // permisos del rol actual
    'ACTOS_LITURGICOS_ACTOS_R',
    'ACTOS_LITURGICOS_ACTOS_C',
    // ...
  ]
}
```

### Frontend

**Hook usePermissions:**
Proporciona funciones para validar permisos en componentes:

```javascript
const { hasPermission, hasAnyPermission, isParishAdmin } = usePermissions();

// Validar permiso individual
if (hasPermission(PERMISSIONS.ACTOS_LITURGICOS_ACTOS_C)) {
  // Mostrar botón "Crear"
}

// Validar múltiples permisos (OR lógico)
if (hasAnyPermission([
  PERMISSIONS.ACTOS_LITURGICOS_ACTOS_U,
  PERMISSIONS.ACTOS_LITURGICOS_ACTOS_D
])) {
  // Mostrar opciones de edición
}

// Párroco tiene acceso automático
if (isParishAdmin) {
  // Acceso completo
}
```

**Componentes de UI:**

1. **NoPermissionMessage:** Mensaje mostrado cuando no hay permiso de lectura
2. **PermissionGuard:** Componente que oculta elementos según permisos
3. **Clases CSS:** `action-denied` para elementos deshabilitados visualmente

**Ejemplo de Implementación:**

```javascript
// 1. Validar permiso de lectura al inicio
const canRead = hasPermission(PERMISSIONS.ACTOS_LITURGICOS_ACTOS_R);
if (!canRead) {
  return <NoPermissionMessage />;
}

// 2. Condicionar acciones CRUD
const canCreate = hasPermission(PERMISSIONS.ACTOS_LITURGICOS_ACTOS_C);
const canUpdate = hasPermission(PERMISSIONS.ACTOS_LITURGICOS_ACTOS_U);
const canDelete = hasPermission(PERMISSIONS.ACTOS_LITURGICOS_ACTOS_D);

// 3. Renderizado condicional
{canCreate && (
  <MyButtonShortAction 
    type="add" 
    onClick={handleAdd} 
  />
)}

// 4. Validación en handlers
const handleEdit = (item) => {
  if (!canUpdate) {
    alert("No tienes permisos para editar.");
    return;
  }
  // ... lógica de edición
};
```

**Filtrado de Menús:**
Los menús de navegación se filtran según permisos:

```javascript
const allOptions = [
  { 
    href: 'gestionar-actos',
    label: 'Gestionar actos',
    permission: PERMISSIONS.ACTOS_LITURGICOS_ACTOS_R
  },
  // ...
];

// Solo mostrar opciones con permiso
const options = allOptions.filter(opt => 
  !opt.permission || hasPermission(opt.permission)
);
```

## Gestión de Roles

### Interfaz de Gestión (Seguridad → Gestionar Roles)

**Permisos Requeridos:**
- Lectura: `SEGURIDAD_ROL_R`
- Crear rol: `SEGURIDAD_ROL_C`
- Editar datos: `SEGURIDAD_ROL_DATA_U`
- Editar permisos: `SEGURIDAD_ROL_PERMS_U`
- Cambiar estado: `ESTADO_ROL_U`
- Eliminar: `SEGURIDAD_ROL_D`

**Funcionalidades:**
1. Crear roles personalizados para la parroquia
2. Asignar permisos específicos mediante checkboxes agrupados por módulo
3. Activar/desactivar roles
4. Eliminar roles no utilizados

**Estructura de Permisos en UI:**
- Agrupados por módulo (Actos Litúrgicos, Seguridad, Parroquia)
- Sub-agrupados por submódulo (Gestionar actos, Gestionar requisitos, etc.)
- Checkboxes individuales para cada permiso CRUD

### Asignación de Roles a Usuarios

**Interfaz:** Seguridad → Gestionar Cuentas

**Permisos Requeridos:**
- Listar trabajadores: `SEGURIDAD_ASOC_USER_R`
- Asignar rol: `ROL_ASOC_USER_C`

**Funcionalidades:**
1. Ver lista de trabajadores asociados
2. Asignar uno o múltiples roles a cada trabajador
3. Usuario puede cambiar entre sus roles asignados en cualquier momento

**Protección Especial del Párroco:**
- Sistema identifica al párroco mediante `parish.admin_user_id`
- En la lista de trabajadores aparece con etiqueta "Párroco"
- No se puede cambiar su estado ni eliminar su asociación
- No requiere roles asignados (acceso automático completo)

## Validación de Permisos Revocados

### Mecanismo de Force Logout

Cuando un administrador modifica los permisos de un rol o desvincula a un usuario:

**Backend:**
1. Endpoint `/api/auth/session` valida:
   - Si la asociación sigue activa
   - Si el rol seleccionado sigue existiendo y asignado al usuario
2. Si detecta cambios, retorna `force_logout: true` con `logout_reason`

**Frontend:**
1. Hook `useSession` detecta el flag `force_logout`
2. Muestra alerta al usuario con el motivo
3. Ejecuta logout automático
4. Redirige a página de login

**Casos de Revocación:**
- Asociación desactivada o eliminada
- Rol eliminado
- Rol removido del usuario
- Rol desactivado

Esto garantiza que los cambios en permisos se apliquen inmediatamente, sin necesidad de que el usuario cierre sesión manualmente.

## Patrón de Implementación

### En Componentes de Gestión

Todos los componentes administrativos siguen este patrón:

```javascript
export default function GestionarModulo() {
  // 1. Hooks primero (antes de cualquier return)
  const { hasPermission, isParishAdmin } = usePermissions();
  
  // 2. Definir permisos necesarios
  const canRead = hasPermission(PERMISSIONS.MODULO_R);
  const canCreate = hasPermission(PERMISSIONS.MODULO_C);
  const canUpdate = hasPermission(PERMISSIONS.MODULO_U);
  const canDelete = hasPermission(PERMISSIONS.MODULO_D);
  
  // 3. Estados y funciones
  const [data, setData] = useState([]);
  
  // 4. useEffect
  useEffect(() => {
    if (canRead) {
      loadData();
    }
  }, [canRead]);
  
  // 5. Validación de acceso (después de todos los hooks)
  if (!canRead) {
    return <NoPermissionMessage />;
  }
  
  // 6. Handlers con validación
  const handleCreate = () => {
    if (!canCreate) {
      alert("No tienes permisos para crear.");
      return;
    }
    // ... lógica
  };
  
  // 7. Render con elementos condicionales
  return (
    <>
      {canCreate && <ButtonAdd />}
      {canUpdate && <ButtonEdit />}
      {canDelete && <ButtonDelete />}
    </>
  );
}
```

### En Rutas del Backend

```javascript
// Siempre después de authMiddleware
router.post(
  '/ruta',
  authMiddleware,
  checkPermissions(['PERMISO_REQUERIDO']),
  controller.accion
);

// Para operaciones que requieren múltiples permisos
router.put(
  '/ruta/:id',
  authMiddleware,
  checkPermissions(['PERMISO_A', 'PERMISO_B']), // OR lógico
  controller.actualizar
);
```

## Casos Especiales

### Toggle de Estado

El permiso de cambiar estado (activar/desactivar) es independiente de la actualización:

- `ESTADO_ACTOS_LITURGICOS_U` - Para toggle de actos
- `ESTADO_CAPILLA_U` - Para toggle de capillas
- `ESTADO_ROL_U` - Para toggle de roles

Usuario puede tener permiso de editar pero no de cambiar estado, o viceversa.

### Permisos de Lectura

Algunos módulos tienen permisos de lectura separados:

- `ACTOS_LITURGICOS_HORA_R` - Ver horarios (distinto de crear/editar)
- `EXCEP_DISP_R` / `EXCEP_NO_DISP_R` - Ver excepciones
- `ACTOS_LITURGICOS_RESER_PAY_R` - Ver pagos de reserva (separado del registro de pagos)

Esto permite asignar acceso de solo lectura sin permisos de modificación.

### Permisos de Reportes

Los reportes tienen permisos independientes organizados por categoría `REPORTES`:

**Actos Litúrgicos:**
- `ACTOS_LITURGICOS_REP01` - Reporte de reservas por capilla
- `ACTOS_LITURGICOS_REP02` - Reporte de reservas por rango de fechas
- `ACTOS_LITURGICOS_REP03` - Mapa de ocupación de horarios

**Parroquia:**
- `PARROQUIA_REP01` - Reporte de eventos generales realizados

**Seguridad:**
- `SEGURIDAD_REP01` - Reporte de frecuencia de roles asignados

Cada reporte puede ser asignado individualmente, permitiendo control granular sobre qué información puede visualizar cada rol.

### Requisitos Base vs. Adicionales

En gestión de requisitos:
- Los requisitos base (del sistema) solo pueden ser activados/desactivados
- Los requisitos adicionales (de la parroquia) pueden ser creados, editados y eliminados
- Sistema valida automáticamente el campo `is_editable`

## Resumen

El Nivel 2 implementa un sistema de permisos granulares CRUD que:

✅ **Aplica solo a trabajadores de parroquia** con roles asignados  
✅ **No afecta al párroco** que tiene acceso automático completo  
✅ **Permite roles personalizados** por cada parroquia  
✅ **Valida en backend y frontend** para máxima seguridad  
✅ **Revoca permisos en tiempo real** mediante force logout  
✅ **Ofrece control fino** por cada operación CRUD  

Este nivel complementa al **Nivel 1** (contexto de sesión) definiendo exactamente qué acciones puede realizar cada usuario dentro de los módulos a los que tiene acceso.
