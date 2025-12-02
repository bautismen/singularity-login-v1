# Implementación de Catálogos

## Estado Actual

✅ **Completado:**
- Edge function `catalog-imo` desplegada en Supabase (conecta a MongoDB)
- Colección `Cat001Imo` en MongoDB con datos iniciales
- Menú lateral actualizado con categoría "Catálogos" y todos los submenús
- CSS compartido (Catalogs.module.css) para todos los módulos
- Traducciones en español e inglés completadas
- Tipos TypeScript definidos (src/types/catalog.ts)
- Módulo IMO completamente funcional con CRUD conectado a MongoDB

## ⚠️ IMPORTANTE: Este proyecto usa MongoDB

**NO se usa PostgreSQL ni Supabase Database.** Todas las colecciones están en MongoDB Atlas:
- **Conexión:** `mongodb+srv://fox1:modelotx30@arcobitscluster0.w6meunj.mongodb.net/`
- **Base de datos:** `singulatiry_sandbox`
- **Colección IMO:** `Cat001Imo`

Los datos se acceden a través de Edge Functions que actúan como API intermediaria.

## Catálogos Pendientes

Para completar los demás catálogos, simplemente copia el archivo `CatalogIMO.tsx` y modifica según el patrón:

### 1. Catálogo de Incoterms

**Archivo:** `src/pages/CatalogIncoterms.tsx`

**Cambios necesarios:**
- Cambiar `ImoClass` por `Incoterm`
- Cambiar el título: `t('nav.catalogs.incoterms')`
- Cambiar textos de botones: `.replace('{name}', 'Incoterm')`
- Campos del formulario:
  - `incoterm` (código)
  - `status` (checkbox activo)
- Columnas de tabla:
  - Incoterm
  - Estado
  - Acciones

**Ruta en App.tsx:**
```typescript
case 'catalogs/incoterms':
  return <CatalogIncoterms />;
```

---

### 2. Catálogo de Servicios

**Archivo:** `src/pages/CatalogServices.tsx`

**Cambios necesarios:**
- Cambiar `ImoClass` por `Service`
- Cambiar el título: `t('nav.catalogs.services')`
- Cambiar textos de botones: `.replace('{name}', 'Servicio')`
- Campos del formulario:
  - `service_name` (nombre del servicio)
  - `category` (select: 1=Principal, 2=Accesorio)
  - `email_service_name` (opcional)
  - `status` (checkbox activo)
- Columnas de tabla:
  - Nombre del Servicio
  - Categoría (Principal/Accesorio)
  - Email
  - Estado
  - Acciones

**Ruta en App.tsx:**
```typescript
case 'catalogs/services':
  return <CatalogServices />;
```

---

### 3. Catálogo de Tipos de Solicitud

**Archivo:** `src/pages/CatalogRequestTypes.tsx`

**Cambios necesarios:**
- Cambiar `ImoClass` por `RequestType`
- Cambiar el título: `t('nav.catalogs.requestTypes')`
- Cambiar textos de botones: `.replace('{name}', 'Tipo de Solicitud')`
- Campos del formulario:
  - `request_type_name` (nombre del tipo)
  - `status` (checkbox activo)
- Columnas de tabla:
  - Tipo de Solicitud
  - Estado
  - Acciones

**Ruta en App.tsx:**
```typescript
case 'catalogs/request-types':
  return <CatalogRequestTypes />;
```

---

### 4. Catálogo de Estatus

**Archivo:** `src/pages/CatalogStatus.tsx`

**Cambios necesarios:**
- Cambiar `ImoClass` por `Status`
- Cambiar el título: `t('nav.catalogs.status')`
- Cambiar textos de botones: `.replace('{name}', 'Estatus')`
- Campos del formulario:
  - `category` (categoría)
  - `subcategory` (subcategoría)
  - `code` (código opcional)
  - `status_name` (nombre del estatus)
  - `description` (descripción opcional)
  - `status` (checkbox activo)
- Columnas de tabla:
  - Categoría
  - Subcategoría
  - Código
  - Nombre
  - Descripción
  - Estado
  - Acciones

**Ruta en App.tsx:**
```typescript
case 'catalogs/status':
  return <CatalogStatus />;
```

---

## Integración con MongoDB

El módulo IMO ya está completamente integrado con MongoDB. Para crear los demás catálogos:

### 1. Crear Edge Function

Copiar `supabase/functions/catalog-imo/index.ts` y modificar:
- Nombre de la colección: `Cat001Imo` → `Cat001Incoterms`, `Cat001Services`, etc.
- Campos del documento según la colección
- Nombre del endpoint en las rutas

