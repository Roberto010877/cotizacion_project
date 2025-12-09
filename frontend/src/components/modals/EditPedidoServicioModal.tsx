import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppTranslation } from '@/i18n/hooks';
import {apiClient} from '@/lib/apiClient';
import type { PedidoServicio } from '@/hooks/usePaginatedPedidosServicio';

// --- Esquemas Zod (Reutilizados del Create para consistencia) ---
const itemSchema = (t: any) => z.object({
  ambiente: z.string().min(1, t('pedidos_servicio:error_environment_required')),
  modelo: z.string().min(1, t('pedidos_servicio:error_model_required')),
  tejido: z.string().min(1, t('pedidos_servicio:error_fabric_required')),
  largura: z.coerce.number().positive(t('pedidos_servicio:error_width_required')),
  altura: z.coerce.number().positive(t('pedidos_servicio:error_height_required')),
  cantidad_piezas: z.coerce.number().int().min(1),
  posicion_tejido: z.string().min(1),
  lado_comando: z.string().min(1),
  acionamiento: z.string().min(1), // Nota: backend usa 'acionamiento' (con una c) o 'accionamiento'? Ajustar según API real
  observaciones: z.string().optional(),
});

const editPedidoSchema = (t: any) => z.object({
  cliente: z.string().min(1, t('pedidos_servicio:select_client_error')),
  solicitante: z.string().optional(),
  supervisor: z.string().optional(),
  manufacturador_id: z.string().min(1, "Selecciona un Fabricador"),
  instalador_id: z.string().min(1, "Selecciona un Instalador"),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  observaciones: z.string().optional(),
  items: z.array(itemSchema(t)).min(1, t('pedidos_servicio:min_one_item_error')),
});

type FormValues = z.infer<ReturnType<typeof editPedidoSchema>>;

