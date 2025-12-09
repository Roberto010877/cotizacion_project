# Sistema de Búsqueda y Filtros - Pedidos de Servicio

## Mejoras Implementadas

### Backend (Django REST Framework)

#### 1. **Nuevo Archivo filters.py**
Creado `backend/pedidos_servicio/filters.py` con filtros avanzados:

```python
class PedidoServicioFilter(django_filters.FilterSet):
    # Filtros de rango de fecha
    fecha_desde = DateFilter(field_name='fecha_inicio', lookup_expr='gte')
    fecha_hasta = DateFilter(field_name='fecha_inicio', lookup_expr='lte')
    
    # Filtros por relaciones
    cliente = NumberFilter(field_name='cliente__id')
    manufacturador = NumberFilter(field_name='manufacturador__id')
    instalador = NumberFilter(field_name='instalador__id')
```

#### 2. **ViewSet Mejorado**

**`backend/pedidos_servicio/views.py`:**
```python
class PedidoServicioViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = PedidoServicioFilter  # ✅ Filtros avanzados
    
    search_fields = ['numero_pedido', 'cliente__nombre', 'solicitante']
    
    ordering_fields = [
        'created_at',
        'updated_at',
        'fecha_inicio',
        'fecha_fin',
        'numero_pedido',
        'estado',
    ]
    ordering = ['-created_at']  # Por defecto
```

---

### Frontend (React + TypeScript)

#### 1. **Tipos Creados**

**`frontend/src/pages/PedidosServicio/types/index.ts`:**
```typescript
export interface PedidoServicioListFilters {
    search: string;
    estado: string;
    fecha_desde: string | undefined;
    fecha_hasta: string | undefined;
    cliente?: number | undefined;
    manufacturador?: number | undefined;
    instalador?: number | undefined;
    ordering?: string | undefined;
}
```

#### 2. **Hook Refactorizado**

**`frontend/src/hooks/usePaginatedPedidosServicio.ts`:**
- ❌ **ANTES:** `searchFilters?: Record<string, any>` + `createStableKey()`
- ✅ **AHORA:** `filters: PedidoServicioListFilters` (tipado fuerte)
- Eliminada función `createStableKey` innecesaria
- Documentación completa de filtros soportados

#### 3. **Componente de Filtros**

**`frontend/src/pages/PedidosServicio/components/PedidoServicioFilter.tsx`:**
- Dropdown con icono `SlidersHorizontal`
- Select para estado (todos los estados de pedido)
- Inputs de fecha (desde/hasta)
- Botones: Aplicar / Limpiar
- Indicador visual de filtros activos

#### 4. **Página Principal Actualizada**

**`frontend/src/pages/PedidosServicio/index.tsx`:**
```typescript
// ✅ Estado de filtros completo
const [filters, setFilters] = useState<PedidoServicioListFilters>({
    search: '',
    estado: '',
    fecha_desde: undefined,
    fecha_hasta: undefined,
});

// ✅ Búsqueda con debounce (500ms)
useEffect(() => {
    const timer = setTimeout(() => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
    }, 500);
    return () => clearTimeout(timer);
}, [searchTerm]);

// ✅ Llamada al hook con tipos
const { data, isLoading, refetch } = usePaginatedPedidosServicio({
    page: pagination.currentPage,
    pageSize: pagination.pageSize,
    filters: filters,
});
```

---

## Endpoints Disponibles

### Lista de Pedidos de Servicio
```
GET /api/v1/pedidos-servicio/
```

### Parámetros de Consulta

| Parámetro | Tipo | Ejemplo | Descripción |
|-----------|------|---------|-------------|
| `search` | string | `?search=PED-00015` | Busca en numero_pedido, cliente__nombre y solicitante |
| `estado` | string | `?estado=EN_FABRICACION` | Filtra por estado específico |
| `cliente` | number | `?cliente=123` | Filtra por ID de cliente |
| `manufacturador` | number | `?manufacturador=456` | Filtra por ID de manufacturador |
| `instalador` | number | `?instalador=789` | Filtra por ID de instalador |
| `fecha_desde` | date | `?fecha_desde=2025-01-01` | Fecha inicio >= valor |
| `fecha_hasta` | date | `?fecha_hasta=2025-12-31` | Fecha inicio <= valor |
| `ordering` | string | `?ordering=-created_at` | Ordena por campo (- para DESC) |
| `page` | number | `?page=2` | Número de página |
| `page_size` | number | `?page_size=50` | Elementos por página (máx 100) |

### Ejemplos de Uso

#### 1. Búsqueda Simple
```
GET /api/v1/pedidos-servicio/?search=Cortinas
```

#### 2. Filtrar por Estado
```
GET /api/v1/pedidos-servicio/?estado=EN_FABRICACION
```

#### 3. Filtrar por Cliente y Rango de Fechas
```
GET /api/v1/pedidos-servicio/?cliente=123&fecha_desde=2025-01-01&fecha_hasta=2025-12-31
```

#### 4. Filtrar por Manufacturador y Ordenar
```
GET /api/v1/pedidos-servicio/?manufacturador=456&ordering=-fecha_inicio
```

#### 5. Combinación Completa
```
GET /api/v1/pedidos-servicio/
  ?search=Cortinas
  &estado=EN_FABRICACION
  &fecha_desde=2025-01-01
  &fecha_hasta=2025-12-31
  &manufacturador=456
  &ordering=-created_at
  &page=1
  &page_size=25
```

---

## Campos de Ordenamiento Disponibles

