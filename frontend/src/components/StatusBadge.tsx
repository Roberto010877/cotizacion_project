import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  CheckSquare2,
  Wrench,
  Package,
} from 'lucide-react';
import { useAppTranslation } from '@/i18n/hooks';

type EstadoPedido = 'ENVIADO' | 'ACEPTADO' | 'EN_FABRICACION' | 'LISTO_INSTALAR' | 'INSTALADO' | 'COMPLETADO' | 'RECHAZADO' | 'CANCELADO';

interface StatusBadgeProps {
  estado: EstadoPedido;
  variant?: 'default' | 'outline';
  showIcon?: boolean;
  className?: string;
}

const getEstadoConfig = (t: any) => {
  return {
    ENVIADO: {
      label: t('pedidos-servicio:status_sent'),
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
      icon: <Clock className="w-4 h-4" />,
    },
    ACEPTADO: {
      label: t('pedidos-servicio:status_accepted'),
      bgColor: 'bg-cyan-100',
      textColor: 'text-cyan-800',
      borderColor: 'border-cyan-300',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    EN_FABRICACION: {
      label: t('pedidos-servicio:status_in_fabrication'),
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-300',
      icon: <Wrench className="w-4 h-4" />,
    },
    LISTO_INSTALAR: {
      label: t('pedidos-servicio:status_ready_install'),
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
      icon: <Package className="w-4 h-4" />,
    },
    INSTALADO: {
      label: t('pedidos-servicio:status_installed'),
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-800',
      borderColor: 'border-indigo-300',
      icon: <CheckSquare2 className="w-4 h-4" />,
    },
    COMPLETADO: {
      label: t('pedidos-servicio:status_completed'),
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    RECHAZADO: {
      label: t('pedidos-servicio:status_rejected'),
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
      icon: <XCircle className="w-4 h-4" />,
    },
    CANCELADO: {
      label: t('pedidos-servicio:status_cancelled'),
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-300',
      icon: <AlertCircle className="w-4 h-4" />,
    },
  } as Record<EstadoPedido, any>;
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  estado,
  variant = 'default',
  showIcon = true,
  className = '',
}) => {
  const { t } = useAppTranslation(['pedidos-servicio']);
  const ESTADO_CONFIG = getEstadoConfig(t);
  const config = ESTADO_CONFIG[estado];

  // Fallback si el estado no es válido
  if (!config) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span>{t('pedidos-servicio:status_unknown') || 'Unknown'}</span>
      </div>
    );
  }

  if (variant === 'outline') {
    return (
      <div
        className={`
          inline-flex items-center gap-2 px-3 py-1 rounded-full
          border-2 ${config.borderColor}
          ${config.textColor}
          text-sm font-medium
          ${className}
        `}
      >
        {showIcon && config.icon}
        <span>{config.label}</span>
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1 rounded-full
        ${config.bgColor} ${config.textColor}
        text-sm font-medium
        ${className}
      `}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </div>
  );
};

export default StatusBadge;
