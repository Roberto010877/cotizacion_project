import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import type { PaginatedResponse, PedidoServicioListFilters } from '@/pages/PedidosServicio/types';

export interface ItemPedidoServicio {
  id: number;
  ambiente: string;
  modelo: string;
  tejido: string;
  largura: number;
  altura: number;
  cantidad_piezas: number;
  posicion_tejido: string;
  lado_comando: string;
  accionamiento: string;
  observaciones?: string;
}

export interface ClienteInfo {
  id: number;
  nombre: string;
  numero_documento?: string;
  email?: string;
  telefono?: string;
  telefono_contacto?: string;
  direccion?: string;
}

export interface PedidoServicio {
  id: number;
  numero_pedido: string;
  cliente: number | ClienteInfo;
  cliente_nombre?: string;
  solicitante: string;
  solicitante_nombre?: string;
  colaborador?: number;
  colaborador_nombre?: string;
  supervisor?: string;
  fecha_emision?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: 'ENVIADO' | 'ACEPTADO' | 'EN_FABRICACION' | 'LISTO_INSTALAR' | 'INSTALADO' | 'COMPLETADO' | 'RECHAZADO' | 'CANCELADO';
  estado_display?: string;
  observaciones?: string;
  items?: ItemPedidoServicio[];
  total_items?: number;
  fabricador_nombre?: string;
  instalador_nombre?: string;
  fabricador_id?: number;
  instalador_id?: number;
  created_at: string;
  updated_at: string;
}

interface UsePaginatedPedidosServicioOptions {
  page: number;
  pageSize: number;
  filters: PedidoServicioListFilters;
}

/**
 * Hook personalizado para obtener la lista paginada y filtrada de Pedidos de Servicio.
 * Utiliza React Query para el manejo de cache, loading y errores.
 * 
 * Filtros soportados:
 * - search: Búsqueda en numero_pedido, cliente__nombre y solicitante
 * - estado: Estado exacto (ENVIADO, ACEPTADO, etc.)
 * - fecha_emision_desde, fecha_emision_hasta: Rango de fechas de emisión
 * - cliente: ID del cliente
 * - manufacturador: ID del manufacturador
 * - instalador: ID del instalador
 * - ordering: Campo para ordenar (ej: -created_at, numero_pedido)
 */
export const usePaginatedPedidosServicio = ({
  page,
  pageSize,
  filters,
}: UsePaginatedPedidosServicioOptions) => {

  const fetchPedidosServicio = async (): Promise<PaginatedResponse<PedidoServicio>> => {
    // Construir los parámetros de la URL
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    // --- Aplicar Filtros ---
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.estado && filters.estado !== 'ALL') {
      params.append('estado', filters.estado);
    }
    if (filters.fecha_emision_desde) {
      params.append('fecha_emision_desde', filters.fecha_emision_desde);
    }
    if (filters.fecha_emision_hasta) {
      params.append('fecha_emision_hasta', filters.fecha_emision_hasta);
    }
    if (filters.cliente) {
      params.append('cliente', filters.cliente.toString());
    }
    if (filters.manufacturador) {
      params.append('manufacturador', filters.manufacturador.toString());
    }
    if (filters.instalador) {
      params.append('instalador', filters.instalador.toString());
    }
    if (filters.ordering) {
      params.append('ordering', filters.ordering);
    }

    const response = await apiClient.get<PaginatedResponse<PedidoServicio>>(
      `pedidos-servicio/?${params.toString()}`
    );
    
    return response.data;
  };

  const query = useQuery<PaginatedResponse<PedidoServicio>, Error>({
    queryKey: ['pedidos-servicio', page, pageSize, filters],
    queryFn: fetchPedidosServicio,
    placeholderData: (previousData) => previousData, // Mantiene la data previa mientras carga
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos de cache
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    totalPages: query.data ? Math.ceil(query.data.count / pageSize) : 0,
    hasNextPage: query.data?.next !== null,
    hasPreviousPage: query.data?.previous !== null,
    totalCount: query.data?.count || 0,
    currentCount: query.data?.results?.length || 0,
  };
};

export default usePaginatedPedidosServicio;