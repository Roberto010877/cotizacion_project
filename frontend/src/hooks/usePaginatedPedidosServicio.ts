import { useQuery } from '@tanstack/react-query';
import {apiClient} from '@/lib/apiClient';
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
  page?: number;
  pageSize?: number;
  searchFilters?: Record<string, any>;
}

// Función helper para crear una clave estable a partir de un objeto
const createStableKey = (obj: Record<string, any>): string => {
  if (!obj || Object.keys(obj).length === 0) return 'empty';
  
  // Ordenar las claves y crear un string estable
  const sortedKeys = Object.keys(obj).sort();
  const stableObj: Record<string, any> = {};
  
  sortedKeys.forEach(key => {
    stableObj[key] = obj[key];
  });
  
  return JSON.stringify(stableObj);
};

export const usePaginatedPedidosServicio = (
  options: UsePaginatedPedidosServicioOptions = {}
) => {
  const { page = 1, pageSize = 25, searchFilters = {} } = options;

  // Crear una clave estable para los filtros de búsqueda
  const stableSearchKey = createStableKey(searchFilters);

  const query = useQuery<PaginatedResponse<PedidoServicio>, Error>({
    queryKey: ['pedidos-servicio', page, pageSize, stableSearchKey],
    queryFn: async ({ queryKey }) => {
      // ✅ CORREGIDO: Extraer parámetros de queryKey para evitar closure issues
      const [, currentPage, currentPageSize, searchKey] = queryKey as [string, number, number, string];
      
      // Verificar que hay token antes de hacer la solicitud
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // ✅ CORREGIDO: Reconstruir searchFilters desde la clave estable
      const currentSearchFilters = searchKey === 'empty' ? {} : JSON.parse(searchKey);

      const params = {
        page: currentPage,
        page_size: currentPageSize,
        ...currentSearchFilters,
      };

      try {
        const response = await apiClient.get('pedidos-servicio/', {
          params,
        });
        return response.data;
      } catch (error: any) {
        console.error('Error fetching pedidos-servicio:', error.response?.status, error.response?.data);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos de cache
    refetchInterval: false,
    retry: 1,
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