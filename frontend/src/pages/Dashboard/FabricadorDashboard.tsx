import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {apiClient} from '@/lib/apiClient';
import { Clock, CheckCircle, Package, AlertTriangle } from 'lucide-react';
import { MetricCard, WorkQueue } from '../../components/dashboard';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// --- Tipos ---
interface PedidoServicio {
  id: number;
  correlativo: string;
  cliente_nombre: string;
  estado: string;
  fecha_inicio: string;
  fecha_programada: string;
}

// --- Sub-componentes ---
const LoadingState = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Cargando cola de fabricación...</p>
    </div>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <div className="flex justify-center mb-4">
      <AlertTriangle className="h-10 w-10 text-red-500" />
    </div>
    <p className="text-red-800 font-semibold mb-2">Error al cargar la cola de trabajo</p>
    <button
      onClick={onRetry}
      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Reintentar
    </button>
  </div>
);

// --- Componente Principal ---
export const FabricadorDashboard: React.FC = () => {
  const navigate = useNavigate();

  // 1. Obtener datos del usuario actual
  const { data: userData } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await apiClient.get('users/me/');
      return response.data;
    },
  });

  const fabricadorId = userData?.manufactura_id;

  // 2. Obtener pedidos asignados
  const { data: pedidos, isLoading, error, refetch } = useQuery<PedidoServicio[]>({
    queryKey: ['fabricador-pedidos', fabricadorId],
    queryFn: async () => {
      if (!fabricadorId) return [];
      const response = await apiClient.get('pedidos-servicio/', {
        params: {
          fabricador: fabricadorId,
          estado: 'ACEPTADO,EN_FABRICACION',
        },
      });
      return response.data.results || response.data;
    },
    enabled: !!fabricadorId,
    refetchInterval: 30000,
  });

  // 3. Lógica de Negocio (Memoizada)
  // Calcula prioridades, ordena la lista y genera métricas
  const { pedidosConPrioridad, metrics } = useMemo(() => {
    const lista = pedidos || [];
    const today = new Date();

    // Transformación y cálculo de prioridad
    const processed = lista.map(p => {
      const fechaProgramada = new Date(p.fecha_programada);
      // Diferencia en días
      const diffTime = fechaProgramada.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (diffDays < 3) priority = 'high';
      else if (diffDays < 7) priority = 'medium';

      return { ...p, priority, diffDays };
    });

    // Ordenamiento: Primero prioridad (High > Medium > Low), luego fecha más próxima
    const sorted = processed.sort((a, b) => {
      const prioOrder = { high: 0, medium: 1, low: 2 };
      if (prioOrder[a.priority] !== prioOrder[b.priority]) {
        return prioOrder[a.priority] - prioOrder[b.priority];
      }
      return new Date(a.fecha_programada).getTime() - new Date(b.fecha_programada).getTime();
    });

    // Métricas
    const pendientes = lista.filter(p => p.estado === 'ACEPTADO').length;
    const enProceso = lista.filter(p => p.estado === 'EN_FABRICACION').length;
    const total = lista.length;

    return {
      pedidosConPrioridad: sorted,
      metrics: { pendientes, enProceso, total }
    };
  }, [pedidos]);

  // 4. Handlers
  const handleMarcarListo = async (id: number) => {
    // Optimistic update o feedback de carga podría implementarse aquí
    const toastId = toast.loading('Actualizando estado...');
    try {
      await apiClient.post(`pedidos-servicio/${id}/cambiar_estado/`, {
        estado: 'LISTO_INSTALAR', // Asegúrate que el backend espera 'estado' o 'nuevo_estado' según tu API
      });
      toast.success('Pedido marcado como listo para instalar', { id: toastId });
      refetch();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al actualizar el estado', { id: toastId });
    }
  };

  const handleItemClick = (id: number) => {
    // Navegación: Podría ir al detalle específico si la ruta existe, 
    // por ahora mantenemos la navegación a la lista general pero podríamos pasar filtro
    navigate(`/pedidos-servicio?id=${id}`);
  };

  // --- Renderizado ---

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Fabricación</h1>
          <p className="text-gray-600 mt-1">Gestiona tu cola de trabajo</p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
          Actualizado: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Pendientes"
          value={metrics.pendientes}
          icon={Clock}
          iconColor="text-orange-500"
        />
        <MetricCard
          title="En Proceso"
          value={metrics.enProceso}
          icon={Package}
          iconColor="text-purple-500"
        />
        <MetricCard
          title="Total Asignados"
          value={metrics.total}
          icon={CheckCircle}
          iconColor="text-blue-500"
        />
      </div>

      {/* Cola de trabajo */}
      <WorkQueue
        items={pedidosConPrioridad.map(p => ({
          id: p.id,
          correlativo: p.correlativo,
          cliente: p.cliente_nombre,
          fecha_inicio: p.fecha_inicio,
          estado: p.estado,
          priority: p.priority,
        }))}
        role="fabricador"
        onItemClick={handleItemClick}
        onAction={handleMarcarListo}
        actionLabel="Listo para Instalar"
      />

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <span className="text-xl">ℹ️</span> Instrucciones del Sistema
        </h3>
        <ul className="text-sm text-blue-800 space-y-2 ml-1">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 block"></span>
            <span>Los pedidos con borde <strong>rojo</strong> tienen alta prioridad (&lt;3 días para entrega).</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 block"></span>
            <span>Los pedidos con borde <strong>amarillo</strong> tienen prioridad media (3-7 días).</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 block"></span>
            <span>Marca como <strong>"Listo para Instalar"</strong> solo cuando el producto esté terminado y empaquetado.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};