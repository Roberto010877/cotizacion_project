// Exportar todos los hooks personalizados
export { useClientes, useCliente, useCreateCliente, useUpdateCliente, useDeleteCliente, useFilterOptions } from './useClientes';
export type { Cliente, ClienteFormData, ClienteUpdateFormData, PaginatedResponse, FilterOptions } from './useClientes';

export { usePaginatedClientes } from './usePaginatedClientes';

export { usePaginatedCotizaciones } from './usePaginatedCotizaciones';
export type { Cotizacion } from './usePaginatedCotizaciones';

export { usePaginatedProveedores } from './usePaginatedProveedores';
export type { Proveedor } from './usePaginatedProveedores';

export { usePaginatedOrdenes } from './usePaginatedOrdenes';
export type { OrdenCompra } from './usePaginatedOrdenes';

export { usePaginatedProductos } from './usePaginatedProductos';
export type { Producto } from './usePaginatedProductos';

export { usePagination } from './usePagination';
export type { UsePaginationReturn } from './usePagination';

export { useMediaQuery } from './useMediaQuery';

export { useAuthTimeout } from './useAuthTimeout';

export { useClientes as default } from './useClientes';
