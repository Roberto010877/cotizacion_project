/**
 * Sistema de permisos basado en permisos de Django (no en grupos)
 * Los permisos se obtienen del backend cuando el usuario hace login
 */

export interface User {
  role?: 'ADMIN' | 'COMERCIAL';
  groups?: string[];
  permissions?: string[]; // Permisos de Django
  username?: string;
}

/**
 * Mapeo de rutas a permisos de Django requeridos
 * Formato: 'app_label.codename' (ej: 'clientes.view_cliente')
 * 
 * NOTA: El backend debe enviar la lista de permisos del usuario
 */
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  // Dashboard y tareas - acceso sin permisos específicos
  '/': [], // Dashboard principal - sin restricción
  '/mis-tareas': [], // Mis tareas - sin restricción (endpoint filtra por usuario)
  
  // Módulo de Cotizaciones
  '/cotizaciones': ['cotizaciones.view_cotizacion'],
  
  // Módulo de Órdenes de Compra
  '/ordenes-compra': ['ordenes_compra.view_ordencompra'],
  
  // Módulo de Proveedores
  '/proveedores': ['proveedores.view_proveedor'],
  
  // Módulo de Clientes
  '/clientes': ['clientes.view_cliente'],
  
  // Módulo de Productos
  '/productos': ['productos.view_producto'],
  
  // Módulo de Pedidos de Servicio
  // Accesible para: Admin, Comercial, Fabricadores e Instaladores
  // El backend filtra automáticamente por asignaciones
  '/pedidos-servicio': [], // Sin restricción - backend filtra por usuario
  
  // Módulo de Manufactura/Instaladores (solo admin)
  '/instaladores': ['manufactura.view_manufactura', 'manufactura.add_manufactura'],
  
  // Configuración del sistema (solo admin con permisos de usuarios)
  '/settings': ['auth.view_user', 'auth.change_user'],
};

/**
 * Verifica si el usuario tiene permiso para acceder a una ruta
 * Se basa en el campo `role` para ADMIN, o en permisos específicos del backend
 */
export const hasRoutePermission = (user: User | null, route: string): boolean => {
  if (!user) return false;

  // Admin siempre tiene acceso a todo
  if (user.role === 'ADMIN') return true;

  // Obtener permisos requeridos para la ruta
  const requiredPermissions = ROUTE_PERMISSIONS[route];
  
  // Si la ruta no está definida, denegar acceso por defecto
  if (!requiredPermissions) return false;

  // Si la ruta no requiere permisos específicos (array vacío), permitir acceso
  if (requiredPermissions.length === 0) return true;

  // CRÍTICO: Solo usar permisos enviados por el backend
  if (user.permissions && user.permissions.length > 0) {
    // Si es superuser (tiene permiso '*'), permitir todo
    if (user.permissions.includes('*')) return true;
    
    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    return requiredPermissions.some(perm => user.permissions!.includes(perm));
  }

  // Si no hay permisos del backend, DENEGAR acceso
  return false;
};

/**
 * Verifica si el usuario tiene un permiso específico
 * @param user Usuario actual
 * @param permission Permiso a verificar (formato: 'app_label.codename')
 * @returns true si tiene el permiso, false en caso contrario
 */
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  
  // Admin siempre tiene todos los permisos
  if (user.role === 'ADMIN') return true;
  
  // Verificar si tiene el permiso específico
  if (user.permissions && user.permissions.length > 0) {
    // Si es superuser (tiene permiso '*'), permitir todo
    if (user.permissions.includes('*')) return true;
    
    // Verificar si tiene el permiso específico
    return user.permissions.includes(permission);
  }
  
  return false;
};

/**
 * Verifica si el usuario tiene alguno de los permisos especificados
 * @param user Usuario actual
 * @param permissions Array de permisos a verificar
 * @returns true si tiene al menos uno de los permisos
 */
export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
  if (!user) return false;
  
  // Admin siempre tiene todos los permisos
  if (user.role === 'ADMIN') return true;
  
  if (user.permissions && user.permissions.length > 0) {
    if (user.permissions.includes('*')) return true;
    return permissions.some(perm => user.permissions!.includes(perm));
  }
  
  return false;
};

/**
 * Obtiene todas las rutas permitidas para un usuario
 */
export const getAllowedRoutes = (user: User | null): string[] => {
  if (!user) return [];

  return Object.keys(ROUTE_PERMISSIONS).filter(route => 
    hasRoutePermission(user, route)
  );
};

/**
 * Verifica si el usuario es administrador
 */
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'ADMIN' || user.username === 'admin';
};