### 2. Desplegar Edge Function

```bash
# La edge function se despliega automáticamente desde el código
# No necesitas usar el CLI de Supabase
```

### 3. Actualizar el Frontend

El componente CatalogIMO ya muestra el patrón correcto:

```typescript
const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/catalog-imo`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// GET - Cargar datos
const response = await fetch(API_URL, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// POST - Crear nuevo
const response = await fetch(API_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData),
});

// PUT - Actualizar
const response = await fetch(`${API_URL}/${id}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData),
});

// DELETE - Eliminar (soft delete)
const response = await fetch(`${API_URL}/${id}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});
```

---

## Estructura de Documentos MongoDB

Todas las colecciones siguen el mismo patrón:

```json
{
  "_id": 1,
  "imo": "1.1",
  "description": "Objetos con riesgo de explosión...",
  "status": 1,
  "archived": false,
  "data_state": 1
}
```

**Campos comunes:**
- `_id`: Number (auto-incrementado en la edge function)
- `status`: Number (1 = Activo, 0 = Inactivo)
- `archived`: Boolean (false = visible, true = eliminado)
- `data_state`: Number (siempre 1, para control de versiones)

---

## Funcionalidades Implementadas

✅ CRUD completo (Create, Read, Update, Delete)
✅ Búsqueda en tiempo real
✅ Filtros (Todos, Activos, Inactivos)
✅ Soft delete (campo `archived`)
✅ Modal para agregar/editar
✅ Confirmación antes de eliminar
✅ Responsive design
✅ Dark mode
✅ Traducciones (Español/Inglés)
✅ Estados visuales (badges de activo/inactivo)
✅ Iconos consistentes
✅ Manejo de estados vacíos

---

## Estilo Visual

El diseño sigue el mismo patrón que el módulo de Ejecutivos:
- Colores: Turquesa (#14b8a6) como color primario
- Tipografía: Sans-serif system fonts
- Bordes: Redondeados (0.5rem)
- Sombras: Sutiles
- Transiciones: Suaves (0.15s)
- Espaciado: Consistente (1rem base)

---

## Notas Importantes

1. **IDs:** Todas las tablas usan `bigserial` para auto-incremento
2. **Soft Delete:** Usar `archived = true` en lugar de DELETE físico
3. **Status:** 1 = Activo, 0 = Inactivo
4. **Data State:** Campo para control de versiones (siempre 1)
5. **Timestamps:** Se actualizan automáticamente
6. **Unique Constraints:** IMO y Incoterms tienen constraint UNIQUE
7. **Email Opcional:** Solo en Services (email_service_name)
8. **Categorías:** Services usa campo `category` (1=Principal, 2=Accesorio)
9. **Status tiene múltiples campos:** category, subcategory, code, status_name, description

---

## Testing

Para probar cada catálogo:
1. Navegar al catálogo desde el menú
2. Verificar que la tabla cargue correctamente
3. Probar agregar un nuevo registro
4. Probar editar un registro existente
5. Probar eliminar un registro
6. Probar búsqueda
7. Probar filtros (Todos, Activos, Inactivos)
8. Verificar responsive en móvil
9. Verificar dark mode
10. Verificar traducciones (cambiar idioma)

---

## Próximos Pasos

1. Crear `CatalogIncoterms.tsx` copiando el patrón de CatalogIMO
2. Crear `CatalogServices.tsx` con los campos adicionales
3. Crear `CatalogRequestTypes.tsx` siguiendo el patrón
4. Crear `CatalogStatus.tsx` con todos los campos
5. Importar todos los componentes en App.tsx
6. Agregar todas las rutas al switch de App.tsx
7. Reemplazar datos mock con llamadas a Supabase
8. Probar cada módulo exhaustivamente

---

## Resumen

**Total de archivos creados:**
- ✅ 1 archivo de tipos (catalog.ts)
- ✅ 1 archivo CSS compartido (Catalogs.module.css)
- ✅ 1 página funcional (CatalogIMO.tsx)
- ⏳ 4 páginas pendientes (Incoterms, Services, RequestTypes, Status)

**Total de tablas creadas:** ✅ 5 tablas con datos iniciales

**Total de traducciones:** ✅ Español e Inglés completos

**Menú lateral:** ✅ Categoría Catálogos con 5 submenús

El patrón está establecido y los demás catálogos solo requieren copiar y adaptar el archivo CatalogIMO.tsx según los campos específicos de cada tabla.
