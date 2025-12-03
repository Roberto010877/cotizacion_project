import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface ConfirmationBadgeProps {
  isVisible: boolean;
  message?: string;
}

/**
 * Componente visual de confirmación que aparece brevemente después de una acción exitosa
 */
export function ConfirmationBadge({ isVisible, message = 'Guardado' }: ConfirmationBadgeProps) {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
        <Check size={20} />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}

export default ConfirmationBadge;
