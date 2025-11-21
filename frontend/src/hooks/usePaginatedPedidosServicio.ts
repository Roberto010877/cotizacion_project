import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type { PaginatedResponse } from './useClientes';

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
  acionamiento: string;
  observaciones?: string;
}

export interface PedidoServicio {
  id: number;
  numero_pedido: string;
  cliente: number;
  cliente_nombre?: string;
  solicitante: string;
  colaborador?: number;
  colaborador_nombre?: string;
  supervisor?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: 'ENVIADO' | 'ACEPTADO' | 'EN_FABRICACION' | 'LISTO_INSTALAR' | 'INSTALADO' | 'COMPLETADO' | 'RECHAZADO' | 'CANCELADO';
  observaciones?: string;
  items?: ItemPedidoServicio[];
  total_items?: number;
  created_at: string;
  updated_at: string;
}

interface UsePaginatedPedidosServicioOptions {
  page?: number;
  pageSize?: number;
  searchFilters?: Record<string, any>;
}

export const usePaginatedPedidosServicio = (
  options: UsePaginatedPedidosServicioOptions = {}
) => {
  const { page = 1, pageSize = 25, searchFilters = {} } = options;

  const query = useQuery<PaginatedResponse<PedidoServicio>, Error>({
    queryKey: ['pedidos-servicio', { page, pageSize, ...searchFilters }],
    queryFn: async () => {
      const params = {
        page,
        page_size: pageSize,
        ...searchFilters,
      };

      const response = await axiosInstance.get('/api/v1/pedidos-servicio/', {
        params,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
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
