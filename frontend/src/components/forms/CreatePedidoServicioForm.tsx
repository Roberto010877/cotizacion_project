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
  acionamiento: string;
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
      acionamiento: 'MANUAL',
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
        acionamiento: 'MANUAL',
        observaciones: '',
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      toast.error('Debe haber al menos un item');
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = () => {
    if (!formData.cliente) {
      toast.error('Por favor selecciona un cliente');
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
      toast.error('Por favor completa todos los campos requeridos en los items');
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
          <CardTitle>Información General del Pedido</CardTitle>
          <CardDescription>Datos básicos del pedido de servicio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Select value={formData.cliente} onValueChange={(value) => handleFormSelectChange('cliente', value)}>
                <SelectTrigger id="cliente">
                  <SelectValue placeholder="Selecciona un cliente" />
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
              <Label htmlFor="solicitante">Solicitante</Label>
              <Input
                id="solicitante"
                name="solicitante"
                value={formData.solicitante}
                onChange={handleFormChange}
                placeholder="Sra. Rita"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supervisor">Supervisor</Label>
              <Input
                id="supervisor"
                name="supervisor"
                value={formData.supervisor}
                onChange={handleFormChange}
                placeholder="Nombre del supervisor"
              />
            </div>
          </div>

          {/* Fila: Fecha de Inicio y Fecha de Fin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
              <Input
                id="fecha_inicio"
                name="fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={handleFormChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_fin">Fecha de Fin</Label>
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
            <Label htmlFor="observaciones">Observaciones Generales</Label>
            <Textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleFormChange}
              placeholder="Notas sobre el pedido..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items del pedido */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Items del Pedido</CardTitle>
            <CardDescription>Detalles de las cortinas/persianas a instalar</CardDescription>
          </div>
          <Button onClick={handleAddItem} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-4 relative">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-sm">Item {index + 1}</h4>
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
                  <Label htmlFor={`ambiente-${item.id}`}>Ambiente *</Label>
                  <Input
                    id={`ambiente-${item.id}`}
                    value={item.ambiente}
                    onChange={(e) => handleItemChange(item.id, 'ambiente', e.target.value)}
                    placeholder="ej: Varanda, Sala, Dormitorio"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`modelo-${item.id}`}>Modelo *</Label>
                  <Input
                    id={`modelo-${item.id}`}
                    value={item.modelo}
                    onChange={(e) => handleItemChange(item.id, 'modelo', e.target.value)}
                    placeholder="ej: Rolô, Persiana, Panel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`tejido-${item.id}`}>Tejido *</Label>
                  <Input
                    id={`tejido-${item.id}`}
                    value={item.tejido}
                    onChange={(e) => handleItemChange(item.id, 'tejido', e.target.value)}
                    placeholder="ej: Screen 3% branco"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`cantidad-${item.id}`}>Cantidad de Piezas</Label>
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
                  <Label htmlFor={`largura-${item.id}`}>Largura (m) *</Label>
                  <Input
                    id={`largura-${item.id}`}
                    type="number"
                    step="0.01"
                    value={item.largura}
                    onChange={(e) => handleItemChange(item.id, 'largura', e.target.value)}
                    placeholder="ej: 2.50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`altura-${item.id}`}>Altura (m) *</Label>
                  <Input
                    id={`altura-${item.id}`}
                    type="number"
                    step="0.01"
                    value={item.altura}
                    onChange={(e) => handleItemChange(item.id, 'altura', e.target.value)}
                    placeholder="ej: 1.80"
                  />
                </div>
              </div>

              {/* Fila: Posición del Tejido, Lado del Comando y Accionamiento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`posicion-${item.id}`}>Posición del Tejido</Label>
                  <Select
                    value={item.posicion_tejido}
                    onValueChange={(value) => handleItemChange(item.id, 'posicion_tejido', value)}
                  >
                    <SelectTrigger id={`posicion-${item.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="INVERSO">Inverso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`lado-${item.id}`}>Lado del Comando</Label>
                  <Select
                    value={item.lado_comando}
                    onValueChange={(value) => handleItemChange(item.id, 'lado_comando', value)}
                  >
                    <SelectTrigger id={`lado-${item.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IZQUIERDO">Izquierdo</SelectItem>
                      <SelectItem value="DERECHO">Derecho</SelectItem>
                      <SelectItem value="AMBOS">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`acionamiento-${item.id}`}>Accionamiento</Label>
                  <Select
                    value={item.acionamiento}
                    onValueChange={(value) => handleItemChange(item.id, 'acionamiento', value)}
                  >
                    <SelectTrigger id={`acionamiento-${item.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="MOTORIZADO">Motorizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`observaciones-${item.id}`}>Observaciones del Item</Label>
                <Textarea
                  id={`observaciones-${item.id}`}
                  value={item.observaciones}
                  onChange={(e) => handleItemChange(item.id, 'observaciones', e.target.value)}
                  placeholder="ej: Instalación por fuera del vão"
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
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Creando...' : 'Crear Pedido'}
        </Button>
      </div>
    </div>
  );
}
