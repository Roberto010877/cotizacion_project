import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type { Cliente, PaginatedResponse } from './useClientes';

interface UsePaginatedClientesOptions {
  page?: number;
  pageSize?: number;
  searchFilters?: Record<string, any>;
}

export const usePaginatedClientes = (options: UsePaginatedClientesOptions = {}) => {
  const { page = 1, pageSize = 25, searchFilters = {} } = options;

  const query = useQuery<PaginatedResponse<Cliente>, Error>({
    queryKey: ['clientes', { page, pageSize, ...searchFilters }],
    queryFn: async () => {
      const params = {
        page,
        page_size: pageSize,
        ...searchFilters,
      };

      const { data } = await axiosInstance.get('/api/v1/clientes/', { params });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const totalPages = query.data ? Math.ceil(query.data.count / pageSize) : 0;
  const hasNextPage = query.data?.next !== null;
  const hasPreviousPage = query.data?.previous !== null;

  return {
    ...query,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    currentCount: query.data?.results.length || 0,
    totalCount: query.data?.count || 0,
  };
};

export default usePaginatedClientes;
