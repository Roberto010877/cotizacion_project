import React, { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {apiClient} from '@/lib/apiClient';
import { 
  Package, 
  Clock, 
  CheckCircle,
  PlusCircle,
  Calendar,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { MetricCard, StatusGrid } from '../../components/dashboard';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreatePedidoServicioForm from '@/components/forms/CreatePedidoServicioForm';
import { hasPermission } from '@/utils/permissions';
import useCurrentUser from '@/hooks/useCurrentUser';
import toast from 'react-hot-toast';
import { useAppTranslation } from '@/i18n/hooks';

// --- Tipos ---
interface PedidoServicio {
  id: number;
  correlativo: string;
  cliente_nombre: string;
  estado: string;
  estado_display: string;
  fecha_inicio: string;
  fecha_programada: string;
  created_at: string;
}

interface PedidosResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PedidoServicio[];
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

// --- Sub-componentes de Estado ---

const LoadingState = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Cargando mis pedidos...</p>
    </div>
  </div>
);

const PermissionErrorState = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center max-w-md">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin permisos de acceso</h3>
      <p className="text-gray-600 mb-4">No tienes permisos para ver pedidos de servicio.</p>
      <p className="text-sm text-gray-500">Contacta al administrador para solicitar acceso.</p>
    </div>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <div className="flex justify-center mb-4">
      <AlertTriangle className="h-10 w-10 text-red-500" />
    </div>
    <p className="text-red-800 font-semibold mb-2">Error al cargar tus pedidos</p>
    <button
      onClick={onRetry}
      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Reintentar
    </button>
  </div>
);

// --- Componente Principal ---

