// src/hooks/useAuthTimeout.ts
import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logOut } from '@/redux/authSlice';
import toast from 'react-hot-toast';

const ACTIVITY_KEY = 'last_activity';
const CHECK_INTERVAL = 30000; // 30 segundos

/**
 * Hook para gestionar el cierre de sesión por inactividad
 * @param timeoutMinutes - Minutos de inactividad antes de cerrar sesión (default: 20 minutos)
 */
export const useAuthTimeout = (timeoutMinutes: number = 20) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const intervalRef = useRef<number | null>(null);
  const isLoggedIn = useSelector((state: any) => !!state.auth.token);

  /**
   * Cierra la sesión del usuario
   */
  const handleLogout = useCallback(() => {
    console.log('🔒 Cerrando sesión por inactividad');
    
    // Limpiar intervalo primero
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Limpiar storage
    localStorage.removeItem(ACTIVITY_KEY);
    
    // Despachar logout
    dispatch(logOut());
    
    // Notificar y redirigir
    toast.error('Tu sesión ha expirado por inactividad.');
    navigate('/login', { replace: true });
  }, [dispatch, navigate]);

  /**
   * Actualiza el timestamp de última actividad
   */
  const updateActivity = useCallback(() => {
    if (isLoggedIn) {
      localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
    }
  }, [isLoggedIn]);

  /**
   * Verifica si debe cerrar sesión por inactividad
   */
  const checkInactivity = useCallback(() => {
    // No verificar si no hay sesión
    if (!isLoggedIn) {
      return;
    }
    
    const lastActivity = localStorage.getItem(ACTIVITY_KEY);
    
    // Si no hay registro, crear uno y continuar
    if (!lastActivity) {
      updateActivity();
      return;
    }
    
    const timeDiff = Date.now() - parseInt(lastActivity, 10);
    const minutesDiff = timeDiff / (1000 * 60);
    
    // Solo cerrar sesión si excede el tiempo
    if (minutesDiff > timeoutMinutes) {
      console.log(`⏰ Inactividad: ${minutesDiff.toFixed(1)} min > ${timeoutMinutes} min`);
      handleLogout();
    }
  }, [isLoggedIn, timeoutMinutes, handleLogout, updateActivity]);

  useEffect(() => {
    // Solo iniciar si hay sesión activa
    if (!isLoggedIn) {
      return;
    }

    console.log(`🛡️ Timeout de inactividad: ${timeoutMinutes} minutos`);
    
    // Registrar actividad inicial
    updateActivity();
    
    // Eventos que indican actividad del usuario
    const events: (keyof WindowEventMap)[] = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ];
    
    // Agregar listeners
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Intervalo de verificación
    intervalRef.current = setInterval(checkInactivity, CHECK_INTERVAL);
    
    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoggedIn, timeoutMinutes, checkInactivity, updateActivity]);

  return { updateActivity };
};