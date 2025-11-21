import { useState } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppTranslation } from '@/i18n/hooks';

interface Item {
  id: string;
  ambiente: string;
  modelo: string;
  tejido: string;
  largura: string;
  altura: string;
  cantidad_piezas: string;
  posicion_tejido: string;
  lado_comando: string;
  accionamiento: string;
  observaciones: string;
}

interface CreatePedidoServicioFormProps {
  clientes: Array<{ id: number; nombre: string }>;
  isLoading?: boolean;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export default function CreatePedidoServicioForm({
  clientes = [],
  isLoading = false,
  onSubmit,
  onCancel,
}: CreatePedidoServicioFormProps) {
  const { t } = useAppTranslation(['pedidos_servicio', 'common']);
  const [formData, setFormData] = useState({
    cliente: '',
    solicitante: 'Sra. Rita',
    supervisor: '',
    fecha_inicio: '',
    fecha_fin: '',
    observaciones: '',
  });

  const [items, setItems] = useState<Item[]>([
    {
      id: '1',
      ambiente: '',
      modelo: '',
      tejido: '',
      largura: '',
      altura: '',
      cantidad_piezas: '1',
      posicion_tejido: 'NORMAL',
      lado_comando: 'IZQUIERDO',
      accionamiento: 'MANUAL',
      observaciones: '',
    },
  ]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id: string, field: string, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddItem = () => {
    const newId = Math.max(...items.map((i) => parseInt(i.id)), 0) + 1;
    setItems((prev) => [
      ...prev,
      {
        id: newId.toString(),
        ambiente: '',
        modelo: '',
        tejido: '',
        largura: '',
        altura: '',
        cantidad_piezas: '1',
        posicion_tejido: 'NORMAL',
        lado_comando: 'IZQUIERDO',
        accionamiento: 'MANUAL',
        observaciones: '',
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      toast.error(t('pedidos_servicio:min_one_item_error'));
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = () => {
    if (!formData.cliente) {
      toast.error(t('pedidos_servicio:select_client_error'));
      return;
    }

    const hasEmptyItems = items.some(
      (item) =>
        !item.ambiente ||
        !item.modelo ||
        !item.tejido ||
        !item.largura ||
        !item.altura
    );

    if (hasEmptyItems) {
      toast.error(t('pedidos_servicio:fill_required_fields_error'));
      return;
    }

    if (onSubmit) {
      onSubmit({
        ...formData,
        items,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Datos principales del pedido */}
      <Card>
        <CardHeader>
          <CardTitle>{t('pedidos_servicio:general_info')}</CardTitle>
          <CardDescription>{t('pedidos_servicio:basic_data')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">{t('common:client')} *</Label>
              <Select value={formData.cliente} onValueChange={(value) => handleFormSelectChange('cliente', value)}>
                <SelectTrigger id="cliente">
                  <SelectValue placeholder={t('pedidos_servicio:select_client')} />
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

            <div className="space-y-2">
              <Label htmlFor="solicitante">{t('pedidos_servicio:requester')}</Label>
              <Input
                id="solicitante"
                name="solicitante"
                value={formData.solicitante}
                onChange={handleFormChange}
                placeholder="Sra. Rita"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supervisor">{t('pedidos_servicio:supervisor')}</Label>
              <Input
                id="supervisor"
                name="supervisor"
                value={formData.supervisor}
                onChange={handleFormChange}
                placeholder={t('pedidos_servicio:supervisor_placeholder')}
              />
            </div>
          </div>

          {/* Fila: Fecha de Inicio y Fecha de Fin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">{t('common:start_date')}</Label>
              <Input
                id="fecha_inicio"
                name="fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={handleFormChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_fin">{t('common:end_date')}</Label>
              <Input
                id="fecha_fin"
                name="fecha_fin"
                type="date"
                value={formData.fecha_fin}
                onChange={handleFormChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">{t('pedidos_servicio:general_observations')}</Label>
            <Textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleFormChange}
              placeholder={t('pedidos_servicio:order_notes')}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items del pedido */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('pedidos_servicio:items_section')}</CardTitle>
            <CardDescription>{t('pedidos_servicio:items_description')}</CardDescription>
          </div>
          <Button onClick={handleAddItem} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t('pedidos_servicio:add_item')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-4 relative">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-sm">{t('pedidos_servicio:item')} {index + 1}</h4>
                {items.length > 1 && (
                  <Button
                    onClick={() => handleRemoveItem(item.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`ambiente-${item.id}`}>{t('pedidos_servicio:environment')} *</Label>
                  <Input
                    id={`ambiente-${item.id}`}
                    value={item.ambiente}
                    onChange={(e) => handleItemChange(item.id, 'ambiente', e.target.value)}
                    placeholder={t('pedidos_servicio:environment_placeholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`modelo-${item.id}`}>{t('pedidos_servicio:model')} *</Label>
                  <Input
                    id={`modelo-${item.id}`}
                    value={item.modelo}
                    onChange={(e) => handleItemChange(item.id, 'modelo', e.target.value)}
                    placeholder={t('pedidos_servicio:model_placeholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`tejido-${item.id}`}>{t('pedidos_servicio:fabric')} *</Label>
                  <Input
                    id={`tejido-${item.id}`}
                    value={item.tejido}
                    onChange={(e) => handleItemChange(item.id, 'tejido', e.target.value)}
                    placeholder={t('pedidos_servicio:fabric_placeholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`cantidad-${item.id}`}>{t('pedidos_servicio:quantity')}</Label>
                  <Input
                    id={`cantidad-${item.id}`}
                    type="number"
                    value={item.cantidad_piezas}
                    onChange={(e) => handleItemChange(item.id, 'cantidad_piezas', e.target.value)}
                    placeholder="1"
                  />
                </div>
              </div>

              {/* Fila: Largura y Altura */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`largura-${item.id}`}>{t('pedidos_servicio:width')} *</Label>
                  <Input
                    id={`largura-${item.id}`}
                    type="number"
                    step="0.01"
                    value={item.largura}
                    onChange={(e) => handleItemChange(item.id, 'largura', e.target.value)}
                    placeholder={t('pedidos_servicio:width_placeholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`altura-${item.id}`}>{t('pedidos_servicio:height')} *</Label>
                  <Input
                    id={`altura-${item.id}`}
                    type="number"
                    step="0.01"
                    value={item.altura}
                    onChange={(e) => handleItemChange(item.id, 'altura', e.target.value)}
                    placeholder={t('pedidos_servicio:height_placeholder')}
                  />
                </div>
              </div>

              {/* Fila: Posición del Tejido, Lado del Comando y Accionamiento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`posicion-${item.id}`}>{t('pedidos_servicio:fabric_position')}</Label>
                  <Select
                    value={item.posicion_tejido}
                    onValueChange={(value) => handleItemChange(item.id, 'posicion_tejido', value)}
                  >
                    <SelectTrigger id={`posicion-${item.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">{t('pedidos_servicio:normal')}</SelectItem>
                      <SelectItem value="INVERSO">{t('pedidos_servicio:inverse')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`lado-${item.id}`}>{t('pedidos_servicio:command_side')}</Label>
                  <Select
                    value={item.lado_comando}
                    onValueChange={(value) => handleItemChange(item.id, 'lado_comando', value)}
                  >
                    <SelectTrigger id={`lado-${item.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IZQUIERDO">{t('pedidos_servicio:left')}</SelectItem>
                      <SelectItem value="DERECHO">{t('pedidos_servicio:right')}</SelectItem>
                      <SelectItem value="AMBOS">{t('pedidos_servicio:both')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`acionamiento-${item.id}`}>{t('pedidos_servicio:actuation')}</Label>
                  <Select
                    value={item.accionamiento}
                    onValueChange={(value) => handleItemChange(item.id, 'accionamiento', value)}
                  >
                    <SelectTrigger id={`acionamiento-${item.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">{t('pedidos_servicio:manual')}</SelectItem>
                      <SelectItem value="MOTORIZADO">{t('pedidos_servicio:motorized')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`observaciones-${item.id}`}>{t('pedidos_servicio:item_observations')}</Label>
                <Textarea
                  id={`observaciones-${item.id}`}
                  value={item.observaciones}
                  onChange={(e) => handleItemChange(item.id, 'observaciones', e.target.value)}
                  placeholder={t('pedidos_servicio:item_observations_placeholder')}
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          {t('common:cancel')}
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? t('pedidos_servicio:creating') : t('pedidos_servicio:create_btn')}
        </Button>
      </div>
    </div>
  );
}
