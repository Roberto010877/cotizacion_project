import React from 'react';

interface WorkItem {
  id: number;
  correlativo: string;
  cliente: string;
  fecha_inicio: string;
  estado: string;
  priority?: 'high' | 'medium' | 'low';
}

interface WorkQueueProps {
  items: WorkItem[];
  role: 'fabricador' | 'instalador';
  onItemClick?: (id: number) => void;
  onAction?: (id: number) => void;
  actionLabel?: string;
}

export const WorkQueue: React.FC<WorkQueueProps> = ({
  items,
  role,
  onItemClick,
  onAction,
  actionLabel,
}) => {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'medium':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges: { [key: string]: string } = {
      ACEPTADO: 'bg-blue-100 text-blue-800',
      EN_FABRICACION: 'bg-purple-100 text-purple-800',
      LISTO_INSTALAR: 'bg-green-100 text-green-800',
      INSTALADO: 'bg-gray-100 text-gray-800',
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {role === 'fabricador' ? 'Cola de Fabricación' : 'Cola de Instalación'}
        </h3>
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay items pendientes</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg ${getPriorityColor(item.priority)} ${
                  onItemClick ? 'cursor-pointer hover:shadow-md' : ''
                } transition-shadow`}
                onClick={() => onItemClick?.(item.id)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-semibold text-gray-900">
                        {item.correlativo}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getEstadoBadge(
                          item.estado
                        )}`}
                      >
                        {item.estado.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{item.cliente}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Inicio: {new Date(item.fecha_inicio).toLocaleDateString()}
                    </p>
                  </div>
                  {onAction && actionLabel && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction(item.id);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {actionLabel}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
