import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

/**
 * Props para el componente ProtectedRoute
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente de ruta protegida que verifica si el usuario está autenticado
 * basándose en el estado de Redux.
 * La validación del token se maneja en un nivel superior (App.tsx).
 * @param children - Componentes hijos a renderizar si la autenticación es válida
 * @returns JSX.Element
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);

  // Renderizar hijos si está autenticado, redirigir a login si no
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;