export { CotizacionFilter, type CotizacionFilters } from "../components/CotizacionFilter";

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
}

export interface Cotizacion {
    id: number;
    numero: string;
    cliente: number;
    cliente_nombre: string;
    vendedor_id: number;
    vendedor_nombre: string;
    estado: 'BORRADOR' | 'ENVIADA' | 'ACEPTADA' | 'RECHAZADA' | 'VENCIDA' | 'CANCELADA';
    fecha_emision: string; // YYYY-MM-DD (solo fecha, para negocio)
    fecha_validez: string | null;
    total_general: string; // Decimal field as string
    descuento_global: string; // Descuento en %
    created_at: string; // ISO 8601 datetime con timezone (auditoría)
    updated_at: string; // ISO 8601 datetime con timezone (auditoría)
    usuario_creacion: number | null; // ID del usuario que creó
    usuario_creacion_detalle: User | null; // Detalles completos del usuario
}

// Tipo de respuesta paginada de la API
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// Filtros globales para la API
export interface CotizacionListFilters {
    search: string;
    estado: string;
    fecha_desde: string | undefined;
    fecha_hasta: string | undefined;
    cliente?: number | undefined;
    vendedor?: number | undefined;
    total_min?: number | undefined;
    total_max?: number | undefined;
    ordering?: string | undefined;
}