interface EditPedidoServicioModalProps {
  isOpen: boolean;
  pedido: PedidoServicio | null;
  clientes: Array<{ id: number; nombre: string }>;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Instalador {
  id: number;
  nombre: string;
  apellido: string;
}

export default function EditPedidoServicioModal({
  isOpen,
  pedido,
  clientes,
  onClose,
  onSuccess,
}: EditPedidoServicioModalProps) {
  const { t } = useAppTranslation(['pedidos_servicio', 'common']);
  const [fabricadores, setFabricadores] = useState<Instalador[]>([]);
  const [instaladores, setInstaladores] = useState<Instalador[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false); // Estado para la carga inicial de datos

  // 1. Configuración del Formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(editPedidoSchema(t)) as any,
    defaultValues: {
      items: [] // Inicializar vacío, se llenará con reset()
    },
    mode: 'onChange'
  });

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // 2. Carga de Catálogos (Fabricadores/Instaladores)
  useEffect(() => {
    const loadPersonal = async () => {
      try {
        const [fabricadoresRes, instaladoresRes] = await Promise.all([
          apiClient.get('/manufactura/?cargo=MANUFACTURADOR'),
          apiClient.get('/manufactura/?cargo=INSTALADOR'),
        ]);
        setFabricadores(fabricadoresRes.data.results || []);
        setInstaladores(instaladoresRes.data.results || []);
      } catch (error) {
        console.error('Error cargando personal:', error);
      }
    };
    loadPersonal();
  }, []);

  // 3. Cargar Datos del Pedido al Abrir
  useEffect(() => {
    if (!isOpen || !pedido) return;

    const cargarPedidoCompleto = async () => {
      setIsFetchingData(true);
      try {
        const response = await apiClient.get(`/pedidos-servicio/${pedido.id}/`);
        const data = response.data;

        // Mapear datos de la API al formato del Formulario
        const formData: FormValues = {
          cliente: data.cliente?.id?.toString() || data.cliente?.toString() || '',
          solicitante: data.solicitante_nombre || '', // Ajustar según lo que devuelva tu API exactamente
          supervisor: data.supervisor || '',
          fecha_inicio: data.fecha_inicio || '',
          fecha_fin: data.fecha_fin || '',
          observaciones: data.observaciones || '',
          manufacturador_id: data.manufacturador?.id?.toString() || data.manufacturador_id?.toString() || '',
          instalador_id: data.instalador?.id?.toString() || data.instalador_id?.toString() || '',
          items: (data.items || []).map((item: any) => ({
            ambiente: item.ambiente || '',
            modelo: item.modelo || '',
            tejido: item.tejido || '',
            largura: Number(item.largura) || 0,
            altura: Number(item.altura) || 0,
            cantidad_piezas: Number(item.cantidad_piezas) || 1,
            posicion_tejido: item.posicion_tejido || '',
            lado_comando: item.lado_comando || '',
            acionamiento: item.acionamiento || '', // Ojo con la 'c' o 'cc'
            observaciones: item.observaciones || '',
          })),
        };

        // Reiniciar el formulario con los datos cargados
        reset(formData);
        
      } catch (error) {
        console.error('Error cargando pedido:', error);
        toast.error('Error al cargar los datos del pedido');
        onClose(); // Cerrar si falla la carga crítica
      } finally {
        setIsFetchingData(false);
      }
    };

    cargarPedidoCompleto();
  }, [isOpen, pedido, reset, onClose]);


  // 4. Lógica de Envío (Update -> Delete Old Items -> Create New Items)
  const onSubmit = async (data: FormValues) => {
    if (!pedido?.id) return;

    try {
      console.time('⏱️ Edición completa');

      // Paso 1: Actualizar Cabecera
      const pedidoUpdateData = {
        cliente_id: data.cliente,
        solicitante: data.solicitante,
        supervisor: data.supervisor,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        observaciones: data.observaciones,
        manufacturador_id: data.manufacturador_id,
        instalador_id: data.instalador_id,
      };

      await apiClient.put(`/pedidos-servicio/${pedido.id}/`, pedidoUpdateData);

      // Paso 2: Obtener items actuales para eliminar
      const pedidoActualizado = await axiosInstance.get(`/pedidos-servicio/${pedido.id}/`);
      const itemsViejos = pedidoActualizado.data.items || [];

      // Paso 3: Eliminar Items Viejos
      // Nota: Idealmente el backend debería manejar una "Sincronización" masiva, pero mantenemos tu lógica
      if (itemsViejos.length > 0) {
        await Promise.all(itemsViejos.map((item: any) => 
          axiosInstance.delete(`/pedidos-servicio/${pedido.id}/items/${item.id}/`)
        ));
      }

      // Paso 4: Crear Nuevos Items
      // Usamos un bucle for..of secuencial o Promise.all para crear los nuevos
      // Promise.all es más rápido pero si falla uno es más difícil de rastrear. Usaremos secuencial por seguridad.
      for (const item of data.items) {
        await apiClient.post(`/pedidos-servicio/${pedido.id}/items/`, item);
      }

      toast.success(t('pedidos_servicio:order_updated_success'));
      onSuccess?.();
      onClose();

    } catch (error: any) {
      console.error('❌ Error updating order:', error);
      const msg = error.response?.data?.detail || error.message || t('pedidos_servicio:error_updating_order');
      toast.error(msg);
    } finally {
      console.timeEnd('⏱️ Edición completa');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('pedidos_servicio:edit_order')}: {pedido?.numero_pedido}</DialogTitle>
          <DialogDescription>
            {t('pedidos_servicio:edit_order_description')}
          </DialogDescription>
        </DialogHeader>

        {isFetchingData ? (
          <div className="flex justify-center items-center py-10">
            <p>Cargando datos del pedido...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* --- Sección General --- */}
            <Card>
              <CardHeader>
                <CardTitle>{t('pedidos_servicio:general_info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Cliente */}
                <div className="space-y-2">
                  <Label htmlFor="cliente">{t('navigation:client')} *</Label>
                  <Controller
                    name="cliente"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={errors.cliente ? 'border-red-500' : ''}>
                          <SelectValue placeholder={t('pedidos_servicio:select_client')} />
                        </SelectTrigger>
                        <SelectContent>
                          {clientes.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.cliente && <p className="text-sm text-red-500">{errors.cliente.message}</p>}
                </div>

                {/* Fabricador / Instalador */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('pedidos_servicio:fabricator')} *</Label>
                    <Controller
                      name="manufacturador_id"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={errors.manufacturador_id ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            {fabricadores.map((f) => (
                              <SelectItem key={f.id} value={f.id.toString()}>{f.nombre} {f.apellido}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.manufacturador_id && <p className="text-sm text-red-500">{errors.manufacturador_id.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>{t('pedidos_servicio:installer')} *</Label>
                    <Controller
                      name="instalador_id"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={errors.instalador_id ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            {instaladores.map((i) => (
                              <SelectItem key={i.id} value={i.id.toString()}>{i.nombre} {i.apellido}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.instalador_id && <p className="text-sm text-red-500">{errors.instalador_id.message}</p>}
                  </div>
                </div>

                {/* Solicitante y Supervisor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('pedidos_servicio:requester')}</Label>
                    <Input {...register('solicitante')} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('pedidos_servicio:supervisor')}</Label>
                    <Input {...register('supervisor')} />
                  </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('pedidos_servicio:start_date')}</Label>
                    <Input type="date" {...register('fecha_inicio')} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('pedidos_servicio:end_date')}</Label>
                    <Input type="date" {...register('fecha_fin')} />
                  </div>
                </div>

                {/* Observaciones */}
                <div className="space-y-2">
                  <Label>{t('pedidos_servicio:general_observations')}</Label>
                  <Textarea {...register('observaciones')} rows={3} />
                </div>
              </CardContent>
            </Card>

            {/* --- Sección Items --- */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('pedidos_servicio:items_section')}</CardTitle>
                <Button 
                  type="button" 
                  onClick={() => append({ 
                    ambiente: '', modelo: '', tejido: '', largura: 0, altura: 0, 
                    cantidad_piezas: 1, posicion_tejido: '', lado_comando: '', acionamiento: '', observaciones: '' 
                  })} 
                  variant="outline" 
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('pedidos_servicio:add_item')}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm">{t('pedidos_servicio:item')} {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Inputs Básicos */}
                      <div className="space-y-2">
                        <Label>{t('pedidos_servicio:environment')} *</Label>
                        <Input 
                          {...register(`items.${index}.ambiente`)} 
                          className={errors.items?.[index]?.ambiente ? 'border-red-500' : ''} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('pedidos_servicio:model')} *</Label>
                        <Input 
                          {...register(`items.${index}.modelo`)}
                          className={errors.items?.[index]?.modelo ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('pedidos_servicio:fabric')} *</Label>
                        <Input 
                          {...register(`items.${index}.tejido`)}
                          className={errors.items?.[index]?.tejido ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('pedidos_servicio:quantity')}</Label>
                        <Input 
                          type="number" 
                          {...register(`items.${index}.cantidad_piezas`)} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('pedidos_servicio:width')} *</Label>
                        <Input 
                          type="number" step="0.01" 
                          {...register(`items.${index}.largura`)}
                          className={errors.items?.[index]?.largura ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('pedidos_servicio:height')} *</Label>
                        <Input 
                          type="number" step="0.01" 
                          {...register(`items.${index}.altura`)}
                          className={errors.items?.[index]?.altura ? 'border-red-500' : ''}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>{t('pedidos_servicio:fabric_position')} *</Label>
                        <Controller
                          name={`items.${index}.posicion_tejido`}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className={errors.items?.[index]?.posicion_tejido ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Selecciona" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NORMAL">{t('pedidos_servicio:normal')}</SelectItem>
                                <SelectItem value="INVERSO">{t('pedidos_servicio:inverse')}</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('pedidos_servicio:command_side')} *</Label>
                        <Controller
                          name={`items.${index}.lado_comando`}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className={errors.items?.[index]?.lado_comando ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Selecciona" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="IZQUIERDO">{t('pedidos_servicio:left')}</SelectItem>
                                <SelectItem value="DERECHO">{t('pedidos_servicio:right')}</SelectItem>
                                <SelectItem value="AMBOS">{t('pedidos_servicio:both')}</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('pedidos_servicio:actuation')} *</Label>
                        <Controller
                          name={`items.${index}.acionamiento`} // Asegurar que coincida con el backend
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className={errors.items?.[index]?.acionamiento ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Selecciona" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MANUAL">{t('pedidos_servicio:manual')}</SelectItem>
                                <SelectItem value="MOTORIZADO">{t('pedidos_servicio:motorized')}</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('pedidos_servicio:item_observations')}</Label>
                      <Textarea {...register(`items.${index}.observaciones`)} rows={2} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                {t('common:cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('pedidos_servicio:saving') : t('pedidos_servicio:save_changes')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}