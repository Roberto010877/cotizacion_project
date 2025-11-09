import { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/redux/authSlice';
import axiosInstance from '@/lib/axios';
import { useTranslation } from 'react-i18next';

interface AuthContextType {
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ isLoading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      console.log('Token from localStorage:', token); // Added console log
      if (token) {
        try {
          console.log('Access token found in localStorage:', token);
          const userResponse = await axiosInstance.get("/api/users/me/");
          const userData = userResponse.data;
          
          dispatch(setCredentials({ user: userData, token }));
        } catch (error) {
          console.error('Error in auth initialization:', error);
          // Log the specific error response if available
          if (axios.isAxiosError(error) && error.response) {
            console.error('Auth initialization error response:', error.response.status, error.response.data);
          }
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [dispatch]); // Removed i18n from dependencies

  return (
    <AuthContext.Provider value={{ isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};