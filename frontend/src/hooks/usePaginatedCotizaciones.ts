import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient'; // Usamos el cliente configurado para autenticación
import { type Cotizacion, type PaginatedResponse, type CotizacionListFilters } from '@/pages/Cotizaciones/types';

// --- Definición de la URL base del ViewSet ---
const COTIZACIONES_API_URL = '/gestion/cotizaciones/';

// --- Tipos de los parámetros de entrada ---
interface UseCotizacionesParams {
  page: number;
  pageSize: number;
  filters: CotizacionListFilters;
}

/**
 * Hook personalizado para obtener la lista paginada y filtrada de Cotizaciones.
 * Utiliza React Query para el manejo de cache, loading y errores.
 * 
 * Filtros soportados:
 * - search: Búsqueda en numero y cliente__nombre
 * - estado: Estado exacto (BORRADOR, ENVIADA, etc.)
 * - fecha_desde, fecha_hasta: Rango de fechas de emisión
 * - cliente: ID del cliente
 * - vendedor: ID del vendedor
 * - total_min, total_max: Rango de total general
 * - ordering: Campo para ordenar (ej: -total_general, fecha_emision)
 */
export const usePaginatedCotizaciones = ({
  page,
  pageSize,
  filters,
}: UseCotizacionesParams) => {
  
  // Función de consulta (fetcher)
  const fetchCotizaciones = async (): Promise<PaginatedResponse<Cotizacion>> => {
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
    if (filters.fecha_desde) {
      params.append('fecha_desde', filters.fecha_desde); // Formato YYYY-MM-DD
    }
    if (filters.fecha_hasta) {
      params.append('fecha_hasta', filters.fecha_hasta); // Formato YYYY-MM-DD
    }
    if (filters.cliente) {
      params.append('cliente', filters.cliente.toString());
    }
    if (filters.vendedor) {
      params.append('vendedor', filters.vendedor.toString());
    }
    if (filters.total_min) {
      params.append('total_min', filters.total_min.toString());
    }
    if (filters.total_max) {
      params.append('total_max', filters.total_max.toString());
    }
    if (filters.ordering) {
      params.append('ordering', filters.ordering);
    }

    const response = await apiClient.get<PaginatedResponse<Cotizacion>>(
      `${COTIZACIONES_API_URL}?${params.toString()}`
    );
    
    return response.data;
  };

  return useQuery({
    queryKey: ['cotizaciones', page, pageSize, filters], // La clave de consulta debe cambiar con la paginación y filtros
    queryFn: fetchCotizaciones,
    placeholderData: (previousData) => previousData, // Mantiene la data previa mientras carga la nueva página
  });
};