import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppTranslation } from '@/i18n/hooks';
import type { PedidoServicio } from '@/hooks/usePaginatedPedidosServicio';
import {apiClient} from '@/lib/apiClient';
import toast from 'react-hot-toast';
import OrderItemCard from '@/components/OrderItemCard';
import { User, UserCheck, Phone, MapPin, Download } from 'lucide-react';
import useCurrentUser from '@/hooks/useCurrentUser';

// --- Tipos y Constantes ---

interface PedidoDetailModalProps {
  pedido: PedidoServicio | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged?: () => void;
}

// Mapeo de colores estático para evitar recrearlo en cada render
const STATUS_COLORS: Record<string, { badge: string; border: string }> = {
  'ENVIADO': { badge: 'bg-blue-50 border-blue-200 text-blue-700', border: 'bg-blue-500' },
  'ACEPTADO': { badge: 'bg-green-50 border-green-200 text-green-700', border: 'bg-green-500' },
  'EN_FABRICACION': { badge: 'bg-yellow-50 border-yellow-200 text-yellow-700', border: 'bg-yellow-500' },
  'LISTO_INSTALAR': { badge: 'bg-purple-50 border-purple-200 text-purple-700', border: 'bg-purple-500' },
  'INSTALADO': { badge: 'bg-cyan-50 border-cyan-200 text-cyan-700', border: 'bg-cyan-500' },
  'COMPLETADO': { badge: 'bg-emerald-50 border-emerald-200 text-emerald-700', border: 'bg-emerald-500' },
  'RECHAZADO': { badge: 'bg-red-50 border-red-200 text-red-700', border: 'bg-red-500' },
  'CANCELADO': { badge: 'bg-gray-50 border-gray-200 text-gray-700', border: 'bg-gray-500' },
};

const DEFAULT_COLOR = { badge: 'bg-gray-50 border-gray-200 text-gray-700', border: 'bg-gray-500' };