| Campo | Ascendente | Descendente |
|-------|------------|-------------|
| Fecha creación | `ordering=created_at` | `ordering=-created_at` ⭐ (default) |
| Fecha actualización | `ordering=updated_at` | `ordering=-updated_at` |
| Fecha inicio | `ordering=fecha_inicio` | `ordering=-fecha_inicio` |
| Fecha fin | `ordering=fecha_fin` | `ordering=-fecha_fin` |
| Número pedido | `ordering=numero_pedido` | `ordering=-numero_pedido` |
| Estado | `ordering=estado` | `ordering=-estado` |

---

## Estados de Pedido

| Estado | Código | Descripción |
|--------|--------|-------------|
| Enviado | `ENVIADO` | Pedido recién creado |
| Aceptado | `ACEPTADO` | Pedido aceptado por el sistema |
| En Fabricación | `EN_FABRICACION` | Pedido siendo fabricado |
| Listo para Instalar | `LISTO_INSTALAR` | Fabricación completada |
| Instalado | `INSTALADO` | Instalación completada |
| Completado | `COMPLETADO` | Pedido finalizado |
| Rechazado | `RECHAZADO` | Pedido rechazado |
| Cancelado | `CANCELADO` | Pedido cancelado |

---

## Performance y Optimización

### Queryset Optimizado
```python
queryset = PedidoServicio.objects.select_related(
    'cliente', 'manufacturador', 'instalador'
).prefetch_related('items')
```

**Beneficios:**
- ✅ `select_related()` reduce queries para relaciones ForeignKey
- ✅ `prefetch_related()` optimiza relaciones inversas
- ✅ Filtrado por grupos/usuarios mantenido intacto
- ✅ Paginación centralizada (20 elementos por página, máx 100)

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│  PedidosServicioPage                                       │
│    ├── Search Input (debounce 500ms)                       │
│    ├── PedidoServicioFilter (dropdown con filtros)        │
│    ├── Cards de Estadísticas (filtro por estado)          │
│    └── DataTable (resultados paginados)                    │
│                                                             │
│  usePaginatedPedidosServicio (React Query)                 │
│    ├── Query Key: [pedidos-servicio, page, pageSize, filters] │
│    ├── Cache: Mantiene data previa durante carga           │
│    └── Params: Construye URLSearchParams                   │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP GET
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Django REST)                     │
├─────────────────────────────────────────────────────────────┤
│  PedidoServicioViewSet                                     │
│    ├── SearchFilter: numero_pedido, cliente__nombre, solicitante │
│    ├── DjangoFilterBackend: PedidoServicioFilter          │
│    ├── OrderingFilter: 6 campos disponibles                │
│    ├── get_queryset(): Filtrado por grupos/permisos       │
│    └── StandardPagination: 20 elementos/página             │
│                                                             │
│  PedidoServicioFilter (django-filter)                      │
│    ├── estado (exacto)                                      │
│    ├── fecha_desde/hasta (rango fecha_inicio)             │
│    ├── cliente/manufacturador/instalador (por ID)         │
│    └── Búsqueda manejada por SearchFilter                 │
│                                                             │
│  Queryset Optimizado                                       │
│    ├── select_related(cliente, manufacturador, instalador)│
│    ├── prefetch_related(items)                            │
│    └── Filtrado por grupos de usuario (mantenido)         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                               │
│  PedidoServicio Model                                      │
│    ├── Índices: (estado, -created_at), (cliente, estado)  │
│    ├── Índices: (manufacturador, estado), (instalador, estado) │
│    └── Permisos personalizados para cambios de estado     │
└─────────────────────────────────────────────────────────────┘
```

---

## Comparativa: Antes vs Después

| Aspecto | ANTES | DESPUÉS |
|---------|-------|---------|
| **Backend Filtros** | 4 filtros básicos (`filterset_fields`) | 6 filtros avanzados + rangos |
| **Ordenamiento** | 3 campos | 6 campos |
| **Búsqueda texto** | ✅ Mantenida | ✅ Mantenida |
| **Frontend Tipos** | `Record<string, any>` | Interfaces tipadas |
| **UI Filtros** | ❌ Solo cards de estado | ✅ Dropdown completo + búsqueda |
| **Búsqueda UI** | ❌ No existía | ✅ Con debounce 500ms |
| **Documentación** | ❌ Mínima | ✅ Completa |
| **Código Hook** | `createStableKey()` complejo | Directo y limpio |

---

## Beneficios Logrados

1. **Consistencia:** Mismo sistema que Cotizaciones
2. **Tipos seguros:** TypeScript evita errores en runtime
3. **Mejor UX:** Búsqueda instantánea, filtros visuales
4. **Mantenibilidad:** Código limpio y documentado
5. **Performance:** Queries optimizadas con filtros específicos
6. **Compatibilidad:** Filtrado por grupos/permisos intacto

---

## Consideraciones Importantes

### ✅ Mantenido del Sistema Original
- **Permisos:** Sistema de permisos `get_queryset()` NO modificado
- **Estadísticas:** Hook `usePedidosEstadisticas` NO modificado
- **Grupos:** Filtrado por Comercial/Manufacturador/Instalador intacto
- **Cards de Estado:** Funcionan como filtros rápidos

### ⚠️ Compatibilidad
- Todos los filtros son **opcionales**
- El código existente sigue funcionando
- Las estadísticas por estado se mantienen independientes

---

**Fecha de implementación:** 9 de diciembre de 2025  
**Versión:** Backend v1.1 | Frontend v1.1  
**Basado en:** Sistema de Cotizaciones optimizado
