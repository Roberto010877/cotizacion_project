import { useQuery } from '@tanstack/react-query';
import {apiClient} from '@/lib/apiClient';

interface EstadisticasResponse {
  total_pedidos: number;
  por_estado: Array<{
    estado: string;
    count: number;
  }>;
}

export const usePedidosEstadisticas = () => {
  const query = useQuery<EstadisticasResponse, Error>({
    queryKey: ['pedidos-servicio-estadisticas'],
    queryFn: async () => {
      const response = await apiClient.get('pedidos-servicio/estadisticas/');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });

  // Transformar respuesta a formato más conveniente
  const conteosPorEstado: Record<string, number> = {};
  query.data?.por_estado.forEach((stat) => {
    conteosPorEstado[stat.estado] = stat.count;
  });

  return {
    estadisticas: query.data,
    conteosPorEstado,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export default usePedidosEstadisticas;