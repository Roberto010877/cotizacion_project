// Exportar todos los hooks personalizados

// Clientes
export { useClientes, useCliente, useCreateCliente, useUpdateCliente, useDeleteCliente, useFilterOptions } from './useClientes';
export type { Cliente, ClienteFormData, ClienteUpdateFormData, PaginatedResponse, FilterOptions } from './useClientes';
export { usePaginatedClientes } from './usePaginatedClientes';

// Cotizaciones
export { usePaginatedCotizaciones } from './usePaginatedCotizaciones';
export type { Cotizacion } from './usePaginatedCotizaciones';

// Proveedores y Órdenes
export { usePaginatedProveedores } from './usePaginatedProveedores';
export type { Proveedor } from './usePaginatedProveedores';
export { usePaginatedOrdenes } from './usePaginatedOrdenes';
export type { OrdenCompra } from './usePaginatedOrdenes';

// --- CORRECCIÓN AQUÍ ---
// Hemos reemplazado usePaginatedProductos por usePaginatedCatalogo
export { usePaginatedCatalogo } from './usePaginatedCatalogo';

// NOTA: El tipo 'Producto' o 'ProductoServicio' ya no se exporta desde el hook.
// Debes importarlo directamente desde: '@/pages/ProductosServicios/types'
// Por eso eliminamos la línea: export type { Producto } ...

// Utilidades
export { usePagination } from './usePagination';
export type { UsePaginationReturn } from './usePagination';
export { useMediaQuery } from './useMediaQuery';
export { useAuthTimeout } from './useAuthTimeout';

// Default exports si son necesarios
export { useClientes as default } from './useClientes';