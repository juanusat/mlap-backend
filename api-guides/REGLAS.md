# Ejemplo de rutas para "tipo_documentos"

- Obtener información de un item: `/doc/14 (GET)`
- Actualizar un item: `/doc/14 (PUT)`
- Actualizar parcialmente un item (incluye eliminación lógica): `/doc/14 (PATCH)`
- Eliminar físicamente un item: `/doc/14 (DELETE)`
- Crear un nuevo item: `/doc/create (POST)`
- Listar un corte de elementos para una página: `/doc/list (POST)`
- Listar un corte de elementos para una página pero basado en búsqueda: `/doc/search (POST)`


## Anotación para rutas de búsqueda
- Busca por nombre "si es lo principal" (depende de la tabla), requiere especificar página y tamaño de consulta


# Respuesta de cualquier tipo de petición

```json
{
  "message": "Lo que el backend indica al fronted que debe mostrar",
  "data": {}, // La información, puede ser un arreglo
  "error": "Sin permisos suficientes", // Es vacío si no hay ningún error
  "traceback": "string" // Todo el error generado en el backend si la respuesta es código 500}
```

# Jerarquía de entidades reflejadas en el endpoint

**Tabla superior**
- `/api/diocese/events/create`
- `/api/diocese/events/list`
- `/api/diocese/events/search`
- `/api/diocese/events/14 (GET, Put, PATCH, DEL)`

**Tabla anidada**
- `/api/diocese/events/{id}/requirements/create`
- `/api/diocese/events/{id}/requirements/list`
- `/api/diocese/events/{id}/requirements/search`
- `/api/diocese/events/{id}/requirements/{id} (GET, Put, PATCH, DEL)`