export default function PedidoDetailModal({
  pedido,
  isOpen,
  onClose,
  onStatusChanged,
}: PedidoDetailModalProps) {
  const { t } = useAppTranslation(['pedidos_servicio', 'common', 'navigation']);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pedidoCompleto, setPedidoCompleto] = useState<PedidoServicio | null>(null);
  const currentUser = useCurrentUser();

  // 1. Carga de Datos
  useEffect(() => {
    if (isOpen && pedido?.id) {
      // Resetear estado anterior al abrir uno nuevo
      setPedidoCompleto(null); 
      
      const fetchPedidoDetalle = async () => {
        try {
          const response = await apiClient.get(`/api/v1/pedidos-servicio/${pedido.id}/`);
          setPedidoCompleto(response.data);
        } catch (error) {
          console.error('Error cargando detalles del pedido:', error);
          toast.error(t('common:error_loading_details'));
        }
      };
      fetchPedidoDetalle();
    }
  }, [isOpen, pedido?.id, t]); // Añadido t a dependencias

  if (!pedido) return null;

  // Preferir datos completos, fallback a datos de lista
  const datos = pedidoCompleto || pedido;
  const statusStyles = STATUS_COLORS[datos.estado || ''] || DEFAULT_COLOR;

  // 2. Lógica de Permisos y Botones (Memoizada)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const actionButtons = useMemo(() => {
    if (!currentUser) return [];

    const hasPermission = (perm: string) => 
      currentUser.permissions?.includes('*') || currentUser.permissions?.includes(perm);

    const buttons: { label: string; estado: string; variant: 'default' | 'destructive' | 'outline' }[] = [];

    switch (datos.estado) {
      case 'ENVIADO':
        if (hasPermission('pedidos_servicio.can_change_to_aceptado')) 
          buttons.push({ label: t('common:accept'), estado: 'ACEPTADO', variant: 'default' });
        if (hasPermission('pedidos_servicio.can_change_to_rechazado')) 
          buttons.push({ label: t('common:reject'), estado: 'RECHAZADO', variant: 'destructive' });
        break;
      case 'ACEPTADO':
        if (hasPermission('pedidos_servicio.can_change_to_en_fabricacion')) 
          buttons.push({ label: t('pedidos_servicio:send_fabrication'), estado: 'EN_FABRICACION', variant: 'default' });
        if (hasPermission('pedidos_servicio.can_change_to_aceptado')) 
          buttons.push({ label: t('common:back'), estado: 'ENVIADO', variant: 'outline' });
        break;
      case 'EN_FABRICACION':
        if (hasPermission('pedidos_servicio.can_change_to_listo_instalar')) 
          buttons.push({ label: t('pedidos_servicio:mark_ready'), estado: 'LISTO_INSTALAR', variant: 'default' });
        if (hasPermission('pedidos_servicio.can_change_to_en_fabricacion')) 
          buttons.push({ label: t('common:back'), estado: 'ACEPTADO', variant: 'outline' });
        break;
      case 'LISTO_INSTALAR':
        if (hasPermission('pedidos_servicio.can_change_to_instalado')) 
          buttons.push({ label: t('pedidos_servicio:mark_installed'), estado: 'INSTALADO', variant: 'default' });
        if (hasPermission('pedidos_servicio.can_change_to_listo_instalar')) 
          buttons.push({ label: t('common:back'), estado: 'EN_FABRICACION', variant: 'outline' });
        break;
      case 'INSTALADO':
        if (hasPermission('pedidos_servicio.can_change_to_completado')) 
          buttons.push({ label: t('pedidos_servicio:mark_completed'), estado: 'COMPLETADO', variant: 'default' });
        if (hasPermission('pedidos_servicio.can_change_to_instalado')) 
          buttons.push({ label: t('common:back'), estado: 'LISTO_INSTALAR', variant: 'outline' });
        break;
    }
    return buttons;
  }, [datos.estado, currentUser, t]);

  // 3. Manejadores de Acción
  const handleStatusChange = async (nuevoEstado: string) => {
    setIsUpdating(true);
    try {
      await apiClient.post(`/api/v1/pedidos-servicio/${datos.id}/cambiar_estado/`, {
        estado: nuevoEstado,
      });
      toast.success(t('pedidos_servicio:status_updated'));
      onStatusChanged?.();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('pedidos_servicio:error_updating_status'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await apiClient.get(
        `/api/v1/pedidos-servicio/${datos.id}/pdf/`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Pedido_${datos.numero_pedido}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error descargando PDF:', error);
      toast.error('Error al descargar el PDF');
    }
  };

  // 4. Formateadores
  const formatDateTime = (datetime: string | undefined) => {
    if (!datetime) return '-';
    return new Date(datetime).toLocaleDateString() + ' ' + new Date(datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  // Helper para mostrar nombres de objetos anidados o strings planos
  const getEntityName = (entity: any): string => {
    if (!entity) return 'N/A';
    if (typeof entity === 'string') return entity;
    if (typeof entity === 'object') {
      return entity.nombre || entity.full_name || entity.name || 'N/A';
    }
    return 'N/A';
  };

  const getClientPhone = () => 
    typeof datos.cliente === 'object' && datos.cliente?.telefono 
      ? datos.cliente.telefono 
      : 'N/A';
  
  const getClientAddress = () => 
    typeof datos.cliente === 'object' && datos.cliente?.direccion 
      ? datos.cliente.direccion 
      : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('pedidos_servicio:service_detail')}</DialogTitle>
          <DialogDescription>
            {t('pedidos_servicio:order')} {datos.numero_pedido}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ============ DASHBOARD CARD ============ */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm relative overflow-hidden">
            
            {/* Status Strip */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${statusStyles.border}`}></div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pl-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {typeof datos.cliente === 'object' 
                      ? getEntityName(datos.cliente) 
                      : (datos.cliente_nombre || 'N/A')
                    }
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${statusStyles.badge}`}>
                    {datos.estado_display}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><User size={14}/> Sol: {(datos as any).solicitante_nombre || '-'}</span>
                  <span className="hidden md:inline text-gray-300">|</span>
                  <span className="flex items-center gap-1"><UserCheck size={14}/> Sup: {datos.supervisor || '-'}</span>
                </div>

                {((datos as any).manufacturador_nombre || (datos as any).instalador_nombre) && (
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                    {(datos as any).manufacturador_nombre && (
                      <span className="flex items-center gap-1"><span className="text-orange-600">⚙️</span> Fab: {getEntityName((datos as any).manufacturador) || (datos as any).manufacturador_nombre}</span>
                    )}
                    {(datos as any).instalador_nombre && (
                      <span className="flex items-center gap-1"><span className="text-blue-600">🔧</span> Inst: {getEntityName((datos as any).instalador) || (datos as any).instalador_nombre}</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-4 md:mt-0 text-right">
                <span className="text-xs text-gray-400 uppercase font-bold block">{t('pedidos_servicio:registration_date')}</span>
                <span className="text-lg font-mono font-medium text-gray-700">{formatDateTime(datos.created_at)}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="bg-gray-50 rounded-lg p-4 pl-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Contact Info */}
              <div className="col-span-1 space-y-3">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase">Datos de Cliente</h5>
                
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-green-500 shrink-0"/>
                  <span className="font-medium text-gray-700">
                    {typeof datos.cliente === 'object' 
                      ? getEntityName(datos.cliente) 
                      : (datos.cliente_nombre || 'N/A')
                    }
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-blue-500 shrink-0"/>
                  <span className="text-gray-700">{getClientPhone()}</span>
                </div>

                {getClientAddress() && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={14} className="text-red-500 mt-0.5 shrink-0"/>
                    <span className="text-gray-700 leading-relaxed">{getClientAddress()}</span>
                  </div>
                )}
              </div>

              {/* Dates Info */}
              <div className="col-span-1">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-3">{t('pedidos_servicio:deadlines')}</h5>
                <div className="bg-white p-4 rounded border border-gray-100 shadow-sm flex justify-around items-center gap-4">
                  <div className="text-center">
                    <span className="text-[10px] block text-gray-400 font-semibold">{t('pedidos_servicio:start')}</span>
                    <span className="font-bold text-gray-900">{formatDate(datos.fecha_inicio)}</span>
                  </div>
                  <div className="text-gray-300">-</div>
                  <div className="text-center">
                    <span className="text-[10px] block text-gray-400 font-semibold">{t('pedidos_servicio:end')}</span>
                    <span className="font-bold text-gray-900">{formatDate(datos.fecha_fin)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {datos.observaciones && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-2">{t('pedidos_servicio:note')}</h5>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-100 italic">
                  "{datos.observaciones}"
                </p>
              </div>
            )}
          </div>

          {/* ============ ITEMS SECTION ============ */}
          {datos.items && datos.items.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">{t('pedidos_servicio:items_section')}</h2>
              <div className="space-y-4">
                {datos.items.map((item: any, index: number) => (
                  <OrderItemCard
                    key={item.id || index}
                    item={{
                      id: item.id || index + 1,
                      ambiente: item.ambiente,
                      modelo: item.modelo,
                      tecido: item.tejido,
                      // Normalización de datos para la tarjeta
                      largura: typeof item.largura === 'number' ? `${item.largura}m` : item.largura,
                      altura: typeof item.altura === 'number' ? `${item.altura}m` : item.altura,
                      quantidade: item.cantidad_piezas || item.cantidad || 0,
                      posicao: item.posicion_tejido || item.posicion,
                      comando: item.lado_comando || item.comando,
                      acionamento: item.accionamiento || item.acionamiento,
                      obs: item.observaciones,
                    }}
                    itemIndex={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ============ ACTIONS FOOTER ============ */}
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('pedidos_servicio:actions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {actionButtons.map((btn) => (
                  <Button
                    key={btn.estado}
                    variant={btn.variant}
                    onClick={() => handleStatusChange(btn.estado)}
                    disabled={isUpdating}
                    className="min-w-[120px]"
                  >
                    {isUpdating ? t('common:updating') + '...' : btn.label}
                  </Button>
                ))}
                
                <div className="flex-1"></div> {/* Spacer */}

                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 border-slate-300 hover:bg-slate-100"
                >
                  <Download size={16} />
                  Descargar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}