import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppTranslation } from '@/i18n/hooks';
import axiosInstance from '@/lib/axios';
import { Trash2, Plus } from 'lucide-react';

interface SelectOption {
  id: number;
  nombre: string;
  apellido?: string;
  full_name?: string;
}

interface PedidoItem {
  id?: string;
  ambiente: string;
  modelo: string;
  tejido: string;
  largura: string;
  altura: string;
  cantidad_piezas: string;
  posicion_tejido: string;
  lado_comando: string;
  acionamiento: string;
  observaciones: string;
}

interface FormData {
  cliente: string;
  solicitante: string;
  colaborador: string;
  supervisor: string;
  fecha_inicio: string;
  fecha_fin: string;
  observaciones: string;
  items: PedidoItem[];
}

interface PedidoFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PedidoForm: React.FC<PedidoFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { t } = useAppTranslation(['pedidos-servicio']);
  const [clientes, setClientes] = useState<SelectOption[]>([]);
  const [colaboradores, setColaboradores] = useState<SelectOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    cliente: '',
    solicitante: '',
    colaborador: '',
    supervisor: '',
    fecha_inicio: '',
    fecha_fin: '',
    observaciones: '',
    items: [
      {
        id: '0',
        ambiente: '',
        modelo: '',
        tejido: '',
        largura: '',
        altura: '',
        cantidad_piezas: '',
        posicion_tejido: 'NORMAL',
        lado_comando: 'IZQUIERDO',
        acionamiento: 'MANUAL',
        observaciones: '',
      },
    ],
  });

  // Cargar opciones de selects
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [clientesRes, instaladoresRes] = await Promise.all([
          axiosInstance.get('/api/v1/clientes/?page_size=100'),
          axiosInstance.get('/api/v1/instaladores/?page_size=100'),
        ]);

        setClientes(clientesRes.data.results || []);
        setColaboradores(instaladoresRes.data.results || []);
      } catch (err: any) {
        console.error('Error cargando opciones:', err);
        setError('No se pudieron cargar los datos del formulario');
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof PedidoItem,
    value: string
  ) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
      return {
        ...prev,
        items: newItems,
      };
    });
  };

  const addItem = () => {
    const newId = Math.max(
      ...formData.items.map((item) => parseInt(item.id || '0')),
      0
    ) + 1;
    
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: newId.toString(),
          ambiente: '',
          modelo: '',
          tejido: '',
          largura: '',
          altura: '',
          cantidad_piezas: '',
          posicion_tejido: 'NORMAL',
          lado_comando: 'IZQUIERDO',
          acionamiento: 'MANUAL',
          observaciones: '',
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación básica
    if (
      !formData.cliente ||
      !formData.solicitante ||
      !formData.colaborador ||
      !formData.fecha_inicio ||
      !formData.items ||
      formData.items.length === 0
    ) {
      setError(t('pedidos-servicio:error_required_fields'));
      return;
    }

    // Validar que todos los items tengan datos requeridos
    for (const item of formData.items) {
      if (!item.ambiente || !item.modelo || !item.tejido || !item.largura || !item.altura || !item.cantidad_piezas) {
        setError('Todos los campos de los items son requeridos');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        cliente_id: parseInt(formData.cliente),
        solicitante: formData.solicitante,
        colaborador_id: formData.colaborador ? parseInt(formData.colaborador) : null,
        supervisor: formData.supervisor || null,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin || null,
        observaciones: formData.observaciones,
        items_data: formData.items.map((item) => ({
          ambiente: item.ambiente,
          modelo: item.modelo,
          tejido: item.tejido,
          largura: parseFloat(item.largura),
          altura: parseFloat(item.altura),
          cantidad_piezas: parseInt(item.cantidad_piezas),
          posicion_tejido: item.posicion_tejido,
          lado_comando: item.lado_comando,
          acionamiento: item.acionamiento,
          observaciones: item.observaciones,
        })),
      };

      const response = await axiosInstance.post(
        '/api/v1/pedidos-servicio/',
        payload
      );

      // Toast success
      alert(`✓ ${t('pedidos-servicio:success_created')} ${response.data.numero_pedido}`);
      setFormData({
        cliente: '',
        solicitante: '',
        colaborador: '',
        supervisor: '',
        fecha_inicio: '',
        fecha_fin: '',
        observaciones: '',
        items: [
          {
            id: '0',
            ambiente: '',
            modelo: '',
            tejido: '',
            largura: '',
            altura: '',
            cantidad_piezas: '',
            posicion_tejido: 'NORMAL',
            lado_comando: 'IZQUIERDO',
            acionamiento: 'MANUAL',
            observaciones: '',
          },
        ],
      });
      onSuccess?.();
    } catch (err: any) {
      let errorMsg = t('pedidos-servicio:error_create');
      
      // Mostrar errores detallados si los hay
      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'object') {
          // Construir mensaje con todos los errores
          const errorLines = Object.entries(errors)
            .map(([field, messages]: [string, any]) => {
              const msgs = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgs.join(', ')}`;
            })
            .join('\n');
          errorMsg = errorLines || errorMsg;
        } else if (errors.detail) {
          errorMsg = errors.detail;
        }
      }
      
      setError(errorMsg);
      console.error('Error creating pedido:', err.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingOptions) {
    return <div className="text-center py-8">{t('pedidos-servicio:loading')}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Sección 1: Datos Básicos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('pedidos-servicio:form_basic_data')}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cliente">{t('pedidos-servicio:form_client')} *</Label>
            <Select
              value={formData.cliente}
              onValueChange={(val) => handleSelectChange('cliente', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('pedidos-servicio:form_client_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id.toString()}>
                    {cliente.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="solicitante">{t('pedidos-servicio:form_requestor')} *</Label>
            <Input
              name="solicitante"
              placeholder={t('pedidos-servicio:form_requestor_placeholder')}
              value={formData.solicitante}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="colaborador">{t('pedidos-servicio:form_installer')} *</Label>
            <Select
              value={formData.colaborador}
              onValueChange={(val) => handleSelectChange('colaborador', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('pedidos-servicio:form_installer_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {colaboradores.map((usuario) => (
                  <SelectItem key={usuario.id} value={usuario.id.toString()}>
                    {usuario.full_name || `${usuario.nombre} ${usuario.apellido || ''}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="supervisor">{t('pedidos-servicio:form_supervisor')}</Label>
            <Input
              name="supervisor"
              placeholder={t('pedidos-servicio:form_supervisor_placeholder')}
              value={formData.supervisor}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Sección 2: Fechas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('pedidos-servicio:form_date_time')}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fecha_inicio">{t('pedidos-servicio:form_date_start')} *</Label>
            <Input
              type="date"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="fecha_fin">{t('pedidos-servicio:form_date_end')}</Label>
            <Input
              type="date"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Sección 3: Observaciones Generales */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="observaciones">{t('pedidos-servicio:form_observations')}</Label>
          <Textarea
            name="observaciones"
            placeholder="Observaciones generales del pedido..."
            rows={3}
            value={formData.observaciones}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Sección 4: Items del Pedido */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{t('pedidos-servicio:form_items_title')}</h3>
          <Button
            type="button"
            onClick={addItem}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={16} />
            {t('pedidos-servicio:form_add_item')}
          </Button>
        </div>

        {formData.items.map((item, index) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Item {index + 1}</h4>
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t('pedidos-servicio:item_environment')} *</Label>
                <Input
                  placeholder={t('pedidos-servicio:item_environment_placeholder')}
                  value={item.ambiente}
                  onChange={(e) => handleItemChange(index, 'ambiente', e.target.value)}
                />
              </div>

              <div>
                <Label>{t('pedidos-servicio:item_model')} *</Label>
                <Input
                  placeholder={t('pedidos-servicio:item_model_placeholder')}
                  value={item.modelo}
                  onChange={(e) => handleItemChange(index, 'modelo', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t('pedidos-servicio:item_fabric')} *</Label>
                <Input
                  placeholder={t('pedidos-servicio:item_fabric_placeholder')}
                  value={item.tejido}
                  onChange={(e) => handleItemChange(index, 'tejido', e.target.value)}
                />
              </div>

              <div>
                <Label>{t('pedidos-servicio:item_quantity')} *</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Cantidad"
                  value={item.cantidad_piezas}
                  onChange={(e) => handleItemChange(index, 'cantidad_piezas', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t('pedidos-servicio:item_width')} (m) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 1.50"
                  value={item.largura}
                  onChange={(e) => handleItemChange(index, 'largura', e.target.value)}
                />
              </div>

              <div>
                <Label>{t('pedidos-servicio:item_height')} (m) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 2.00"
                  value={item.altura}
                  onChange={(e) => handleItemChange(index, 'altura', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>{t('pedidos-servicio:item_fabric_position')}</Label>
                <Select
                  value={item.posicion_tejido}
                  onValueChange={(val) => handleItemChange(index, 'posicion_tejido', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">{t('pedidos-servicio:position_normal')}</SelectItem>
                    <SelectItem value="INVERSO">{t('pedidos-servicio:position_inverse')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('pedidos-servicio:item_command_side')}</Label>
                <Select
                  value={item.lado_comando}
                  onValueChange={(val) => handleItemChange(index, 'lado_comando', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IZQUIERDO">{t('pedidos-servicio:side_left')}</SelectItem>
                    <SelectItem value="DERECHO">{t('pedidos-servicio:side_right')}</SelectItem>
                    <SelectItem value="AMBOS">{t('pedidos-servicio:side_both')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('pedidos-servicio:item_actuation')}</Label>
                <Select
                  value={item.acionamiento}
                  onValueChange={(val) => handleItemChange(index, 'acionamiento', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">{t('pedidos-servicio:actuation_manual')}</SelectItem>
                    <SelectItem value="MOTORIZADO">{t('pedidos-servicio:actuation_motorized')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{t('pedidos-servicio:item_observations')}</Label>
              <Textarea
                placeholder={t('pedidos-servicio:item_observations_placeholder')}
                rows={2}
                value={item.observaciones}
                onChange={(e) => handleItemChange(index, 'observaciones', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-4 justify-end pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting || loadingOptions}
        >
          {t('pedidos-servicio:form_cancel')}
        </Button>
        <Button
          type="submit"
          disabled={submitting || loadingOptions}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {submitting ? t('pedidos-servicio:form_creating') : t('pedidos-servicio:form_create')}
        </Button>
      </div>
    </form>
  );
};