import { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/redux/authSlice';
// CORRECCIÓN: Usamos llaves { } porque es una exportación nombrada, no default.
import { apiClient } from '@/lib/apiClient'; 

interface AuthContextType {
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ isLoading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      console.log('🔐 Inicializando autenticación');
      
      if (!token) {
        console.log('No hay token de acceso');
        setIsLoading(false);
        return;
      }

      try {
        // Al usar apiClient, la URL base /api/v1/ ya está configurada.
        console.log('Verificando token con /users/me/');
        const userResponse = await apiClient.get("users/me/"); 
        const userData = userResponse.data;
        
        console.log('✅ Autenticación exitosa:', userData);
        dispatch(setCredentials({ user: userData, token }));
      } catch (error: any) {
        console.error('❌ Error en inicialización de auth:', error.response?.status);
        
        // Si obtenemos 401, intentar refrescar el token
        if (error.response?.status === 401 && refreshToken) {
          console.log('Token expirado, intentando refrescar...');
          try {
            // Limpiamos si falla todo para evitar bucles.
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          } catch (refreshError) {
            console.error('❌ Error fatal en auth:', refreshError);
          }
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};