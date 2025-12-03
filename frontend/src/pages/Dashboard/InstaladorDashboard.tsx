import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {apiClient} from '@/lib/apiClient';
import { Clock, CheckCircle, MapPin, AlertTriangle } from 'lucide-react';
import { MetricCard, WorkQueue } from '../../components/dashboard';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// --- Tipos ---
interface PedidoServicio {
  id: number;
  correlativo: string;
  cliente_nombre: string;
  cliente_direccion?: string;
  cliente_telefono?: string;
  estado: string;
  fecha_inicio: string;
  fecha_programada: string;
}

// --- Sub-componentes ---
const LoadingState = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Cargando cola de instalación...</p>
    </div>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <div className="flex justify-center mb-4">
      <AlertTriangle className="h-10 w-10 text-red-500" />
    </div>
    <p className="text-red-800 font-semibold mb-2">Error al cargar la cola de instalación</p>
    <button
      onClick={onRetry}
      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Reintentar
    </button>
  </div>
);

// --- Componente Principal ---
export const InstaladorDashboard: React.FC = () => {
  const navigate = useNavigate();

  // 1. Obtener datos del usuario actual
  const { data: userData } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await apiClient.get('users/me/');
      return response.data;
    },
  });

  const instaladorId = userData?.manufactura_id;

  // 2. Obtener pedidos asignados
  const { data: pedidos, isLoading, error, refetch } = useQuery<PedidoServicio[]>({
    queryKey: ['instalador-pedidos', instaladorId],
    queryFn: async () => {
      if (!instaladorId) return [];
      const response = await apiClient.get('pedidos-servicio/', {
        params: {
          instalador: instaladorId,
          estado: 'LISTO_INSTALAR,INSTALADO',
        },
      });
      return response.data.results || response.data;
    },
    enabled: !!instaladorId,
    refetchInterval: 30000,
  });

  // 3. Lógica de Negocio (Memoizada)
  const { pedidosConPrioridad, metrics, pedidosContacto } = useMemo(() => {
    const lista = pedidos || [];
    const today = new Date();

    // Transformación y cálculo de prioridad
    const processed = lista.map(p => {
      const fechaProgramada = new Date(p.fecha_programada);
      const diffTime = fechaProgramada.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (diffDays < 2) priority = 'high';      // Urgente (< 2 días)
      else if (diffDays < 5) priority = 'medium'; // Próximo (2-5 días)

      return { ...p, priority, diffDays };
    });

    // Ordenamiento: Primero prioridad, luego fecha
    const sorted = processed.sort((a, b) => {
      const prioOrder = { high: 0, medium: 1, low: 2 };
      if (prioOrder[a.priority] !== prioOrder[b.priority]) {
        return prioOrder[a.priority] - prioOrder[b.priority];
      }
      return new Date(a.fecha_programada).getTime() - new Date(b.fecha_programada).getTime();
    });

    // Métricas
    const listos = lista.filter(p => p.estado === 'LISTO_INSTALAR').length;
    const instalados = lista.filter(p => p.estado === 'INSTALADO').length;
    const total = lista.length;

    return {
      pedidosConPrioridad: sorted,
      pedidosContacto: sorted.slice(0, 3), // Top 3 para mostrar contacto
      metrics: { listos, instalados, total }
    };
  }, [pedidos]);

  // 4. Handlers
  const handleMarcarInstalado = async (id: number) => {
    const toastId = toast.loading('Actualizando estado...');
    try {
      await apiClient.post(`pedidos-servicio/${id}/cambiar_estado/`, {
        estado: 'INSTALADO',
      });
      toast.success('Pedido marcado como instalado', { id: toastId });
      refetch();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al actualizar el estado', { id: toastId });
    }
  };

  const handleItemClick = (id: number) => {
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Instalación</h1>
          <p className="text-gray-600 mt-1">Gestiona tus instalaciones programadas</p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
          Actualizado: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Listos para Instalar"
          value={metrics.listos}
          icon={Clock}
          iconColor="text-green-500"
        />
        <MetricCard
          title="Instalados"
          value={metrics.instalados}
          icon={CheckCircle}
          iconColor="text-blue-500"
        />
        <MetricCard
          title="Total Asignados"
          value={metrics.total}
          icon={MapPin}
          iconColor="text-purple-500"
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
        role="instalador"
        onItemClick={handleItemClick}
        onAction={handleMarcarInstalado}
        actionLabel="Marcar Instalado"
      />

      {/* Información de contacto (Top 3 Prioritarios) */}
      {pedidosContacto.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-gray-500" />
            Información de Contacto Próxima
          </h3>
          <div className="space-y-3">
            {pedidosContacto.map(pedido => (
              <div key={pedido.id} className="border rounded-lg p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono font-semibold text-gray-900">
                        {pedido.correlativo}
                      </p>
                      {pedido.priority === 'high' && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">Urgente</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-800">{pedido.cliente_nombre}</p>
                    
                    <div className="mt-2 space-y-1">
                      {pedido.cliente_direccion && (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin size={14} className="flex-shrink-0 mt-0.5 text-gray-400" />
                          <span>{pedido.cliente_direccion}</span>
                        </div>
                      )}
                      {pedido.cliente_telefono && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-xs">📞</span>
                          <span>{pedido.cliente_telefono}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
          <span className="text-xl">📋</span> Guía de Instalación
        </h3>
        <ul className="text-sm text-green-800 space-y-2 ml-1">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 block"></span>
            <span>Prioridad <strong>Alta</strong> (Borde Rojo): Instalación programada en menos de 2 días.</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 block"></span>
            <span>Prioridad <strong>Media</strong> (Borde Amarillo): Instalación en 2-5 días.</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 block"></span>
            <span><strong>Importante:</strong> Contacta al cliente 24h antes para confirmar su disponibilidad.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};