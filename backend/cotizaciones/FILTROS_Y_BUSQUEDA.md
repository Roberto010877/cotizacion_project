# Sistema de Búsqueda y Filtros - Cotizaciones

## Mejoras Implementadas

### Backend (Django REST Framework)

#### 1. **Eliminación de Redundancia**
- ❌ **ANTES:** Filtro `search` duplicado en `CotizacionFilter` y `search_fields` en ViewSet
- ✅ **AHORA:** Solo `search_fields` en ViewSet maneja la búsqueda por texto
- **Beneficio:** Código más limpio, sin duplicación de lógica

#### 2. **Nuevos Filtros Agregados**

**`backend/cotizaciones/filters.py`:**
```python
class CotizacionFilter(django_filters.FilterSet):
    # Filtros existentes (mejorados)
    fecha_desde = DateFilter(field_name='fecha_emision', lookup_expr='gte')
    fecha_hasta = DateFilter(field_name='fecha_emision', lookup_expr='lte')
    
    # ✨ NUEVOS FILTROS
    cliente = NumberFilter(field_name='cliente__id')
    vendedor = NumberFilter(field_name='vendedor__id')
    total_min = NumberFilter(field_name='total_general', lookup_expr='gte')
    total_max = NumberFilter(field_name='total_general', lookup_expr='lte')
```

#### 3. **Ordenamiento Dinámico**

**`backend/cotizaciones/views.py`:**
```python
class CotizacionViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    ordering_fields = [
        'created_at',
        'updated_at',
        'fecha_emision',
        'fecha_validez',
        'total_general',
        'numero',
        'estado',
    ]
    ordering = ['-created_at']  # Por defecto
```

---

### Frontend (React + TypeScript)

#### 1. **Tipos Actualizados**

**`frontend/src/pages/Cotizaciones/types/index.ts`:**
```typescript
export interface CotizacionListFilters {
    search: string;
    estado: string;
    fecha_desde: string | undefined;
    fecha_hasta: string | undefined;
    // ✨ NUEVOS FILTROS
    cliente?: number | undefined;
    vendedor?: number | undefined;
    total_min?: number | undefined;
    total_max?: number | undefined;
    ordering?: string | undefined;
}
```

#### 2. **Hook Actualizado**

**`frontend/src/hooks/usePaginatedCotizaciones.ts`:**
- Ahora envía todos los filtros opcionales al backend
- Maneja correctamente el estado 'ALL' (no se envía al backend)
- Documentación completa de filtros soportados

---

## Endpoints Disponibles

### Lista de Cotizaciones
```
GET /api/v1/gestion/cotizaciones/
```

### Parámetros de Consulta

| Parámetro | Tipo | Ejemplo | Descripción |
|-----------|------|---------|-------------|
| `search` | string | `?search=COT-00015` | Busca en numero y cliente__nombre |
| `estado` | string | `?estado=BORRADOR` | Filtra por estado específico |
| `cliente` | number | `?cliente=123` | Filtra por ID de cliente |
| `vendedor` | number | `?vendedor=456` | Filtra por ID de vendedor |
| `fecha_desde` | date | `?fecha_desde=2025-01-01` | Fecha emisión >= valor |
| `fecha_hasta` | date | `?fecha_hasta=2025-12-31` | Fecha emisión <= valor |
| `total_min` | number | `?total_min=1000` | Total general >= valor |
| `total_max` | number | `?total_max=50000` | Total general <= valor |
| `ordering` | string | `?ordering=-total_general` | Ordena por campo (- para DESC) |
| `page` | number | `?page=2` | Número de página |
| `page_size` | number | `?page_size=50` | Elementos por página (máx 100) |

### Ejemplos de Uso

#### 1. Búsqueda Simple
```
GET /api/v1/gestion/cotizaciones/?search=ACME
```

#### 2. Filtrar por Estado y Rango de Fechas
```
GET /api/v1/gestion/cotizaciones/?estado=ENVIADA&fecha_desde=2025-01-01&fecha_hasta=2025-12-31
```

#### 3. Filtrar por Cliente y Ordenar por Total
```
GET /api/v1/gestion/cotizaciones/?cliente=123&ordering=-total_general
```

#### 4. Rango de Totales
```
GET /api/v1/gestion/cotizaciones/?total_min=5000&total_max=50000
```

