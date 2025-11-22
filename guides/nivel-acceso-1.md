# Sistema de Control de Acceso - Nivel 1: Contexto de Sesión

## Descripción General

El sistema implementa un control de acceso en dos niveles. El **Nivel 1** controla qué módulos de la aplicación puede ver y acceder un usuario basándose en su **contexto de sesión**. Este nivel determina la estructura general de navegación disponible para cada tipo de usuario.

## Contextos de Sesión

El sistema reconoce tres contextos principales que definen el alcance de acceso del usuario:

### 1. DIOCESE (Administrador Diocesano)

**Descripción del Negocio:**
- Usuario administrador de toda la diócesis
- Gestiona las parroquias que pertenecen a la diócesis
- No está limitado a una parroquia específica

**Módulos Disponibles:**
- **Diócesis**: Gestión de parroquias y administración diocesana únicamente

**Características:**
- `is_diocese_user = true` en la tabla `user`
- No requiere asociación a una parroquia específica
- Solo puede acceder al módulo de Diócesis cuando selecciona contexto DIOCESE
- Si necesita acceder a módulos de una parroquia específica, debe cambiar su contexto a PARISH (en caso el usuario se trabajador de alguna parroquia)

### 2. PARISH (Trabajador de Parroquia)

**Descripción del Negocio:**
- Usuario asociado a una parroquia específica
- Puede ser el párroco (administrador de la parroquia) o un trabajador con roles asignados
- Su acceso está limitado a la parroquia a la que pertenece

**Tipos de Usuarios PARISH:**

#### a) Párroco (Administrador de Parroquia)
- Usuario definido como `admin_user_id` en la tabla `parish`
- Tiene acceso completo a todos los módulos y permisos de su parroquia
- No requiere roles específicos - sus permisos son automáticos

#### b) Trabajador con Roles
- Usuario con asociación activa en la tabla `association`
- Debe seleccionar un rol activo de los asignados en la tabla `user_role`
- Sus permisos dependen del rol seleccionado (ver Nivel 2)

**Módulos Disponibles:**
- **Actos Litúrgicos**: Gestión de actos, requisitos, horarios y reservas
- **Seguridad**: Gestión de cuentas de usuarios y roles
- **Parroquia**: Gestión de capillas y datos de la parroquia

**Flujo de Acceso:**
1. Usuario selecciona contexto PARISH y la parroquia
2. Sistema determina si es párroco o trabajador
3. Si es párroco: acceso completo automático
4. Si es trabajador: debe seleccionar un rol → se aplica Nivel 2 de permisos

### 3. PARISHIONER (Feligrés)

**Descripción del Negocio:**
- Usuario registrado sin asociación a ninguna parroquia como trabajador
- Puede ser miembro de la comunidad pero sin responsabilidades administrativas
- Acceso limitado a funcionalidades públicas

**Módulos Disponibles:**
- **Reservas de Usuario**: Gestión de sus propias reservas para actos litúrgicos
- Visualización de información pública de las parroquias

**Características:**
- No tiene asociación activa en la tabla `association`
- Permisos limitados definidos en la categoría 'PARISHIONER' de la tabla `permission`

## Implementación Técnica

### Backend

**Selección de Contexto:**
```javascript
POST /api/auth/select-context
Body: { 
  context_type: 'DIOCESE' | 'PARISH' | 'PARISHIONER',
  parishId: number (requerido solo para PARISH)
}
```

**Token JWT:**
El token de sesión contiene:
- `userId`: ID del usuario
- `context_type`: Tipo de contexto seleccionado
- `parishId`: ID de la parroquia (si aplica)
- `roleId`: ID del rol seleccionado (si aplica)
- `permissions`: Array de códigos de permisos activos

**Endpoint de Sesión:**
```javascript
GET /api/auth/session
Returns: {
  context_type: string,
  person: { full_name, profile_photo },
  is_diocese_user: boolean,
  is_parish_admin: boolean,
  parish: { id, name } | null,
  available_roles: [{ id, name }] | null,
  current_role: { id, name } | null,
  permissions: string[]
}
```

### Frontend

**Hook useSession:**
Proporciona acceso al contexto de sesión en toda la aplicación:
```javascript
const { sessionData } = useSession();
// sessionData.context_type
// sessionData.is_diocese_user
// sessionData.is_parish_admin
// sessionData.parish
// sessionData.current_role
// sessionData.permissions
```

**Visualización de Módulos:**
El componente `Home.jsx` muestra módulos según el contexto:
- `context_type === 'DIOCESE'` → Módulo Diócesis
- `context_type === 'PARISHIONER'` → Módulo Reservas de Usuario
- `context_type === 'PARISH'` → Módulos Actos Litúrgicos, Seguridad, Parroquia

**Navegación Protegida:**
El componente `ProtectedRoute.jsx` valida que el usuario tenga el contexto correcto para acceder a una ruta:
```javascript
// Solo usuarios PARISH pueden acceder a /actos-liturgicos/*
<ProtectedRoute requiredContext="PARISH">
  <ActosLiturgicos />
</ProtectedRoute>
```

## Flujo Completo de Autenticación y Contexto

1. **Login:** Usuario ingresa credenciales → Recibe lista de parroquias asociadas
2. **Selección de Contexto:**
   - Usuario elige trabajar como: Diocesano, Parroquial o Feligrés
   - Si elige PARISH, selecciona la parroquia
3. **Determinación de Permisos:**
   - DIOCESE: Permisos completos
   - PARISHIONER: Permisos de categoría 'PARISHIONER'
   - PARISH:
     - Si es párroco: Permisos completos
     - Si es trabajador: Selecciona rol → Se aplican permisos del rol (Nivel 2)
4. **Navegación:** Dashboard muestra módulos según contexto
5. **Acceso a Funcionalidades:** Rutas protegidas validan contexto

## Base de Datos

**Tablas Relevantes:**
- `user`: Columna `is_diocese` determina si es administrador diocesano
- `parish`: Columna `admin_user_id` define al párroco
- `association`: Vincula usuarios con parroquias
- `role`: Roles disponibles por parroquia
- `user_role`: Asignación de roles a usuarios

## Resumen

El Nivel 1 de acceso es **contextual** y define **QUÉ puede ver** el usuario:
- **Administradores Diocesanos** (contexto DIOCESE) ven solo el módulo de Diócesis
- **Trabajadores de Parroquia** (contexto PARISH) ven módulos administrativos de su parroquia según su rol (excepto si es el párroco que tiene acceso a todo de su parroquia)
- **Feligreses** (contexto PARISHIONER) ven solo funcionalidades personales (busca paroquias y las capillas de estas, hace reservas, hace pago a sus reservas, consultas sus reservas y el proceso de estas)

**Nota importante:** Un usuario diocesano puede tener múltiples contextos. Si tiene asociación a una parroquia, puede cambiar su contexto de DIOCESE a PARISH para acceder a los módulos parroquiales de esa parroquia específica.

Este nivel trabaja en conjunto con el **Nivel 2** (permisos basados en roles) que define **QUÉ puede hacer** dentro de los módulos visibles.
