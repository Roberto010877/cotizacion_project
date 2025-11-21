interface StatusBadgeProps {
  estado: string;
  showIcon?: boolean;
}

export const StatusBadge = ({ estado }: StatusBadgeProps) => {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    'PENDIENTE': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
    'EN_PROGRESO': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En Progreso' },
    'FABRICACION': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Fabricación' },
    'INSTALACION': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Instalación' },
    'COMPLETADO': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completado' },
    'CANCELADO': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
    'ENVIADO': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Enviado' },
    'ACEPTADO': { bg: 'bg-green-100', text: 'text-green-800', label: 'Aceptado' },
    'EN_FABRICACION': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'En Fabricación' },
    'LISTO_INSTALAR': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Listo para Instalar' },
    'INSTALADO': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Instalado' },
    'RECHAZADO': { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' },
  };

  const config = statusConfig[estado] || { bg: 'bg-gray-100', text: 'text-gray-800', label: estado };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};
