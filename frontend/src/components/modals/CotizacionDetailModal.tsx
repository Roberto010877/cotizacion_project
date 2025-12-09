import { useState, useEffect, useMemo } from 'react';
import React from 'react';
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
import type { Cotizacion } from '@/hooks/usePaginatedCotizaciones'; // I'll need to create this type
import { apiClient } from '@/lib/apiClient';
import toast from 'react-hot-toast';
import { User, Download, FileText, Calendar, Hash, DollarSign } from 'lucide-react';
import useCurrentUser from '@/hooks/useCurrentUser';

// --- Types ---

interface CotizacionDetailModalProps {
  cotizacion: Cotizacion | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged?: () => void;
}

// --- Status Timeline Component (Placeholder) ---
const StatusTimeline = ({ currentStatus }: { currentStatus: string }) => {
  const { t } = useAppTranslation(['cotizaciones']);
  const statuses = ['BORRADOR', 'ENVIADA', 'ACEPTADA', 'RECHAZADA', 'CANCELADA'];
  const currentIndex = statuses.indexOf(currentStatus);

  const getStatusLabel = (status: string) => {
    // Mapeo de estados
    const map: { [key: string]: string } = {
      'BORRADOR': t('status_draft'),
      'ENVIADA': t('status_sent'),
      'ACEPTADA': t('status_accepted'),
      'RECHAZADA': t('status_rejected'),
      'CANCELADA': t('status_voided')
    };
    return map[status] || status;
  }

  return (
    <div className="flex items-center justify-between w-full px-2 py-4">
      {statuses.map((status, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        return (
          <div key={status} className="flex-1 flex flex-col items-center relative">
            {/* Line - Centrada en el círculo */}
            {index > 0 && (
              <div className={`absolute left-[-50%] top-0 h-0.5 w-full ${isCompleted || isActive ? 'bg-blue-600' : 'bg-gray-300'}`} style={{ top: '16px' }}></div>
            )}
            
            {/* Circle */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 relative ${isActive ? 'bg-blue-600 text-white' : isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              <span className="font-bold text-sm">{index + 1}</span>
            </div>
            
            {/* Label */}
            <p className={`text-xs text-center mt-2 ${isActive ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
              {getStatusLabel(status)}
            </p>
          </div>
        );
      })}
    </div>
  );
};


// --- Componente de Tabla de Items (Replicando estructura del PDF) ---
const AmbienteTable = ({ ambiente, ambienteIndex }: { ambiente: any; ambienteIndex: number }) => {
  const { t } = useAppTranslation(['cotizaciones']);
  
  // Calcular subtotal del ambiente
  const subtotal = ambiente.items?.reduce((sum: number, item: any) => 
    sum + (parseFloat(item.precio_total) || 0), 0
  ) || 0;

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm mb-4">
      {/* Cabecera del Ambiente */}
      <div className="bg-gray-800 text-white px-4 py-2 font-bold text-sm uppercase">
        {t('environment')}: {ambiente.nombre}
      </div>

      {/* Tabla de Items */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[900px]">
          {/* Encabezados */}
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="px-2 py-2 text-center border-r border-gray-300 min-w-[50px] whitespace-nowrap">{t('table_item')}</th>
              <th className="px-2 py-2 text-center border-r border-gray-300 min-w-[80px] whitespace-nowrap">{t('table_code')}</th>
              <th className="px-2 py-2 text-left border-r border-gray-300 min-w-[200px]">{t('table_description')}</th>
              <th className="px-2 py-2 text-center border-r border-gray-300 min-w-[45px] whitespace-nowrap">{t('table_qty')}</th>
              <th className="px-2 py-2 text-center border-r border-gray-300 min-w-[70px] whitespace-nowrap">{t('table_width')}</th>
              <th className="px-2 py-2 text-center border-r border-gray-300 min-w-[70px] whitespace-nowrap">{t('table_height')}</th>
              <th className="px-2 py-2 text-center border-r border-gray-300 min-w-[40px] whitespace-nowrap">{t('table_unit')}</th>
              <th className="px-2 py-2 text-center border-r border-gray-300 min-w-[50px] whitespace-nowrap">{t('table_qty_total')}</th>
              <th className="px-2 py-2 text-right border-r border-gray-300 min-w-[70px] whitespace-nowrap">{t('table_unit_price')}</th>
              <th className="px-2 py-2 text-right min-w-[70px] whitespace-nowrap">{t('table_total')}</th>
            </tr>
          </thead>
          
          <tbody>
            {ambiente.items?.map((item: any, itemIndex: number) => (
              <React.Fragment key={item.id || `item-${itemIndex}`}>
                {/* Fila de Datos */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-2 py-3 text-center border-r border-gray-200 font-medium">
                    {String(item.numero_item).padStart(2, '0')}
                  </td>
                  <td className="px-2 py-3 text-center border-r border-gray-200">
                    {item.producto_codigo || '000015'}
                  </td>
                  <td className="px-2 py-3 border-r border-gray-200 font-medium">
                    {item.producto_nombre}
                  </td>
                  <td className="px-2 py-3 text-center border-r border-gray-200 font-bold">
                    {Math.round(parseFloat(item.cantidad))}
                  </td>
                  <td className="px-2 py-3 text-center border-r border-gray-200">
                    {parseFloat(item.ancho).toFixed(3)}
                  </td>
                  <td className="px-2 py-3 text-center border-r border-gray-200">
                    {parseFloat(item.alto).toFixed(3)}
                  </td>
                  <td className="px-2 py-3 text-center border-r border-gray-200 text-[10px]">
                    {item.unidad_medida || 'PC'}
                  </td>
                  <td className="px-2 py-3 text-center border-r border-gray-200 font-bold">
                    {Math.round(parseFloat(item.cantidad))}
                  </td>
                  <td className="px-2 py-3 text-right border-r border-gray-200 tabular-nums">
                    {parseFloat(item.precio_unitario).toFixed(2)}
                  </td>
                  <td className="px-2 py-3 text-right font-bold tabular-nums">
                    {parseFloat(item.precio_total).toFixed(2)}
                  </td>
                </tr>
                
                {/* Fila de Descripción Técnica Completa */}
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td colSpan={10} className="px-3 py-2">
                    <div className="text-[11px] text-gray-700 leading-relaxed">
                      {item.descripcion_tecnica || (item.atributos_seleccionados ? 
                        Object.entries(item.atributos_seleccionados || {})
                          .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
                          .join(' | ')
                        : 'Sin descripción')}
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
            
            {/* Fila de Subtotal del Ambiente */}
            <tr className="bg-gray-100 font-bold">
              <td colSpan={9} className="px-3 py-3 text-right uppercase text-sm">
                {t('subtotal')} - {ambiente.nombre}
              </td>
              <td className="px-2 py-3 text-right text-sm tabular-nums">
                {subtotal.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default function CotizacionDetailModal({
  cotizacion,
  isOpen,
  onClose,
  onStatusChanged,
}: CotizacionDetailModalProps) {
  const { t } = useAppTranslation(['cotizaciones', 'common']);
  const [isUpdating, setIsUpdating] = useState(false);
  const [cotizacionCompleta, setCotizacionCompleta] = useState<any | null>(null);
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (isOpen && cotizacion?.id) {
      setCotizacionCompleta(null);
      const fetchCotizacionDetalle = async () => {
        try {
          const response = await apiClient.get(`/gestion/cotizaciones/${cotizacion.id}/`);
          setCotizacionCompleta(response.data);
        } catch (error) {
          console.error('Error loading quote details:', error);
          toast.error(t('common:error_loading_details'));
        }
      };
      fetchCotizacionDetalle();
    }
  }, [isOpen, cotizacion?.id, t]);

  const datos = cotizacionCompleta || cotizacion;

  if (!datos) return null;

  const actionButtons = useMemo(() => {
    if (!currentUser) return [];
    const hasPermission = (perm: string) => currentUser.permissions?.includes('*') || currentUser.permissions?.includes(perm);
    const buttons: { label: string; estado: string; variant: 'default' | 'destructive' | 'outline' }[] = [];

    switch (datos.estado) {
      case 'BORRADOR':
        if (hasPermission('cotizaciones.can_change_status_enviado'))
          buttons.push({ label: t('send_quote'), estado: 'ENVIADA', variant: 'default' });
        // Permitir cancelar desde borrador
        if (hasPermission('cotizaciones.can_change_status_cancelado'))
          buttons.push({ label: t('common:cancel'), estado: 'CANCELADA', variant: 'outline' });
        break;
      case 'ENVIADA':
        if (hasPermission('cotizaciones.can_change_status_aceptado'))
          buttons.push({ label: t('common:accept'), estado: 'ACEPTADA', variant: 'default' });
        if (hasPermission('cotizaciones.can_change_status_rechazado'))
          buttons.push({ label: t('common:reject'), estado: 'RECHAZADA', variant: 'destructive' });
        // Permitir cancelar desde enviada
        if (hasPermission('cotizaciones.can_change_status_cancelado'))
          buttons.push({ label: t('common:cancel'), estado: 'CANCELADA', variant: 'outline' });
        break;
      case 'RECHAZADA':
        // Permitir cancelar desde rechazada
        if (hasPermission('cotizaciones.can_change_status_cancelado'))
          buttons.push({ label: t('common:cancel'), estado: 'CANCELADA', variant: 'outline' });
        break;
    }
    return buttons;
  }, [datos.estado, currentUser, t]);

  const handleStatusChange = async (nuevoEstado: string) => {
    setIsUpdating(true);
    try {
      await apiClient.post(`/gestion/cotizaciones/${datos.id}/cambiar_estado/`, {
        estado: nuevoEstado,
      });
      toast.success(t('status_updated'));
      onStatusChanged?.();
      onClose();
    } catch (error: any) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.detail || t('error_updating_status');
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await apiClient.get(
        `/gestion/cotizaciones/${datos.id}/generar-pdf/`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Cotizacion_${datos.numero}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t('pdf_download_success'));
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error(t('pdf_download_error'));
    }
  };

  const formatDateTime = (datetime: string | undefined) => {
    if (!datetime) return '-';
    return new Date(datetime).toLocaleDateString();
  };
  
  const observacionesConcatenadas = [
    datos.observaciones_generales,
    datos.condiciones_pago,
    datos.garantia,
  ].filter(Boolean).join(' | ');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('quote_details_title')}</DialogTitle>
          <DialogDescription>
            {t('quote_number')} {datos.numero}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-1">
          {/* Status Timeline */}
          <Card>
            <CardContent className="p-2">
              <StatusTimeline currentStatus={datos.estado} />
            </CardContent>
          </Card>
        
          {/* Main Info */}
          <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-500"/>
                    <div>
                        <p className="text-gray-500">{t('common:client')}</p>
                        <p className="font-semibold">{datos.cliente_nombre}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500"/>
                    <div>
                        <p className="text-gray-500">{t('issue_date')}</p>
                        <p className="font-semibold">{formatDateTime(datos.fecha_emision)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500"/>
                    <div>
                        <p className="text-gray-500">{t('valid_until')}</p>
                        <p className="font-semibold">{formatDateTime(datos.fecha_validez)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-gray-500"/>
                    <div>
                        <p className="text-gray-500">{t('common:status')}</p>
                        <p className="font-semibold">{datos.estado}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-500"/>
                    <div>
                        <p className="text-gray-500">{t('total')}</p>
                        <p className="font-bold text-lg">{`$${parseFloat(datos.total_general || 0).toFixed(2)}`}</p>
                    </div>
                </div>
            </CardContent>
          </Card>

          {/* Items Section - Tabla por Ambiente */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('items')}</h3>
            <div className="space-y-4">
              {datos.ambientes && datos.ambientes.length > 0 ? (
                datos.ambientes.map((ambiente: any, index: number) => (
                  <AmbienteTable key={ambiente.id || index} ambiente={ambiente} ambienteIndex={index} />
                ))
              ) : (
                <p className="text-gray-500">{t('no_items')}</p>
              )}
            </div>
          </div>
          
          {/* Observations */}
          {observacionesConcatenadas && (
              <Card>
                <CardHeader>
                    <CardTitle className="text-base">{t('observations_conditions')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{observacionesConcatenadas}</p>
                </CardContent>
              </Card>
          )}

          {/* Actions Footer */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-base">{t('common:actions')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
                {actionButtons.map((btn) => (
                  <Button
                    key={btn.estado}
                    variant={btn.variant}
                    onClick={() => handleStatusChange(btn.estado)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? t('common:updating') + '...' : btn.label}
                  </Button>
                ))}
                <div className="flex-grow"></div>
                <Button variant="outline" onClick={handleDownloadPDF} className="flex items-center gap-2">
                    <Download size={16} />
                    {t('download_pdf')}
                </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
