import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export interface AsignacionTarea {
  id: number;
  pedido: number;
  pedido_numero: string;
  cliente_nombre: string;
  cliente_telefono: string;
  solicitante: string;
  instalador: number;
  instalador_nombre: string;
  tipo_tarea: string;
  tipo_tarea_display: string;
  estado: string;
  estado_display: string;
  fecha_asignacion: string;
  fecha_inicio_real: string | null;
  fecha_entrega_esperada: string;
  fecha_completacion: string | null;
  descripcion_tarea: string;
  notas_progreso: string;
  observaciones_pedido: string;
  pedido_items: Array<{
    id: number;
    numero_item: number;
    ambiente: string;
    modelo: string;
    tejido: string;
    largura: string;
    altura: string;
    cantidad_piezas: number;
    posicion_tejido: string;
    posicion_tejido_display: string;
    lado_comando: string;
    lado_comando_display: string;
    acionamiento: string;
    acionamiento_display: string;
    observaciones: string;
  }>;
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
        `/api/v1/asignaciones-tareas/?${queryParams.toString()}`
      );
      return response.data;
    },
  });
}

export function useAsignacionDetalle(id: number) {
  return useQuery<AsignacionTarea>({
    queryKey: ['asignacion', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/v1/asignaciones-tareas/${id}/`);
      return response.data;
    },
  });
}

export function useUpdateAsignacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: number; updates: Partial<AsignacionTarea> }) => {
      const response = await axiosInstance.patch(
        `/api/v1/asignaciones-tareas/${data.id}/`,
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
      const response = await axiosInstance.post('/api/v1/asignaciones-tareas/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] });
    },
  });
}
