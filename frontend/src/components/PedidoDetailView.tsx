import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useAppTranslation } from '@/i18n/hooks';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';

interface ItemPedidoServicio {
  id: number;
  numero_item: number;
  ambiente: string;
  modelo: string;
  tejido: string;
  largura: number;
  altura: number;
  cantidad_piezas: number;
  posicion_tejido: string;
  lado_comando: string;
  acionamiento: string;
  observaciones?: string;
}

interface PedidoServicioDetail {
  id: number;
  numero_pedido: string;
  solicitante: string;
  cliente: {
    id: number;
    nombre: string;
    numero_documento: string;
    email: string;
    telefono: string;
  };
  colaborador: {
    id: number;
    full_name: string;
    documento: string;
    email: string;
    especialidad: string;
    estado: string;
  } | null;
  supervisor: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  estado_display: string;
  observaciones: string;
  items: ItemPedidoServicio[];
  created_at: string;
  updated_at: string;
}

interface PedidoDetailViewProps {
  pedidoId: number;
}

export const PedidoDetailView: React.FC<PedidoDetailViewProps> = ({ pedidoId }) => {
  const { t } = useAppTranslation(['pedidos-servicio', 'common']);

  const { data: pedido, isLoading, error } = useQuery<PedidoServicioDetail>({
    queryKey: ['pedido-detail', pedidoId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/v1/pedidos-servicio/${pedidoId}/`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="text-center py-8 text-red-600">
        {t('pedidos-servicio:error_loading_detail') || 'Error al cargar el pedido'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con número y estado */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-600">{pedido.numero_pedido}</h2>
          <p className="text-gray-600 text-sm">{t('common:created')}: {new Date(pedido.created_at).toLocaleDateString('es-ES')}</p>
        </div>
        <StatusBadge estado={pedido.estado as any} showIcon={true} />
      </div>

      {/* Información General */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('pedidos-servicio:general_info') || 'Información General'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cliente */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">{t('pedidos-servicio:table_client')}</h3>
            <div className="space-y-1">
              <p className="font-medium">{pedido.cliente.nombre}</p>
              <p className="text-sm text-gray-600">{t('common:document')}: {pedido.cliente.numero_documento}</p>
              <p className="text-sm text-gray-600">{t('common:email')}: {pedido.cliente.email}</p>
              <p className="text-sm text-gray-600">{t('common:phone')}: {pedido.cliente.telefono}</p>
            </div>
          </div>

          {/* Solicitante */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">{t('pedidos-servicio:table_requestor')}</h3>
            <p className="font-medium">{pedido.solicitante}</p>
          </div>

          {/* Instalador */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">{t('pedidos-servicio:table_installer')}</h3>
            {pedido.colaborador ? (
              <div className="space-y-1">
                <p className="font-medium">{pedido.colaborador.full_name}</p>
                <p className="text-sm text-gray-600">{t('common:email')}: {pedido.colaborador.email}</p>
                <p className="text-sm text-gray-600">{t('common:specialty')}: {pedido.colaborador.especialidad}</p>
                <div className="mt-2 inline-block px-2 py-1 text-xs border rounded-md border-gray-300 text-gray-700">
                  {pedido.colaborador.estado}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">{t('common:not_assigned') || 'Sin asignar'}</p>
            )}
          </div>

          {/* Supervisor */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">{t('pedidos-servicio:supervisor') || 'Supervisor'}</h3>
            <p className="font-medium">{pedido.supervisor || '-'}</p>
          </div>

          {/* Fechas */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">{t('pedidos-servicio:table_date_start')}</h3>
            <p className="font-medium">
              {pedido.fecha_inicio ? new Date(pedido.fecha_inicio).toLocaleDateString('es-ES') : '-'}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">{t('pedidos-servicio:date_end') || 'Fecha de Fin'}</h3>
            <p className="font-medium">
              {pedido.fecha_fin ? new Date(pedido.fecha_fin).toLocaleDateString('es-ES') : '-'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Observaciones */}
      {pedido.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('common:observations') || 'Observaciones'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-line">{pedido.observaciones}</p>
          </CardContent>
        </Card>
      )}

      {/* Items - Detalles del Pedido */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('pedidos-servicio:items_detail') || 'Detalles de Instalación'}</CardTitle>
          <CardDescription>
            {t('pedidos-servicio:total_label')}: {pedido.items.length} {t('pedidos-servicio:items_label') || 'items'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pedido.items.length > 0 ? (
            <div className="space-y-4">
              {pedido.items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Item número y ambiente */}
                    <div>
                      <h4 className="font-semibold text-blue-600 mb-1">
                        {t('pedidos-servicio:item_number') || 'Item'} {item.numero_item}
                      </h4>
                      <p className="text-sm text-gray-600">{t('pedidos-servicio:environment') || 'Ambiente'}: <span className="font-medium">{item.ambiente}</span></p>
                    </div>

                    {/* Modelo y tejido */}
                    <div>
                      <p className="text-sm text-gray-600">{t('pedidos-servicio:model') || 'Modelo'}: <span className="font-medium">{item.modelo}</span></p>
                      <p className="text-sm text-gray-600">{t('pedidos-servicio:fabric') || 'Tejido'}: <span className="font-medium">{item.tejido}</span></p>
                    </div>

                    {/* Dimensiones */}
                    <div>
                      <p className="text-sm text-gray-600">{t('pedidos-servicio:width') || 'Largura'}: <span className="font-medium">{item.largura}m</span></p>
                      <p className="text-sm text-gray-600">{t('pedidos-servicio:height') || 'Altura'}: <span className="font-medium">{item.altura}m</span></p>
                    </div>

                    {/* Cantidad y posición */}
                    <div>
                      <p className="text-sm text-gray-600">{t('pedidos-servicio:qty') || 'Cantidad'}: <span className="font-medium">{item.cantidad_piezas}</span></p>
                      <p className="text-sm text-gray-600">{t('pedidos-servicio:position') || 'Posición'}: <span className="font-medium">{item.posicion_tejido}</span></p>
                    </div>

                    {/* Comando y accionamiento */}
                    <div>
                      <p className="text-sm text-gray-600">{t('pedidos-servicio:control') || 'Lado Comando'}: <span className="font-medium">{item.lado_comando}</span></p>
                      <p className="text-sm text-gray-600">{t('pedidos-servicio:drive') || 'Accionamiento'}: <span className="font-medium">{item.acionamiento}</span></p>
                    </div>
                  </div>

                  {/* Observaciones del item */}
                  {item.observaciones && (
                    <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                      <strong>{t('common:observations')}:</strong> {item.observaciones}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              {t('pedidos-servicio:no_items') || 'Sin items'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PedidoDetailView;