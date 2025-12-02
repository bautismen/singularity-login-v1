# Implementación de Catálogos

## Estado Actual

✅ **Completado:**
- Base de datos creada con todas las tablas (cat001_imo, cat001_incoterms, cat001_services, cat018_request_types, cat018_status)
- Datos iniciales insertados en todas las tablas
- Menú lateral actualizado con categoría "Catálogos" y todos los submenús
- CSS compartido (Catalogs.module.css) para todos los módulos
- Traducciones en español e inglés completadas
- Tipos TypeScript definidos (src/types/catalog.ts)
- Módulo IMO completamente funcional como ejemplo

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

## Integración con Supabase

Actualmente los catálogos usan datos mock. Para conectar con Supabase, reemplaza las funciones:

### loadData()
```typescript
const loadData = async () => {
  const { data, error } = await supabase
    .from('cat001_imo') // Cambiar por la tabla correspondiente
    .select('*')
    .eq('archived', false)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error loading data:', error);
    return;
  }

  setItems(data || []);
};
```

### handleSave()
```typescript
const handleSave = async () => {
  if (editingItem) {
    // Actualizar
    const { error } = await supabase
      .from('cat001_imo')
      .update(formData)
      .eq('id', editingItem.id);

    if (error) {
      console.error('Error updating:', error);
      return;
    }
  } else {
    // Insertar
    const { error } = await supabase
      .from('cat001_imo')
      .insert([formData]);

    if (error) {
      console.error('Error inserting:', error);
      return;
    }
  }

  await loadData();
  closeModal();
};
```

### handleDelete()
```typescript
const handleDelete = async (id: number) => {
  if (confirm(t('catalog.confirmDelete'))) {
    // Soft delete
    const { error } = await supabase
      .from('cat001_imo')
      .update({ archived: true })
      .eq('id', id);

    if (error) {
      console.error('Error deleting:', error);
      return;
    }

    await loadData();
  }
};
```

---

## Estructura de Base de Datos

Todas las tablas siguen el mismo patrón:

```sql
CREATE TABLE nombre_tabla (
  id bigserial PRIMARY KEY,
  -- campos específicos de la tabla
  status smallint DEFAULT 1,
  archived boolean DEFAULT false,
  data_state smallint DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Políticas RLS:**
- Todos los usuarios autenticados pueden leer (SELECT)
- Todos los usuarios autenticados pueden insertar (INSERT)
- Todos los usuarios autenticados pueden actualizar (UPDATE)
- Todos los usuarios autenticados pueden eliminar (DELETE)

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
