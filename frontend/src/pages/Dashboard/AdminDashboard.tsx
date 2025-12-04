import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Package, 
  Users, 
  Clock, 
  TrendingUp,
  FileText,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import {apiClient} from '@/lib/apiClient';
import { MetricCard, StatusGrid, AlertPanel, Timeline } from '../../components/dashboard';
import type { Alert } from '../../components/dashboard/AlertPanel';

// --- Tipos ---
interface DashboardMetrics {
  metrics: {
    total_pedidos: number;
    pedidos_activos: number;
    total_clientes: number;
    pedidos_mes_actual: number;
    trend_percentage: number;
    trend_up: boolean;
  };
  estados: { [key: string]: number };
  alerts: Alert[];
  recent_activity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user?: string;
  }>;
}

// --- Configuración Estática ---
const ESTADOS_INFO = [
  { estado: 'BORRADOR', label: 'Borrador', color: 'bg-gray-500' },
  { estado: 'ACEPTADO', label: 'Aceptado', color: 'bg-blue-500' },
  { estado: 'EN_FABRICACION', label: 'Fabricación', color: 'bg-purple-500' },
  { estado: 'LISTO_INSTALAR', label: 'Listo', color: 'bg-green-500' },
  { estado: 'INSTALADO', label: 'Instalado', color: 'bg-indigo-500' },
  { estado: 'COMPLETADO', label: 'Completado', color: 'bg-teal-500' },
];

const QUICK_ACTIONS = [
  { 
    label: 'Nuevo Pedido', 
    path: '/pedidos-servicio', // Asumo que va a la lista, o '/pedidos-servicio/nuevo' si existe ruta directa
    icon: FileText, 
    colorClass: 'text-blue-500', 
    hoverClass: 'hover:border-blue-500 hover:bg-blue-50' 
  },
  { 
    label: 'Clientes', 
    path: '/clientes', 
    icon: Users, 
    colorClass: 'text-green-500', 
    hoverClass: 'hover:border-green-500 hover:bg-green-50' 
  },
  { 
    label: 'Instaladores', 
    path: '/instaladores', 
    icon: Wrench, 
    colorClass: 'text-purple-500', 
    hoverClass: 'hover:border-purple-500 hover:bg-purple-50' 
  },
  { 
    label: 'Cotizaciones', 
    path: '/cotizaciones', 
    icon: FileText, 
    colorClass: 'text-orange-500', 
    hoverClass: 'hover:border-orange-500 hover:bg-orange-50' 
  },
];

// --- Sub-componentes ---

const LoadingState = ({ t }: { t: any }) => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">{t('loading_dashboard')}</p>
    </div>
  </div>
);

const EmptyDatabaseState = ({ onNavigate, onRefetch }: { onNavigate: (path: string) => void, onRefetch: () => void }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center animate-in fade-in duration-500">
    <div className="flex flex-col items-center space-y-4">
      <FileText className="h-16 w-16 text-blue-400" />
      <div>
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Base de datos vacía</h3>
        <p className="text-blue-700 mb-4">
          No hay pedidos ni clientes registrados aún. Comienza creando tu primer pedido de servicio.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onNavigate('/pedidos-servicio/nuevo')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Crear Primer Pedido
        </button>
        <button
          onClick={onRefetch}
          className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          Actualizar
        </button>
      </div>
    </div>
  </div>
);

const WelcomeState = ({ onNavigate }: { onNavigate: (path: string) => void }) => (
  <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 text-center mb-6">
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-blue-100 p-4 rounded-full">
        <FileText className="h-12 w-12 text-blue-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-blue-900 mb-2">¡Bienvenido a CotiDomo!</h3>
        <p className="text-blue-700 text-lg mb-1">Tu sistema está listo para comenzar</p>
        <p className="text-blue-600 mb-6">Crea tu primer pedido de servicio o registra un cliente para empezar</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onNavigate('/pedidos-servicio/nuevo')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <Wrench className="h-5 w-5" />
          Crear Primer Pedido
        </button>
        <button
          onClick={() => onNavigate('/clientes/nuevo')}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <Users className="h-5 w-5" />
          Registrar Cliente
        </button>
      </div>
    </div>
  </div>
);

