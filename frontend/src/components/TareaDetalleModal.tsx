import React from 'react';
import type { AsignacionTarea } from '@/hooks/usePaginatedAsignaciones';
import { useAppTranslation } from '@/i18n/hooks';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ESTADO_COLORS: Record<string, string> = {
  'PENDIENTE': 'bg-yellow-100 text-yellow-800',
  'EN_PROGRESO': 'bg-blue-100 text-blue-800',
  'COMPLETADO': 'bg-green-100 text-green-800',
  'CANCELADO': 'bg-red-100 text-red-800',
};

const TIPO_COLORES: Record<string, string> = {
  'FABRICACION': 'bg-purple-100 text-purple-800',
  'INSTALACION': 'bg-orange-100 text-orange-800',
};

interface TareaDetalleModalProps {
  tarea: AsignacionTarea | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TareaDetalleModal: React.FC<TareaDetalleModalProps> = ({
  tarea,
  isOpen,
  onClose,
}) => {
  const { t } = useAppTranslation(['pedidos-servicio', 'common']);

  if (!tarea || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div>
            <CardTitle>{t('pedidos-servicio:view_title')}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={ESTADO_COLORS[tarea.estado] || ''}>
              {tarea.estado_display}
            </Badge>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('pedidos-servicio:general_info')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">{t('pedidos-servicio:task_order_number')}</p>
                <p className="font-semibold text-lg text-blue-600">{tarea.pedido_numero}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('pedidos-servicio:task_type_filter')}</p>
                <Badge className={TIPO_COLORES[tarea.tipo_tarea] || ''}>
                  {tarea.tipo_tarea_display}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('pedidos-servicio:task_responsible')}</p>
                <p className="font-medium">{tarea.instalador_nombre}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('pedidos-servicio:task_status_filter')}</p>
                <p className="font-medium">{tarea.estado_display}</p>
              </div>
            </CardContent>
          </Card>

          {/* Fechas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('pedidos-servicio:form_date_time')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">{t('common:created')}</p>
                <p className="font-medium">
                  {new Date(tarea.fecha_asignacion).toLocaleDateString('es-ES', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(tarea.fecha_asignacion).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('pedidos-servicio:task_expected_delivery')}</p>
                <p className="font-medium">
                  {tarea.fecha_entrega_esperada
                    ? new Date(tarea.fecha_entrega_esperada).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '-'}
                </p>
              </div>
              {tarea.fecha_inicio_real && (
                <div>
                  <p className="text-xs text-gray-500">Fecha Inicio Real</p>
                  <p className="font-medium">
                    {new Date(tarea.fecha_inicio_real).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
              {tarea.fecha_completacion && (
                <div>
                  <p className="text-xs text-gray-500">Fecha Completación</p>
                  <p className="font-medium">
                    {new Date(tarea.fecha_completacion).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Descripción */}
          {tarea.descripcion_tarea && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('pedidos-servicio:task_description')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{tarea.descripcion_tarea}</p>
              </CardContent>
            </Card>
          )}

          {/* Notas de Progreso */}
          {tarea.notas_progreso && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">{t('pedidos-servicio:task_notes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap italic">{tarea.notas_progreso}</p>
              </CardContent>
            </Card>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cerrar
            </Button>
          </div>

          {/* Items del Pedido */}
          {tarea.pedido_items && tarea.pedido_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('pedidos-servicio:items_detail')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tarea.pedido_items.map((item) => (
                    <div key={item.id} className="border-l-4 border-blue-400 pl-4 pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">{t('pedidos-servicio:environment')}</p>
                          <p className="font-semibold text-blue-600">{item.ambiente}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('pedidos-servicio:model')}</p>
                          <p className="font-medium">{item.modelo}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('pedidos-servicio:fabric')}</p>
                          <p className="font-medium">{item.tejido}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('pedidos-servicio:qty')}</p>
                          <p className="font-medium">{item.cantidad_piezas} unidades</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('pedidos-servicio:width')}</p>
                          <p className="font-medium">{item.largura} m</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('pedidos-servicio:height')}</p>
                          <p className="font-medium">{item.altura} m</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('pedidos-servicio:position')}</p>
                          <p className="font-medium">{item.posicion_tejido_display}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('pedidos-servicio:control')}</p>
                          <p className="font-medium">{item.lado_comando_display}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500">{t('pedidos-servicio:drive')}</p>
                          <p className="font-medium">{item.acionamiento_display}</p>
                        </div>
                        {item.observaciones && (
                          <div className="md:col-span-2">
                            <p className="text-xs text-gray-500">{t('pedidos-servicio:item_observations')}</p>
                            <p className="text-sm text-gray-600">{item.observaciones}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información de Cliente y Solicitante */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('pedidos-servicio:contact_info')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tarea.cliente_nombre && (
                <div>
                  <p className="text-xs text-gray-500">{t('pedidos-servicio:form_client')}</p>
                  <p className="font-medium">{tarea.cliente_nombre}</p>
                </div>
              )}
              {tarea.cliente_telefono && (
                <div>
                  <p className="text-xs text-gray-500">{t('pedidos-servicio:client_phone')}</p>
                  <p className="font-medium">{tarea.cliente_telefono}</p>
                </div>
              )}
              {tarea.solicitante && (
                <div>
                  <p className="text-xs text-gray-500">{t('pedidos-servicio:form_requestor')}</p>
                  <p className="font-medium">{tarea.solicitante}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observaciones del Pedido */}
          {tarea.observaciones_pedido && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('pedidos-servicio:general_observations')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{tarea.observaciones_pedido}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
