// src/hooks/useAuthTimeout.ts
import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logOut } from '@/redux/authSlice';
import toast from 'react-hot-toast';

/**
 * Hook para gestionar el cierre de sesión por inactividad y la validación del token.
 * @param timeoutMinutes - Minutos de inactividad antes de cerrar sesión.
 */
export const useAuthTimeout = (timeoutMinutes: number = 15) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Cierra la sesión del usuario, limpia el almacenamiento y redirige al login.
   */
  const handleLogout = useCallback((message?: string) => {
    dispatch(logOut());
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('last_activity');
    navigate('/login');
    if (message) {
      toast(message, { icon: '🔔' });
    }
  }, [dispatch, navigate]);

  /**
   * Reinicia el temporizador de actividad del usuario.
   */
  const resetActivityTimer = useCallback(() => {
    localStorage.setItem('last_activity', Date.now().toString());
  }, []);

  useEffect(() => {
    // Eventos que se consideran como actividad del usuario
    const activityEvents: (keyof WindowEventMap)[] = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, resetActivityTimer);
    });

    // Intervalo para comprobar la inactividad
    const inactivityInterval = setInterval(() => {
      const lastActivity = localStorage.getItem('last_activity');
      if (lastActivity) {
        const timeDiff = Date.now() - parseInt(lastActivity, 10);
        const minutesDiff = timeDiff / (1000 * 60);

        if (minutesDiff > timeoutMinutes) {
          handleLogout('Tu sesión ha expirado por inactividad.');
        }
      }
    }, 60000); // Se verifica cada minuto

    // Limpieza al desmontar el componente
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetActivityTimer);
      });
      clearInterval(inactivityInterval);
    };
  }, [timeoutMinutes, handleLogout, resetActivityTimer]);

  return { resetActivityTimer };
};