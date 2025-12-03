// Define la estructura de los datos que esperamos del modelo ProductoServicio de Django
export type ProductoServicio = {
  id: number;
  nombre: string;
  codigo: string;
  tipo_producto: string;
  unidad_medida: string;
  precio_base: number;
  requiere_medidas: boolean;
  configuracion_ui: Record<string, any>;
  is_active: boolean;
  // Campos de BaseModel
  created_at: string;
};

// Define la estructura para la paginación de Django Rest Framework
export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// Define la interfaz para los filtros que el usuario puede aplicar
export interface CatalogoFilters {
  search: string; // Búsqueda global (código o nombre)
  tipo_producto: string;
  unidad_medida: string;
  // Añadiremos más campos (fechas) cuando implementemos la página de Cotizaciones
}