export const ComercialDashboard: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { t } = useAppTranslation(['pedidos_servicio', 'common']);
  
  // Estado local
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [clientes, setClientes] = useState<Array<{ id: number; nombre: string; direccion?: string; telefono?: string; email?: string }>>([]);

  // Permisos
  const canCreatePedido = hasPermission(currentUser, 'pedidos_servicio.add_pedidoservicio');

  // React Query
  const { data: misPedidosData, isLoading, error, refetch } = useQuery<PedidosResponse>({
    queryKey: ['mis-pedidos'],
    queryFn: async () => {
      const response = await apiClient.get('dashboard/mis-pedidos/');
      return response.data;
    },
    refetchInterval: 30000,
  });

  // Cargar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await apiClient.get('clientes/?page_size=1000');
        const clientesList = response.data.results.map((cliente: any) => ({
          id: cliente.id,
          nombre: cliente.nombre,
          direccion: cliente.direccion || '',
          telefono: cliente.telefono || '',
          email: cliente.email || '',
        }));
        setClientes(clientesList);
      } catch (error) {
        console.error('Error cargando clientes:', error);
      }
    };
    fetchClientes();
  }, []);

  // --- Lógica de Datos (Memoizada) ---
  
  const { 
    metrics, 
    statusItems, 
    pedidosActivosList, 
    pedidosCompletadosRecientes 
  } = useMemo(() => {
    const pedidos = misPedidosData?.results || [];
    const now = new Date();

    // Métricas
    const activos = pedidos.filter(p => !['COMPLETADO', 'CANCELADO'].includes(p.estado)).length;
    const completados = pedidos.filter(p => p.estado === 'COMPLETADO').length;
    const mesActual = pedidos.filter(p => {
      const created = new Date(p.created_at);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    // Conteo por estado
    const counts: { [key: string]: number } = {};
    pedidos.forEach(p => counts[p.estado] = (counts[p.estado] || 0) + 1);

    const _statusItems = ESTADOS_INFO.map((info) => ({
      label: info.label,
      value: counts[info.estado] || 0,
      color: info.color,
      estado: info.estado,
    }));

    // Listas
    const _activosList = pedidos
      .filter(p => !['COMPLETADO', 'CANCELADO'].includes(p.estado))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    const _completadosList = pedidos
      .filter(p => p.estado === 'COMPLETADO')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);

    return {
      metrics: {
        total: pedidos.length,
        activos,
        completados,
        mesActual
      },
      statusItems: _statusItems,
      pedidosActivosList: _activosList,
      pedidosCompletadosRecientes: _completadosList
    };
  }, [misPedidosData]);

  // --- Handlers ---

  const handleCreateClick = () => {
    if (!canCreatePedido) {
      toast.error('No tiene permisos para crear pedidos');
      return;
    }
    setFormErrors({});
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsLoadingForm(false);
    setFormErrors({});
  };

  // Helper para badge de estado
  const getEstadoBadge = (estado: string) => {
    const info = ESTADOS_INFO.find(e => e.estado === estado);
    return info ? `${info.color} text-white` : 'bg-gray-500 text-white';
  };

  // --- Handler Principal de Creación ---
  const handleCreateSubmit = async (data: any) => {
    setIsLoadingForm(true);
    try {
      console.time('⏱️ Creación de pedido');
      
      const pedidoData = {
        cliente_id: data.cliente,
        solicitante: data.solicitante,
        supervisor: data.supervisor,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        observaciones: data.observaciones,
        manufacturador_id: data.fabricador_id,
        instalador_id: data.instalador_id,
        estado: 'ENVIADO',
      };

      const itemsData = data.items.map((item: any) => ({
        ambiente: item.ambiente,
        modelo: item.modelo,
        tejido: item.tejido,
        largura: parseFloat(item.largura),
        altura: parseFloat(item.altura),
        cantidad_piezas: parseInt(item.cantidad_piezas),
        posicion_tejido: item.posicion_tejido,
        lado_comando: item.lado_comando,
        acionamiento: item.accionamiento,
        observaciones: item.observaciones,
      }));

      await apiClient.post('pedidos-servicio/crear-con-items/', {
        pedido: pedidoData,
        items: itemsData
      });

      console.timeEnd('⏱️ Creación de pedido');
      
      toast.success(t('pedidos_servicio:order_created_success', { count: itemsData.length }), {
        duration: 4000,
        icon: '✅',
      });
      
      await refetch();
      setIsCreating(false);
      
    } catch (error: any) {
      console.error('Error creando pedido:', error);
      
      const backendErrors = error.response?.data?.errors || {};
      const errorDetail = error.response?.data?.detail || t('pedidos_servicio:error_creating_order');
      const newFormErrors: { [key: string]: string } = {};
      
      // Mapeo de errores de items
      if (backendErrors.items) {
        backendErrors.items.forEach((itemErrors: any, index: number) => {
          if (itemErrors) {
            Object.keys(itemErrors).forEach(field => {
              const itemId = data.items[index]?.id; // Ojo: CreateForm usa items internos, asegúrate que tengan ID temporal si aplica
              // Nota: En CreateForm generalmente no tenemos ID real aún, usamos index
              // Si el backend devuelve array de errores posicional, usamos index para mapear si es posible
              // O simplificamos mostrando error general del item
              if (itemId) {
                 const msgs = itemErrors[field];
                 const txt = Array.isArray(msgs) ? msgs.join(', ') : JSON.stringify(msgs);
                 newFormErrors[`${field}-${itemId}`] = txt;
              }
            });
          }
        });
      }
      
      // Mapeo de errores generales
      Object.keys(backendErrors).forEach(field => {
        if (field !== 'items') {
          const msgs = backendErrors[field];
          newFormErrors[field] = Array.isArray(msgs) ? msgs.join(', ') : msgs;
        }
      });
      
      setFormErrors(newFormErrors);
      
      const errorCount = Object.keys(newFormErrors).length;
      if (errorCount > 0) {
        toast.error(`Por favor corrija ${errorCount} error(es) en el formulario.`);
      } else {
        toast.error(errorDetail);
      }
    } finally {
      setIsLoadingForm(false);
    }
  };

  // --- Renderizado ---

  if (isLoading) return <LoadingState />;

  if (error) {
    const isPermissionError = (error as any)?.response?.status === 403;
    if (isPermissionError) return <PermissionErrorState />;
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
          <p className="text-gray-600 mt-1">Gestiona tus pedidos de servicio</p>
        </div>
        <button
          onClick={handleCreateClick}
          disabled={!canCreatePedido}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium shadow-lg transition-all ${
            canCreatePedido
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={canCreatePedido ? 'Crear nuevo pedido' : 'No tiene permisos para crear pedidos'}
        >
          <PlusCircle size={20} />
          Crear Nuevo Pedido
        </button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Mis Pedidos"
          value={metrics.total}
          icon={Package}
          iconColor="text-blue-500"
        />
        <MetricCard
          title="Pedidos Activos"
          value={metrics.activos}
          icon={Clock}
          iconColor="text-orange-500"
        />
        <MetricCard
          title="Completados"
          value={metrics.completados}
          icon={CheckCircle}
          iconColor="text-green-500"
        />
        <MetricCard
          title="Este Mes"
          value={metrics.mesActual}
          icon={Calendar}
          iconColor="text-purple-500"
        />
      </div>

      {/* Estados de mis pedidos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mis Pedidos por Estado</h2>
        <StatusGrid items={statusItems} />
      </div>

      {/* Pedidos activos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pedidos Activos</h2>
        {pedidosActivosList.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tienes pedidos activos</p>
        ) : (
          <div className="space-y-3">
            {pedidosActivosList.map(pedido => (
              <div
                key={pedido.id}
                onClick={() => navigate(`/pedidos-servicio`)}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-semibold text-gray-900">
                        {pedido.correlativo}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getEstadoBadge(pedido.estado)}`}>
                        {pedido.estado_display}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{pedido.cliente_nombre}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Programado: {new Date(pedido.fecha_programada).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pedidos completados recientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Completados Recientemente</h2>
        {pedidosCompletadosRecientes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay pedidos completados aún</p>
        ) : (
          <div className="space-y-3">
            {pedidosCompletadosRecientes.map(pedido => (
              <div
                key={pedido.id}
                className="border border-green-200 bg-green-50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-semibold text-gray-900">
                        {pedido.correlativo}
                      </span>
                      <CheckCircle className="text-green-600" size={16} />
                    </div>
                    <p className="text-sm text-gray-700">{pedido.cliente_nombre}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de creación */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{t('pedidos_servicio:create_new')}</DialogTitle>
          </DialogHeader>
          <CreatePedidoServicioForm
            clientes={clientes}
            isLoading={isLoadingForm}
            externalErrors={formErrors}
            onCancel={handleCancel}
            onSubmit={handleCreateSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};