import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface Alert {
  id: string;
  severity: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  count?: number;
}

interface AlertPanelProps {
  alerts: Alert[];
}

const severityConfig = {
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    textColor: 'text-red-800',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
    textColor: 'text-yellow-800',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-800',
  },
};

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas</h3>
        <p className="text-gray-500 text-center py-4">No hay alertas pendientes</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas</h3>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}
            >
              <div className="flex items-start gap-3">
                {/* Usamos 'shrink-0' para evitar que el icono se aplaste si hay mucho texto */}
                <Icon className={`${config.iconColor} shrink-0 mt-0.5`} size={20} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`font-medium ${config.textColor}`}>{alert.title}</h4>
                    {alert.count !== undefined && (
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bgColor} ${config.textColor}`}
                      >
                        {alert.count}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${config.textColor}`}>{alert.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};