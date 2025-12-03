import { useQuery, type UseQueryResult, keepPreviousData } from '@tanstack/react-query';
import { type ProductoServicio, type PaginatedResponse, type CatalogoFilters } from '@/pages/ProductosServicios/types';
// Asumo que tu instancia de Axios se llama 'apiClient'
import { apiClient } from '@/lib/apiClient'; 

// Definición de las propiedades del hook: incluye paginación y filtros
interface UseCatalogoProps {
  page: number;
  pageSize: number;
  filters: Partial<CatalogoFilters>;
}

// Función que realiza la petición HTTP a Django
const fetchCatalogo = async (props: UseCatalogoProps): Promise<PaginatedResponse<ProductoServicio>> => {
  const { page, pageSize, filters } = props;

  // Construir los parámetros de la URL para Django (Sección 5.3)
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  // Agregar filtros si están definidos
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.tipo_producto) {
    params.append('tipo_producto', filters.tipo_producto);
  }
  if (filters.unidad_medida) {
    params.append('unidad_medida', filters.unidad_medida);
  }

  // Ruta a tu API (asumiendo que está configurada en /gestion/productos/)
  const response = await apiClient.get<PaginatedResponse<ProductoServicio>>('/gestion/productos/', {
    params,
  });
  
  return response.data;
};

// Custom Hook para consumir el catálogo
export const usePaginatedCatalogo = (
  props: UseCatalogoProps
): UseQueryResult<PaginatedResponse<ProductoServicio>> => {
  
  // La clave de la query se genera a partir de la paginación y los filtros
  const queryKey = ['catalogo', props.page, props.pageSize, props.filters];

  return useQuery({
    queryKey,
    queryFn: () => fetchCatalogo(props),
    // Configuración opcional
    staleTime: 5 * 60 * 1000, // 5 minutos antes de revalidar
    placeholderData: keepPreviousData,
  });
};