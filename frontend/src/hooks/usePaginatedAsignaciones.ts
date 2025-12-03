import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export interface AsignacionTarea {
  id: number;
  numero_pedido: string;
  cliente_nombre: string;
  solicitante: string;
  fabricador_nombre: string;
  instalador_nombre: string;
  estado: string;
  estado_display: string;
  fecha_inicio: string;
  fecha_fin: string;
  observaciones: string;
  total_items: number;
  created_at: string;
  updated_at: string;
}

interface PaginatedAsignaciones {
  count: number;
  next: string | null;
  previous: string | null;
  results: AsignacionTarea[];
}

export function usePaginatedAsignaciones(page = 1, filters?: Record<string, any>) {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('page_size', '25');
  
  // Agregar filtros si existen
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }

  return useQuery<PaginatedAsignaciones>({
    queryKey: ['asignaciones', page, filters],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `pedidos-servicio/mis_pedidos/?${queryParams.toString()}`
      );
      return response.data;
    },
  });
}

export function useAsignacionDetalle(id: number) {
  return useQuery<AsignacionTarea>({
    queryKey: ['asignacion', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`pedidos-servicio/${id}/`);
      return response.data;
    },
  });
}

export function useUpdateAsignacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: number; updates: Partial<AsignacionTarea> }) => {
      const response = await axiosInstance.patch(
        `pedidos-servicio/${data.id}/`,
        data.updates
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] });
    },
  });
}


export function useCreateAsignacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<AsignacionTarea>) => {
      // Las asignaciones ahora se crean como parte del pedido
      // Este método está deprecado
      throw new Error('useCreateAsignacion está deprecado. Use la API de pedidos-servicio');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] });
    },
  });
}
