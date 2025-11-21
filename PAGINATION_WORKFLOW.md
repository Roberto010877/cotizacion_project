# 📋 Workflow: Implementar Paginación Híbrida en Todas las Páginas

**Estado del Proyecto:** Sistema híbrido base completado  
**Objetivo:** Expandir paginación a todas las páginas listables  
**Tiempo Estimado:** 45-60 minutos total (10-15 min por página)

---

## 📊 Tabla de Contenidos

1. [Resumen del Sistema Híbrido](#resumen-del-sistema-híbrido)
2. [Checklist de Validación](#checklist-de-validación)
3. [Cotizaciones](#-cotizaciones)
4. [Proveedores](#-proveedores)
5. [Órdenes de Compra](#-órdenes-de-compra)
6. [Productos](#-productos)
7. [Verificación Final](#verificación-final)

---

## 🎯 Resumen del Sistema Híbrido

### Componentes Existentes
```
✅ Pagination.tsx          → Desktop paginación numérica
✅ InfiniteScroll.tsx      → Mobile infinite scroll
✅ usePagination.ts        → Estado genérico
✅ useMediaQuery.ts        → Detección responsive
✅ components/common/index.ts → Exports centralizados
✅ hooks/index.ts          → Exports centralizados
```

### Patrón Base (Ya Implementado en Clientes)
```tsx
// 1. Importar necesario
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/common/Pagination';
import InfiniteScroll from '@/components/common/InfiniteScroll';

// 2. Usar en página
const isMobile = useMediaQuery('(max-width: 768px)');
const pagination = usePagination();
const { data, isLoading } = usePaginatedXXX({
  page: pagination.currentPage,
  pageSize: pagination.pageSize,
});

// 3. Actualizar total de registros
useEffect(() => {
  if (data?.count) pagination.setTotalCount(data.count);
}, [data?.count, pagination]);

// 4. Renderizar híbrido
{isMobile ? (
  <InfiniteScroll 
    onLoadMore={pagination.loadMore}
    hasMore={pagination.hasNextPage}
    isLoading={isLoading}
  >
    {/* Tabla condensada */}
  </InfiniteScroll>
) : (
  <>
    {/* Tabla completa */}
    <Pagination {...pagination} />
  </>
)}
```

---

## ✅ Checklist de Validación

Antes de empezar cada implementación:

- [ ] Hook `usePaginatedXXX` existe
- [ ] Endpoint API retorna `count` en response
- [ ] Componente página es funcional
- [ ] `Pagination` y `InfiniteScroll` están importables
- [ ] TypeScript build compila sin errores

---

---

# 🛒 COTIZACIONES

## Fase 1: Verificar Estructura

### 1.1 Verificar Hook Existente
```bash
# Verificar si existe useCotizaciones o similar
grep -r "useCotizaciones" frontend/src/hooks/
grep -r "cotizaciones" frontend/src/hooks/ | grep "use"
```

**Esperado:**
- Hook que retorna datos paginados O
- Hook que necesita ser mejorado para soportar paginación

### 1.2 Verificar Endpoint API
```bash
# Verificar respuesta del backend
curl http://localhost:8000/api/v1/cotizaciones/?page=1&page_size=25
```

**Esperado:**
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/v1/cotizaciones/?page=2&page_size=25",
  "previous": null,
  "results": [...]
}
```

---

## Fase 2: Crear Hook de Paginación

### 2.1 Crear `usePaginatedCotizaciones.ts`

**Ubicación:** `frontend/src/hooks/usePaginatedCotizaciones.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type { PaginatedResponse } from './useClientes';

interface Cotizacion {
  id: number;
  numero: string;
  cliente: number;
  total: number;
  estado: string;
  fecha_creacion: string;
  // ... otros campos
}

interface UsePaginatedCotizacionesOptions {
  page?: number;
  pageSize?: number;
  searchFilters?: Record<string, any>;
}

export const usePaginatedCotizaciones = (
  options: UsePaginatedCotizacionesOptions = {}
) => {
  const { page = 1, pageSize = 25, searchFilters = {} } = options;

  const query = useQuery<PaginatedResponse<Cotizacion>, Error>({
    queryKey: ['cotizaciones', { page, pageSize, ...searchFilters }],
    queryFn: async () => {
      const params = {
        page,
        page_size: pageSize,
        ...searchFilters,
      };
      
      const response = await axiosInstance.get('/api/v1/cotizaciones/', { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    totalPages: query.data ? Math.ceil(query.data.count / pageSize) : 0,
    hasNextPage: query.data?.next !== null,
    hasPreviousPage: query.data?.previous !== null,
    totalCount: query.data?.count || 0,
    currentCount: query.data?.results?.length || 0,
  };
};

export default usePaginatedCotizaciones;
```

### 2.2 Exportar Hook

**Archivo:** `frontend/src/hooks/index.ts`

Agregar después de usePaginatedClientes:
```typescript
export { usePaginatedCotizaciones } from './usePaginatedCotizaciones';
```

---

## Fase 3: Refactorizar Página

### 3.1 Actualizar `pages/Cotizaciones/index.tsx`

**Imports a Agregar:**
```typescript
import usePaginatedCotizaciones from '@/hooks/usePaginatedCotizaciones';
import usePagination from '@/hooks/usePagination';
import Pagination from '@/components/common/Pagination';
import InfiniteScroll from '@/components/common/InfiniteScroll';
import { useMediaQuery } from '@/hooks/useMediaQuery';
```

**Reemplazar Estado Actual:**

De:
```tsx
const [isLoading, setIsLoading] = useState(true);
const [data, setData] = useState<Cotizacion[]>([]);
```

A:
```tsx
const isMobile = useMediaQuery('(max-width: 768px)');
const pagination = usePagination({
  initialPage: 1,
  initialPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
});

const { data, isLoading } = usePaginatedCotizaciones({
  page: pagination.currentPage,
  pageSize: pagination.pageSize,
});
```

**Agregar Effect:**
```typescript
useEffect(() => {
  if (data?.count) {
    pagination.setTotalCount(data.count);
  }
}, [data?.count, pagination]);
```

**Reemplazar Render:**

De:
```tsx
return (
  <Card>
    {/* ... */}
    {isLoading ? <Skeleton /> : <DataTable data={data} />}
    {/* Sin paginación */}
  </Card>
);
```

A:
```tsx
return (
  <Card>
    <CardHeader>
      <CardTitle>{t('navigation:quotes_panel')}</CardTitle>
    </CardHeader>
    <CardContent>
      {isMobile ? (
        <InfiniteScroll
          onLoadMore={pagination.loadMore}
          hasMore={pagination.hasNextPage}
          isLoading={isLoading}
        >
          <Table>
            {/* Tabla condensada: 4 columnas */}
            {/* numero, cliente, total, estado, actions */}
          </Table>
        </InfiniteScroll>
      ) : (
        <>
          <Table>
            {/* Tabla completa: 7 columnas */}
            {/* id, numero, cliente, total, estado, fecha, actions */}
          </Table>
          <div className="mt-4">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalCount={pagination.totalCount}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
              pageSizeOptions={pagination.pageSizeOptions}
              isLoading={isLoading}
            />
          </div>
        </>
      )}
    </CardContent>
  </Card>
);
```

### 3.2 Adaptaciones Específicas

**Skeleton Loading:**
```tsx
const skeletonRows = Array(pagination.pageSize).fill(null);

if (isLoading) {
  return (
    <Table>
      <TableBody>
        {skeletonRows.map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4" /></TableCell>
            <TableCell><Skeleton className="h-4" /></TableCell>
            {/* ... más células */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**Columnas Mobile (4):**
- Número (numero)
- Cliente (cliente.nombre)
- Total (total)
- Acciones

**Columnas Desktop (7):**
- ID
- Número
- Cliente
- Total
- Estado
- Fecha Creación
- Acciones

---

## Fase 4: Testing

### 4.1 Verificar Compilación
```bash
cd frontend
npm run build
# Verificar: 0 errores TypeScript
```

### 4.2 Probar Manualmente

**Desktop (≥768px):**
- [ ] Tabla completa visible
- [ ] Paginación inferior aparece
- [ ] Selector de filas funciona
- [ ] Botones de página funcionan
- [ ] Info "Mostrando X-Y de Z" correcta

**Mobile (<768px):**
- [ ] Tabla condensada (4 columnas)
- [ ] Scroll infinito funciona
- [ ] Loading skeleton aparece
- [ ] Datos se cargan incrementales

---

---

# 👥 PROVEEDORES

## Fase 1: Verificar Estructura

### 1.1 Verificar Hook Existente
```bash
grep -r "useProveedores" frontend/src/hooks/
```

---

## Fase 2: Crear Hook de Paginación

### 2.1 Crear `usePaginatedProveedores.ts`

**Ubicación:** `frontend/src/hooks/usePaginatedProveedores.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type { PaginatedResponse } from './useClientes';

interface Proveedor {
  id: number;
  nombre: string;
  ruc: string;
  email: string;
  telefono: string;
  ciudad: string;
  pais: string;
  estado: boolean;
  // ... otros campos
}

interface UsePaginatedProveedoresOptions {
  page?: number;
  pageSize?: number;
  searchFilters?: Record<string, any>;
}

export const usePaginatedProveedores = (
  options: UsePaginatedProveedoresOptions = {}
) => {
  const { page = 1, pageSize = 25, searchFilters = {} } = options;

  const query = useQuery<PaginatedResponse<Proveedor>, Error>({
    queryKey: ['proveedores', { page, pageSize, ...searchFilters }],
    queryFn: async () => {
      const params = {
        page,
        page_size: pageSize,
        ...searchFilters,
      };
      
      const response = await axiosInstance.get('/api/v1/proveedores/', { 
        params 
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    totalPages: query.data ? Math.ceil(query.data.count / pageSize) : 0,
    hasNextPage: query.data?.next !== null,
    hasPreviousPage: query.data?.previous !== null,
    totalCount: query.data?.count || 0,
    currentCount: query.data?.results?.length || 0,
  };
};

export default usePaginatedProveedores;
```

### 2.2 Exportar Hook

**Archivo:** `frontend/src/hooks/index.ts`

```typescript
export { usePaginatedProveedores } from './usePaginatedProveedores';
```

---

## Fase 3: Refactorizar Página

### 3.1 Actualizar `pages/Proveedores/index.tsx`

**Patrón Identico a Cotizaciones:**

1. Importar hooks y componentes
2. Estado con `usePagination` y `usePaginatedProveedores`
3. Effect para actualizar `totalCount`
4. Renderizar con `isMobile ? InfiniteScroll : Pagination`

**Columnas Mobile (4):**
- Nombre
- RUC
- Email
- Acciones

**Columnas Desktop (7):**
- ID
- Nombre
- RUC
- Email
- Teléfono
- Ciudad
- Acciones

---

---

# 📦 ÓRDENES DE COMPRA

## Fase 1: Verificar Estructura

### 1.1 Verificar Hook Existente
```bash
grep -r "useOrdenes" frontend/src/hooks/
grep -r "useCompra" frontend/src/hooks/
```

---

## Fase 2: Crear Hook de Paginación

### 2.1 Crear `usePaginatedOrdenes.ts`

**Ubicación:** `frontend/src/hooks/usePaginatedOrdenes.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type { PaginatedResponse } from './useClientes';

interface OrdenCompra {
  id: number;
  numero: string;
  proveedor: number;
  fecha_pedido: string;
  fecha_entrega_estimada: string;
  total: number;
  estado: string;
  // ... otros campos
}

interface UsePaginatedOrdenesOptions {
  page?: number;
  pageSize?: number;
  searchFilters?: Record<string, any>;
}

export const usePaginatedOrdenes = (
  options: UsePaginatedOrdenesOptions = {}
) => {
  const { page = 1, pageSize = 25, searchFilters = {} } = options;

  const query = useQuery<PaginatedResponse<OrdenCompra>, Error>({
    queryKey: ['ordenes', { page, pageSize, ...searchFilters }],
    queryFn: async () => {
      const params = {
        page,
        page_size: pageSize,
        ...searchFilters,
      };
      
      const response = await axiosInstance.get('/api/v1/ordenes-compra/', { 
        params 
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    totalPages: query.data ? Math.ceil(query.data.count / pageSize) : 0,
    hasNextPage: query.data?.next !== null,
    hasPreviousPage: query.data?.previous !== null,
    totalCount: query.data?.count || 0,
    currentCount: query.data?.results?.length || 0,
  };
};

export default usePaginatedOrdenes;
```

### 2.2 Exportar Hook

**Archivo:** `frontend/src/hooks/index.ts`

```typescript
export { usePaginatedOrdenes } from './usePaginatedOrdenes';
```

---

## Fase 3: Refactorizar Página

### 3.1 Actualizar `pages/OrdenesCompra/index.tsx` (o `OrdenesPedido/`)

**Patrón Identico a Cotizaciones y Proveedores:**

**Columnas Mobile (4):**
- Número
- Proveedor
- Total
- Acciones

**Columnas Desktop (7):**
- ID
- Número
- Proveedor
- Fecha Pedido
- Entrega Estimada
- Total
- Acciones

---

---

# 🛍️ PRODUCTOS

## Fase 1: Verificar Estructura

### 1.1 Verificar Hook Existente
```bash
grep -r "useProductos" frontend/src/hooks/
```

---

## Fase 2: Crear Hook de Paginación

### 2.1 Crear `usePaginatedProductos.ts`

**Ubicación:** `frontend/src/hooks/usePaginatedProductos.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type { PaginatedResponse } from './useClientes';

interface Producto {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  // ... otros campos
}

interface UsePaginatedProductosOptions {
  page?: number;
  pageSize?: number;
  searchFilters?: Record<string, any>;
}

export const usePaginatedProductos = (
  options: UsePaginatedProductosOptions = {}
) => {
  const { page = 1, pageSize = 25, searchFilters = {} } = options;

  const query = useQuery<PaginatedResponse<Producto>, Error>({
    queryKey: ['productos', { page, pageSize, ...searchFilters }],
    queryFn: async () => {
      const params = {
        page,
        page_size: pageSize,
        ...searchFilters,
      };
      
      const response = await axiosInstance.get('/api/v1/productos/', { 
        params 
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    totalPages: query.data ? Math.ceil(query.data.count / pageSize) : 0,
    hasNextPage: query.data?.next !== null,
    hasPreviousPage: query.data?.previous !== null,
    totalCount: query.data?.count || 0,
    currentCount: query.data?.results?.length || 0,
  };
};

export default usePaginatedProductos;
```

### 2.2 Exportar Hook

**Archivo:** `frontend/src/hooks/index.ts`

```typescript
export { usePaginatedProductos } from './usePaginatedProductos';
```

---

## Fase 3: Refactorizar Página

### 3.1 Actualizar `pages/Productos/index.tsx`

**Patrón Identico:**

**Columnas Mobile (4):**
- Nombre
- Código
- Precio
- Acciones

**Columnas Desktop (7):**
- ID
- Nombre
- Código
- Descripción
- Precio
- Stock
- Acciones

---

---

## ✅ Verificación Final

### Fase 1: Compilación
```bash
cd frontend
npm run build

# Esperado:
# ✅ 0 TypeScript errors
# ✅ Build successful
```

### Fase 2: Verificación Manual

Para cada página (Cotizaciones, Proveedores, Órdenes, Productos):

**Desktop (≥768px)**
- [ ] Tabla completa visible
- [ ] Paginación funciona
- [ ] Selector de filas funciona
- [ ] Info correcta
- [ ] Botones deshabilitados cuando aplica

**Mobile (<768px)**
- [ ] Tabla condensada
- [ ] Infinite scroll funciona
- [ ] Skeleton loading visible
- [ ] Datos se cargan incrementales

### Fase 3: Integración
```bash
# Verificar que todos los endpoints responden
curl http://localhost:8000/api/v1/cotizaciones/?page=1&page_size=25
curl http://localhost:8000/api/v1/proveedores/?page=1&page_size=25
curl http://localhost:8000/api/v1/ordenes-compra/?page=1&page_size=25
curl http://localhost:8000/api/v1/productos/?page=1&page_size=25

# Esperado: JSON con count, next, previous, results
```

### Fase 4: Testing

```bash
# Abrir dev tools
# F12 → Network tab

# Desktop:
# - Abrir cada página
# - Cambiar página → verificar 1 request API
# - Cambiar tamaño → verificar 1 request API

# Mobile (F12 → Toggle Device Toolbar):
# - Scroll down → verificar request cuando llega al bottom
# - Verificar datos se añaden incrementales
```

---

## 🎯 Orden Recomendado de Implementación

1. **Cotizaciones** (mejor conocida, más campos)
2. **Proveedores** (estructura similar)
3. **Órdenes de Compra** (fechas adicionales)
4. **Productos** (posible grid en lugar de tabla)

**Tiempo por página:** 10-15 minutos

---

## 📝 Notas Importantes

### ⚠️ Validaciones
- El endpoint debe retornar `count` en la respuesta
- La API debe soportar parámetros `page` y `page_size`
- Cada página debe usar el mismo patrón para consistencia

### 🔄 Patrón Genérico
Todos los hooks `usePaginatedXXX` siguen la misma estructura:
```typescript
export const usePaginatedXXX = (options = {}) => {
  const { page = 1, pageSize = 25, searchFilters = {} } = options;
  const query = useQuery({
    queryKey: ['xxx', { page, pageSize, ...searchFilters }],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/v1/xxx/', { 
        params: { page, page_size: pageSize, ...searchFilters }
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
  return { /* ... */ };
};
```

### 🎨 Estilo Consistente
- Mismo tamaño de página por defecto: 25
- Mismas opciones: [10, 25, 50, 100]
- Mismo formato de información
- Mismo breakpoint mobile: 768px

### 💾 Cache Strategy
- Stale time: 5 minutos
- Query key include: modelo + page + pageSize + filters
- Refetch on window focus: habilitado (por defecto)

---

## 📚 Referencia: Clientes (Completado)

Archivo: `frontend/src/pages/Clientes/index.tsx`

**Verificar implementación completa como referencia:**
- Imports
- Hooks setup
- useEffect
- Render lógica
- Columnas
- Skeleton

---

**¡Workflow completo listo para ejecutar! 🚀**

Próximas acciones:
1. Ejecutar según orden recomendado
2. Compilar después de cada página
3. Probar manual en desktop + mobile
4. Ir a siguiente página cuando se confirme

