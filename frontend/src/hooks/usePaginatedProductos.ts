import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type { PaginatedResponse } from './useClientes';

export interface Producto {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  estado: boolean;
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

      const response = await axiosInstance.get('/api/v1/gestion/productos/', {
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
    refetch: query.refetch,
    totalPages: query.data ? Math.ceil(query.data.count / pageSize) : 0,
    hasNextPage: query.data?.next !== null,
    hasPreviousPage: query.data?.previous !== null,
    totalCount: query.data?.count || 0,
    currentCount: query.data?.results?.length || 0,
  };
};

export default usePaginatedProductos;