const ErrorState = ({ error, onRefetch, t }: { error: any, onRefetch: () => void, t: any }) => {
  const errorMessage = error?.response?.data?.detail || error?.response?.data?.error || 'Error al cargar el dashboard';
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <p className="text-red-800 mb-2 font-semibold">Error al cargar las métricas del panel</p>
      <p className="text-red-600 text-sm mb-4">{errorMessage}</p>
      <button
        onClick={onRefetch}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        {t('retry')}
      </button>
    </div>
  );
};

// --- Componente Principal ---

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['dashboard']);

  // React Query maneja el refetch on focus automáticamente por defecto
  const { data, isLoading, error, refetch } = useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await apiClient.get('dashboard/metrics/');
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Funciones de ayuda
  const handleEstadoFilter = (estado: string) => {
    navigate(`/pedidos-servicio?estado=${estado}`);
  };

  // Preparar datos (Memoizados para evitar recálculos en renders)
  const { metrics, statusItems, alerts, activities } = useMemo(() => {
    if (!data) return { metrics: null, statusItems: [], alerts: [], activities: [] };

    const _statusItems = ESTADOS_INFO.map((info) => ({
      label: info.label,
      value: data.estados[info.estado] || 0,
      color: info.color,
      estado: info.estado,
    }));

    return {
      metrics: data.metrics,
      statusItems: _statusItems,
      alerts: data.alerts || [],
      activities: data.recent_activity || []
    };
  }, [data]);

  // --- Lógica de Renderizado ---

  if (isLoading) return <LoadingState t={t} />;

  // Manejo de error especial: Base de datos vacía (Backend retorna error o estructura vacía)
  const isDatabaseEmptyError = error && (
    (error as any)?.response?.data?.detail?.includes('no hay datos') ||
    (error as any)?.response?.data?.detail?.includes('No hay datos') ||
    (error as any)?.response?.status === 500 // Asumiendo que 500 puede ser DB vacía según tu código original
  );

  if (isDatabaseEmptyError) {
    return <EmptyDatabaseState onNavigate={navigate} onRefetch={refetch} />;
  }

  if (error) {
    return <ErrorState error={error} onRefetch={refetch} t={t} />;
  }

  // Estado de "Bienvenida" (Data cargó ok, pero contadores en 0)
  const isFreshSystem = metrics?.total_pedidos === 0 && metrics?.total_clientes === 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-1">Visión completa del sistema</p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
          Última actualización: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Welcome Banner */}
      {isFreshSystem && <WelcomeState onNavigate={navigate} />}

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Pedidos"
          value={metrics?.total_pedidos || 0}
          icon={Package}
          iconColor="text-blue-500"
        />
        <MetricCard
          title="Pedidos Activos"
          value={metrics?.pedidos_activos || 0}
          icon={Clock}
          iconColor="text-purple-500"
        />
        <MetricCard
          title="Total Clientes"
          value={metrics?.total_clientes || 0}
          icon={Users}
          iconColor="text-green-500"
        />
        <MetricCard
          title="Pedidos Este Mes"
          value={metrics?.pedidos_mes_actual || 0}
          icon={TrendingUp}
          iconColor="text-orange-500"
          trend={`${metrics?.trend_percentage || 0}%`}
          trendUp={metrics?.trend_up}
        />
      </div>

      {/* Estados de pedidos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pedidos por Estado</h2>
        <StatusGrid items={statusItems} onFilter={handleEstadoFilter} />
      </div>

      {/* Alertas y Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertPanel alerts={alerts} />
        <Timeline activities={activities} title="Actividad Reciente" />
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 transition-all duration-200 ${action.hoverClass} group`}
            >
              <action.icon className={`${action.colorClass} mb-2 group-hover:scale-110 transition-transform`} size={32} />
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};