#### 5. Combinación Completa
```
GET /api/v1/gestion/cotizaciones/
  ?search=ACME
  &estado=ENVIADA
  &fecha_desde=2025-01-01
  &fecha_hasta=2025-12-31
  &cliente=123
  &total_min=5000
  &ordering=-total_general
  &page=1
  &page_size=20
```

---

## Campos de Ordenamiento Disponibles

| Campo | Ascendente | Descendente |
|-------|------------|-------------|
| Fecha creación | `ordering=created_at` | `ordering=-created_at` ⭐ (default) |
| Fecha actualización | `ordering=updated_at` | `ordering=-updated_at` |
| Fecha emisión | `ordering=fecha_emision` | `ordering=-fecha_emision` |
| Fecha validez | `ordering=fecha_validez` | `ordering=-fecha_validez` |
| Total general | `ordering=total_general` | `ordering=-total_general` |
| Número | `ordering=numero` | `ordering=-numero` |
| Estado | `ordering=estado` | `ordering=-estado` |

---

## Performance y Optimización

### Queryset Optimizado
```python
queryset = Cotizacion.objects.filter(is_active=True).select_related(
    'cliente', 'vendedor'
).prefetch_related(
    'ambientes',
    'ambientes__items'
).order_by('-created_at')
```

**Beneficios:**
- ✅ `select_related()` reduce queries para relaciones ForeignKey
- ✅ `prefetch_related()` optimiza relaciones inversas y Many-to-Many
- ✅ Soft delete: solo registros activos (`is_active=True`)
- ✅ Paginación centralizada (20 elementos por página, máx 100)

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│  CotizacionesPage                                          │
│    ├── Search Input (debounce 500ms)                       │
│    ├── CotizacionFilter (dropdown con filtros)             │
│    └── DataTable (resultados paginados)                    │
│                                                             │
│  usePaginatedCotizaciones (React Query)                    │
│    ├── Query Key: [cotizaciones, page, pageSize, filters] │
│    ├── Cache: Mantiene data previa durante carga           │
│    └── Params: Construye URLSearchParams                   │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP GET
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Django REST)                     │
├─────────────────────────────────────────────────────────────┤
│  CotizacionViewSet                                         │
│    ├── SearchFilter: numero, cliente__nombre               │
│    ├── DjangoFilterBackend: CotizacionFilter              │
│    ├── OrderingFilter: 7 campos disponibles                │
│    └── StandardPagination: 20 elementos/página             │
│                                                             │
│  CotizacionFilter (django-filter)                          │
│    ├── estado (exacto)                                      │
│    ├── fecha_desde/hasta (rango)                           │
│    ├── cliente/vendedor (por ID)                           │
│    └── total_min/max (rango)                               │
│                                                             │
│  Queryset Optimizado                                       │
│    ├── select_related(cliente, vendedor)                   │
│    ├── prefetch_related(ambientes, items)                  │
│    └── filter(is_active=True)                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                               │
│  Cotizacion Model                                          │
│    ├── Índice: (estado, -created_at)                       │
│    └── Soft Delete: is_active=True                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Resumen de Mejoras

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Búsqueda** | Duplicada en Filter y ViewSet | Solo en ViewSet (SearchFilter) |
| **Filtros** | 3 filtros (estado, fechas) | 7 filtros (+ cliente, vendedor, totales) |
| **Ordenamiento** | Solo por created_at | 7 campos ordenables |
| **Código** | ~60 líneas en filters.py | ~60 líneas (más funcionalidad) |
| **Documentación** | Comentarios básicos | Docstrings completos + ejemplos |
| **Frontend** | Tipos básicos | Tipos extendidos con opcionales |

---

## Próximos Pasos (Opcional)

### Mejoras Futuras Sugeridas:

1. **Agregar filtros al componente UI**
   - Dropdown para seleccionar cliente
   - Dropdown para seleccionar vendedor
   - Range slider para totales

2. **Exportación de datos**
   - CSV/Excel con filtros aplicados
   - PDF de listado

3. **Búsqueda avanzada**
   - Búsqueda por número de pedido relacionado
   - Búsqueda por productos/servicios incluidos

4. **Estadísticas**
   - Dashboard con totales por estado
   - Gráficos de cotizaciones en el tiempo

---

**Fecha de implementación:** 9 de diciembre de 2025
**Versión:** Backend v1.1 | Frontend v1.1
