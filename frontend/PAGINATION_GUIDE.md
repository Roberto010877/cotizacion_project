# 📖 Guía de Implementación de Paginación Reutilizable

## Sistema Híbrido Implementado

El proyecto ahora tiene un sistema completo y reutilizable de paginación que se adapta automáticamente:

- **Desktop (≥ 768px)**: Paginación con números + selector de filas por página
- **Mobile (< 768px)**: Infinite Scroll automático

## 🎯 Componentes Disponibles

### 1. **Pagination Component**
Componente de paginación de escritorio con controles completos.

```tsx
import { Pagination } from '@/components/common/Pagination';

<Pagination
  currentPage={page}
  totalPages={totalPages}
  pageSize={pageSize}
  totalCount={totalCount}
  onPageChange={(page) => setPage(page)}
  onPageSizeChange={(size) => setPageSize(size)}
  pageSizeOptions={[10, 25, 50, 100]}
  isLoading={isLoading}
/>
```

### 2. **InfiniteScroll Component**
Componente de scroll infinito para mobile.

```tsx
import { InfiniteScroll } from '@/components/common/InfiniteScroll';

<InfiniteScroll
  onLoadMore={handleLoadMore}
  hasMore={hasNextPage}
  isLoading={isLoading}
  threshold={100}
>
  {/* Tu contenido aquí */}
</InfiniteScroll>
```

### 3. **usePagination Hook**
Hook para manejar la lógica de paginación.

```tsx
import { usePagination } from '@/hooks/usePagination';

const pagination = usePagination({
  initialPage: 1,
  initialPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
});

// Uso
pagination.currentPage          // Página actual
pagination.pageSize            // Tamaño de página
pagination.totalPages          // Total de páginas
pagination.setPage(2)          // Cambiar página
pagination.setPageSize(50)     // Cambiar tamaño
pagination.loadMore()          // Cargar página siguiente (infinite scroll)
```

### 4. **usePaginatedClientes Hook**
Hook específico para clientes con paginación automática.

```tsx
import { usePaginatedClientes } from '@/hooks/usePaginatedClientes';

const { data, isLoading, refetch, totalPages, hasNextPage, totalCount } = usePaginatedClientes({
  page: 1,
  pageSize: 25,
  searchFilters: { nombre: 'Juan' },
});
```

### 5. **useMediaQuery Hook**
Hook para detectar cambios en media queries.

```tsx
import { useMediaQuery } from '@/hooks/useMediaQuery';

const isMobile = useMediaQuery('(max-width: 768px)');

if (isMobile) {
  // Mostrar versión mobile
}
```

## 🚀 Implementación en Otras Páginas

### Ejemplo: Cotizaciones con Paginación

```tsx
import { useState } from 'react';
import { usePaginatedClientes } from '@/hooks/usePaginatedClientes';
import { Pagination } from '@/components/common/Pagination';
import { InfiniteScroll } from '@/components/common/InfiniteScroll';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePagination } from '@/hooks/usePagination';

export const CotizacionesPage = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [searchFilters, setSearchFilters] = useState({});

  const pagination = usePagination({
    initialPageSize: 25,
  });

  const { data, isLoading } = usePaginatedClientes({
    page: pagination.currentPage,
    pageSize: pagination.pageSize,
    searchFilters,
  });

  // Actualizar total cuando llegan datos
  React.useEffect(() => {
    if (data?.count) {
      pagination.setTotalCount(data.count);
    }
  }, [data?.count]);

  return (
    <div>
      {isMobile ? (
        <InfiniteScroll
          onLoadMore={pagination.loadMore}
          hasMore={pagination.hasNextPage}
          isLoading={isLoading}
        >
          {/* Tu tabla o lista aquí */}
        </InfiniteScroll>
      ) : (
        <>
          {/* Tu tabla aquí */}
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalCount={pagination.totalCount}
            onPageChange={(p) => pagination.setPage(p)}
            onPageSizeChange={pagination.setPageSize}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};
```

## 📋 Estructura de Archivo Backend

El backend ya está configurado con:

```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 25,
}
```

Los endpoints devuelven:
```json
{
  "count": 200,
  "next": "http://.../?page=2",
  "previous": null,
  "results": [...]
}
```

## 🎨 Características

✅ Responsivo (Mobile/Desktop)
✅ Reutilizable en cualquier página
✅ Infinite Scroll en mobile
✅ Number pagination en desktop
✅ Selector de filas por página
✅ Información clara: "Mostrando 1-25 de 200"
✅ Manejo de estados (loading, error)
✅ Integración con React Query
✅ TypeScript completo
✅ Traducible

## 🔄 Migrando una Página Existente

Para migrar una página existente (e.g., Proveedores, Productos):

1. **Reemplazar el hook**:
   ```tsx
   // Antes:
   const { data, isLoading } = useProveedores(filters);

   // Después:
   const pagination = usePagination();
   const { data, isLoading } = useQuery({
     queryKey: ['proveedores', pagination.currentPage, pagination.pageSize],
     queryFn: async () => {
       const { data } = await axiosInstance.get('/api/v1/proveedores/', {
         params: {
           page: pagination.currentPage,
           page_size: pagination.pageSize,
         }
       });
       return data;
     }
   });
   ```

2. **Agregar componentes**:
   ```tsx
   const isMobile = useMediaQuery('(max-width: 768px)');

   {isMobile ? (
     <InfiniteScroll .../>
   ) : (
     <>
       <Table />
       <Pagination />
     </>
   )}
   ```

3. **Actualizar el total**:
   ```tsx
   useEffect(() => {
     if (data?.count) {
       pagination.setTotalCount(data.count);
     }
   }, [data?.count]);
   ```

## 🧪 Testing

Los componentes están listos para testing:

```tsx
it('should paginate correctly', () => {
  const { getByText } = render(
    <Pagination
      currentPage={1}
      totalPages={5}
      pageSize={25}
      totalCount={125}
      onPageChange={jest.fn()}
      onPageSizeChange={jest.fn()}
    />
  );

  expect(getByText('Página 1 de 5')).toBeInTheDocument();
});
```

## 📚 Archivos Creados

- `src/components/common/Pagination.tsx` - Componente paginación
- `src/components/common/InfiniteScroll.tsx` - Componente scroll infinito
- `src/hooks/usePagination.ts` - Hook paginación
- `src/hooks/usePaginatedClientes.ts` - Hook paginación clientes
- `src/hooks/useMediaQuery.ts` - Hook media queries
- `src/components/common/index.ts` - Exports centralizados
- `src/hooks/index.ts` - Exports centralizados

## ✅ Implementado en

- ✅ Página de Clientes (Hybrid - Mobile/Desktop)
- ⏳ Página de Cotizaciones (Listo para implementar)
- ⏳ Página de Proveedores (Listo para implementar)
- ⏳ Página de Órdenes de Compra (Listo para implementar)

---

**Nota**: El sistema está completamente desacoplado y reutilizable. Cualquier nueva API que devuelva el formato de `PaginatedResponse` funcionará automáticamente.
