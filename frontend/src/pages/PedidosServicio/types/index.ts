// Tipos e interfaces para Pedidos de Servicio

// Re-exportar tipos de pedidos del hook
export type {
  PedidoServicio,
  ItemPedidoServicio,
  ClienteInfo,
} from '@/hooks/usePaginatedPedidosServicio';

// Respuesta paginada genérica
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Filtros para la lista de pedidos de servicio
export interface PedidoServicioListFilters {
  search: string;
  estado: string;
  fecha_emision_desde: string | undefined;
  fecha_emision_hasta: string | undefined;
  cliente?: number | undefined;
  manufacturador?: number | undefined;
  instalador?: number | undefined;
  ordering?: string | undefined;
}

// Filtros para el componente UI (valores locales)
export type PedidoServicioFilters = {
  estado: string;
  fecha_emision_desde: string | undefined;
  fecha_emision_hasta: string | undefined;
};
