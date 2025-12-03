import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {apiClient} from '@/lib/apiClient';
import { toast } from 'react-hot-toast';

// Tipos (interfaces) para los datos de clientes
export type Cliente = {
  id: number;
  nombre: string;
  pais: number;
  pais_nombre: string;
  tipo_documento: number;
  tipo_documento_nombre: string;
  numero_documento: string;
  direccion: string;
  telefono: string;
  email: string;
  tipo: 'NUEVO' | 'RECURRENTE' | 'VIP';
  origen: 'RECOMENDACION' | 'WEB' | 'COLABORADOR' | 'REDES_SOCIALES' | 'FERIA' | 'OTRO';
  numero_de_compras: number;
  total_gastado: number;
  es_empresa: boolean;
  es_cliente_activo: boolean;
  fecha_ultima_compra: string | null;
  created_at: string;
}

export interface ClienteFormData {
  nombre: string;
  pais: number;
  tipo_documento: number;
  numero_documento: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  origen?: 'RECOMENDACION' | 'WEB' | 'COLABORADOR' | 'REDES_SOCIALES' | 'FERIA' | 'OTRO';
  fecha_nacimiento?: string;
  preferencias_contacto?: 'EMAIL' | 'WHATSAPP' | 'LLAMADA' | 'SMS';
  notas?: string;
}

export interface ClienteUpdateFormData {
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  origen?: 'RECOMENDACION' | 'WEB' | 'COLABORADOR' | 'REDES_SOCIALES' | 'FERIA' | 'OTRO';
  fecha_nacimiento?: string;
  preferencias_contacto?: 'EMAIL' | 'WHATSAPP' | 'LLAMADA' | 'SMS';
  notas?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Hook para obtener la lista de clientes
export const useClientes = (params?: Record<string, any>) => {
  return useQuery<PaginatedResponse<Cliente>, Error>({
    queryKey: ['clientes', params],
    queryFn: async () => {
      const { data } = await apiClient.get('clientes/', { params });
      return data;
    },
  });
};

// Hook para obtener un cliente por ID
export const useCliente = (id: number) => {
  return useQuery<Cliente, Error>({
    queryKey: ['cliente', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`clientes/${id}/`);
      return data;
    },
    enabled: !!id, // Solo ejecuta la query si el ID existe
  });
};

// Hook para crear un nuevo cliente
export const useCreateCliente = () => {
  const queryClient = useQueryClient();
  return useMutation<Cliente, Error, ClienteFormData>({
    mutationFn: async (newCliente) => {
      const { data } = await apiClient.post('clientes/', newCliente);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al crear cliente: ${error.response?.data?.detail || error.message}`);
    },
  });
};

// Hook para actualizar un cliente existente
export const useUpdateCliente = () => {
  const queryClient = useQueryClient();
  return useMutation<Cliente, Error, { id: number; data: ClienteUpdateFormData }>({
    mutationFn: async ({ id, data: updatedCliente }) => {
      const { data } = await apiClient.patch(`clientes/${id}/`, updatedCliente);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente', variables.id] });
      toast.success('Cliente actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al actualizar cliente: ${error.response?.data?.detail || error.message}`);
    },
  });
};

// Hook para eliminar un cliente (soft delete)
export const useDeleteCliente = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await apiClient.delete(`clientes/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar cliente: ${error.response?.data?.detail || error.message}`);
    },
  });
};

// Hook para obtener opciones de filtro
export interface FilterOptions {
  paises: { id: number; codigo: string; nombre: string; codigo_telefono: string }[];
  tipos_documento: { id: number; codigo: string; nombre: string; pais: number; es_para_empresa: boolean }[];
  tipos_cliente: { value: string; label: string }[];
  origenes_cliente: { value: string; label: string }[];
}

export const useFilterOptions = () => {
  return useQuery<FilterOptions, Error>({
    queryKey: ['clienteFilterOptions'],
    queryFn: async () => {
      const { data } = await apiClient.get('clientes/opciones-filtro/');
      return data;
    },
    staleTime: Infinity, // Las opciones de filtro no cambian a menudo
  });
};
