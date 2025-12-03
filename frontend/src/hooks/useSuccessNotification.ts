import toast from 'react-hot-toast';

interface SuccessNotificationOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

/**
 * Hook para mostrar notificaciones de éxito consistentes
 */
export const useSuccessNotification = () => {
  const notifyUpdate = (itemsUpdated: number = 0, itemsCreated: number = 0, options: SuccessNotificationOptions = {}) => {
    const { duration = 4000, position = 'top-center' } = options;
    
    let message = '✅ Registro modificado exitosamente';
    
    if (itemsUpdated > 0 || itemsCreated > 0) {
      const details: string[] = [];
      if (itemsUpdated > 0) details.push(`${itemsUpdated} item(s) actualizado(s)`);
      if (itemsCreated > 0) details.push(`${itemsCreated} item(s) agregado(s)`);
      
      message += `\n• ${details.join('\n• ')}`;
    }
    
    console.log('🔔 notifyUpdate:', message);
    toast.success(message, {
      duration,
      position,
    });
  };

  const notifyCreate = (resource: string = 'Registro', options: SuccessNotificationOptions = {}) => {
    const { duration = 4000, position = 'top-center' } = options;
    
    const msg = `✅ ${resource} creado exitosamente`;
    console.log('🔔 notifyCreate:', msg);
    toast.success(msg, {
      duration,
      position,
    });
  };

  const notifyDelete = (resource: string = 'Registro', options: SuccessNotificationOptions = {}) => {
    const { duration = 3000, position = 'top-center' } = options;
    
    const msg = `✅ ${resource} eliminado exitosamente`;
    console.log('🔔 notifyDelete:', msg);
    toast.success(msg, {
      duration,
      position,
    });
  };

  const notifyError = (message: string, options: SuccessNotificationOptions = {}) => {
    const { duration = 5000, position = 'top-center' } = options;
    
    console.log('🔔 notifyError:', message);
    toast.error(`❌ ${message}`, {
      duration,
      position,
    });
  };

  return {
    notifyUpdate,
    notifyCreate,
    notifyDelete,
    notifyError,
  };
};

export default useSuccessNotification;
