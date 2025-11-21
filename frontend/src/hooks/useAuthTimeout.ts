// src/hooks/useAuthTimeout.ts
import { useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logOut } from '@/redux/authSlice';
import toast from 'react-hot-toast';

/**
 * Hook para gestionar el cierre de sesión por inactividad
 * @param timeoutMinutes - Minutos de inactividad antes de cerrar sesión (default: 1 minuto para testing)
 */
export const useAuthTimeout = (timeoutMinutes: number = 5) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
const intervalRef = useRef<number | null>(null);
  /**
   * Cierra la sesión del usuario de manera completa
   */
  const handleLogout = useCallback((message?: string) => {
    console.log('🔒 Ejecutando logout por inactividad...');
    
    // 1. Limpiar localStorage primero
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('last_activity');
    
    // 2. Despachar acción de logout
    dispatch(logOut());
    
    // 3. Mostrar notificación
    if (message) {
      toast.error(message);
    }
    
    // 4. Redirigir forzosamente
    navigate('/login', { replace: true });
    
    // 5. Limpiar intervalo
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [dispatch, navigate]);

  /**
   * Reinicia el temporizador de actividad SOLO si hay sesión activa
   */
  const resetActivityTimer = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      localStorage.setItem('last_activity', Date.now().toString());
      console.log('🔄 Actividad detectada - Timer reiniciado');
    }
  }, []);

  /**
   * Verifica si debe ejecutarse el logout por inactividad
   */
  const checkInactivity = useCallback(() => {
    const token = localStorage.getItem('access_token');
    const lastActivity = localStorage.getItem('last_activity');
    
    // Si no hay token, no hacer nada
    if (!token) {
      console.log('❌ No hay token - No verificar inactividad');
      return;
    }
    
    // Si no hay registro de actividad, crear uno
    if (!lastActivity) {
      console.log('📝 Creando registro de actividad inicial');
      localStorage.setItem('last_activity', Date.now().toString());
      return;
    }
    
    const timeDiff = Date.now() - parseInt(lastActivity, 10);
    const minutesDiff = timeDiff / (1000 * 60);
    
    console.log(`⏰ Tiempo inactivo: ${minutesDiff.toFixed(2)} minutos | Límite: ${timeoutMinutes} minutos`);
    
    if (minutesDiff > timeoutMinutes) {
      console.log('🚨 Tiempo de inactividad excedido - Cerrando sesión');
      handleLogout('Tu sesión ha expirado por inactividad.');
    }
  }, [timeoutMinutes, handleLogout]);

  useEffect(() => {
    // Verificar inmediatamente al montar el hook
    checkInactivity();
    
    // Eventos que reinician el timer
    const activityEvents: (keyof WindowEventMap)[] = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 
      'click', 'keydown', 'wheel', 'resize'
    ];
    
    // Agregar event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, resetActivityTimer, { passive: true });
    });

    // Configurar intervalo de verificación (cada 10 segundos)
    intervalRef.current = setInterval(checkInactivity, 10000);
    
    console.log(`🛡️ Hook de inactividad iniciado - Cierre en ${timeoutMinutes} minuto(s)`);

    // Cleanup
    return () => {
      console.log('🧹 Limpiando hook de inactividad');
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetActivityTimer);
      });
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeoutMinutes, checkInactivity, resetActivityTimer]);

  return { resetActivityTimer };
};