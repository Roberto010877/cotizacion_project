import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useAppTranslation } from '@/i18n/hooks';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const ESTADOS_MAP: Record<string, string> = {
  'ENVIADO': 'Enviado',
  'ACEPTADO': 'Aceptado',
  'EN_FABRICACION': 'En Fabricación',
  'LISTO_INSTALAR': 'Listo para Instalar',
  'INSTALADO': 'Instalado',
  'COMPLETADO': 'Completado',
  'RECHAZADO': 'Rechazado',
  'CANCELADO': 'Cancelado'
};

const ESTADOS = Object.keys(ESTADOS_MAP);

interface PedidoEditFormProps {
  pedidoId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface PedidoServicioDetail {
  id: number;
  numero_pedido: string;
  solicitante: string;
  cliente: {
    id: number;
    nombre: string;
  };
  colaborador: {
    id: number;
    full_name: string;
  } | null;
  supervisor: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  observaciones: string;
}

interface InstaladorOption {
  id: number;
  full_name: string;
}

export const PedidoEditForm: React.FC<PedidoEditFormProps> = ({ pedidoId, onSuccess, onCancel }) => {
  const { t } = useAppTranslation(['pedidos-servicio', 'common']);

  const [formData, setFormData] = useState<Partial<PedidoServicioDetail>>({});
  const [instaladores, setInstaladores] = useState<InstaladorOption[]>([]);

  // Cargar datos del pedido
  const { data: pedido, isLoading: loadingPedido } = useQuery({
    queryKey: ['pedido-detail', pedidoId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/v1/pedidos-servicio/${pedidoId}/`);
      return response.data as PedidoServicioDetail;
    },
  });

  // Actualizar form cuando se cargan los datos
  useEffect(() => {
    if (pedido) {
      console.log('Pedido loaded:', { estado: pedido.estado, solicitante: pedido.solicitante });
      setFormData({
        solicitante: pedido.solicitante,
        supervisor: pedido.supervisor,
        fecha_inicio: pedido.fecha_inicio,
        fecha_fin: pedido.fecha_fin,
        estado: pedido.estado,
        observaciones: pedido.observaciones,
        colaborador: pedido.colaborador,
      });
    }
  }, [pedido]);

  // Cargar lista de instaladores
  useEffect(() => {
    const fetchInstaladores = async () => {
      try {
        const response = await axiosInstance.get('/api/v1/instaladores/?page_size=100');
        setInstaladores(response.data.results);
      } catch (error) {
        console.error('Error fetching instaladores:', error);
      }
    };
    fetchInstaladores();
  }, []);

  // Mutation para actualizar
  const updateMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const response = await axiosInstance.patch(
        `/api/v1/pedidos-servicio/${pedidoId}/`,
        updatedData
      );
      return response.data;
    },
    onSuccess: () => {
      console.log('Pedido actualizado correctamente');
      onSuccess?.();
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 
                     Object.values(error.response?.data || {}).flat().join(', ') ||
                     t('pedidos-servicio:update_error') || 'Error al actualizar';
      console.error(message);
    },
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar datos para enviar
    const updateData: any = {
      solicitante: formData.solicitante,
      supervisor: formData.supervisor,
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
      estado: formData.estado,
      observaciones: formData.observaciones,
    };

    // Solo incluir colaborador si cambió
    if (formData.colaborador?.id) {
      updateData.colaborador_id = formData.colaborador.id;
    }

    updateMutation.mutate(updateData);
  };

  if (loadingPedido) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // No renderizar el formulario si no hay datos o formData aún no está inicializado
  if (!pedido || Object.keys(formData).length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información del Cliente - Readonly */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('pedidos-servicio:general_info') || 'Información General'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700">
              {t('pedidos-servicio:table_number')}
            </Label>
            <Input value={pedido?.numero_pedido || ''} disabled className="bg-gray-100 cursor-not-allowed" />
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700">
              {t('pedidos-servicio:table_client')}
            </Label>
            <Input value={pedido?.cliente?.nombre || ''} disabled className="bg-gray-100 cursor-not-allowed" />
          </div>
        </CardContent>
      </Card>

      {/* Campos Editables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('pedidos-servicio:edit_details') || 'Editar Detalles'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Solicitante */}
          <div>
            <Label htmlFor="solicitante" className="text-sm font-semibold text-gray-700">
              {t('pedidos-servicio:table_requestor')}
            </Label>
            <Input
              id="solicitante"
              value={formData.solicitante || ''}
              onChange={(e) => handleChange('solicitante', e.target.value)}
              placeholder={t('pedidos-servicio:table_requestor')}
              className="mt-1"
            />
          </div>

          {/* Supervisor */}
          <div>
            <Label htmlFor="supervisor" className="text-sm font-semibold text-gray-700">
              {t('pedidos-servicio:supervisor') || 'Supervisor'}
            </Label>
            <Input
              id="supervisor"
              value={formData.supervisor || ''}
              onChange={(e) => handleChange('supervisor', e.target.value)}
              placeholder={t('pedidos-servicio:supervisor') || 'Supervisor'}
              className="mt-1"
            />
          </div>

          {/* Instalador */}
          <div>
            <Label htmlFor="colaborador" className="text-sm font-semibold text-gray-700">
              {t('pedidos-servicio:table_installer')}
            </Label>
            <Select 
              value={formData.colaborador?.id?.toString() || 'none'}
              onValueChange={(value) => {
                if (value === 'none') {
                  handleChange('colaborador', null);
                } else {
                  const selected = instaladores.find(i => i.id === parseInt(value));
                  handleChange('colaborador', selected || null);
                }
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('pedidos-servicio:table_installer')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('common:not_assigned') || 'Sin asignar'}</SelectItem>
                {instaladores.map((ins) => (
                  <SelectItem key={ins.id} value={ins.id.toString()}>
                    {ins.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fecha_inicio" className="text-sm font-semibold text-gray-700">
                {t('pedidos-servicio:table_date_start')}
              </Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={formData.fecha_inicio?.split('T')[0] || ''}
                onChange={(e) => handleChange('fecha_inicio', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="fecha_fin" className="text-sm font-semibold text-gray-700">
                {t('pedidos-servicio:date_end') || 'Fecha de Fin'}
              </Label>
              <Input
                id="fecha_fin"
                type="date"
                value={formData.fecha_fin?.split('T')[0] || ''}
                onChange={(e) => handleChange('fecha_fin', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <Label htmlFor="estado" className="text-sm font-semibold text-gray-700">
              {t('pedidos-servicio:table_status')}
            </Label>
            <Select 
              value={formData.estado || 'ENVIADO'}
              onValueChange={(value) => handleChange('estado', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('pedidos-servicio:table_status')} />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {ESTADOS_MAP[estado]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observaciones */}
          <div>
            <Label htmlFor="observaciones" className="text-sm font-semibold text-gray-700">
              {t('common:observations') || 'Observaciones'}
            </Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones || ''}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              placeholder={t('common:observations') || 'Observaciones'}
              className="mt-1"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={updateMutation.isPending}
        >
          {t('common:cancel')}
        </Button>
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('pedidos-servicio:updating') || 'Actualizando...'}
            </>
          ) : (
            t('common:save')
          )}
        </Button>
      </div>
    </form>
  );
};

export default PedidoEditForm;