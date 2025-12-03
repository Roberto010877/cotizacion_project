import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { hasRoutePermission } from '@/utils/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Props para el componente RoleProtectedRoute
 */
interface RoleProtectedRouteProps {
  children: React.ReactNode;
  route: string;
}

/**
 * Componente que muestra cuando el usuario no tiene permisos
 */
const AccessDenied = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <ShieldAlert className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-red-600">Área Restringida</CardTitle>
          <CardDescription className="text-base">
            Esta sección requiere permisos de administrador para acceder a la gestión de usuarios y configuraciones del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Para solicitar acceso, contacta al <strong>administrador del sistema</strong>
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/">
              <Button>Ir al Panel Principal</Button>
            </Link>
            <Link to="/mis-tareas">
              <Button variant="outline">Volver Atrás</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Componente de ruta protegida por roles que verifica si el usuario
 * tiene permiso para acceder a una ruta específica basándose en sus grupos.
 * 
 * @param children - Componentes hijos a renderizar si el usuario tiene permiso
 * @param route - Ruta que se está protegiendo
 * @returns JSX.Element
 */
const RoleProtectedRoute = ({ children, route }: RoleProtectedRouteProps) => {
  const user = useSelector((state: RootState) => state.auth.user);

  // DEBUG: Log para ver qué está pasando
  console.log('🔐 RoleProtectedRoute:', {
    route,
    user: {
      username: user?.username,
      role: user?.role,
      groups: user?.groups,
      permissions: user?.permissions,
      permissionsCount: user?.permissions?.length || 0
    }
  });

  // Verificar si el usuario tiene permiso para acceder a esta ruta
  const hasPermission = hasRoutePermission(user, route);
  
  console.log('🔐 Permiso verificado:', hasPermission);

  // Si no tiene permiso, mostrar página de acceso denegado
  if (!hasPermission) {
    console.log('❌ ACCESO DENEGADO a', route);
    return <AccessDenied />;
  }

  console.log('✅ ACCESO PERMITIDO a', route);
  // Si tiene permiso, renderizar los componentes hijos
  return <>{children}</>;
};

export default RoleProtectedRoute;
