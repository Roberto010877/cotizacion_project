import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {apiClient} from '@/lib/apiClient';
import useCurrentUser from '@/hooks/useCurrentUser';

// --- Interfaces de Datos ---
interface ClienteData {
  id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

interface Instalador {
  id: number;
  nombre: string;
  apellido: string;
  email?: string;
}

// --- Esquema de Validación Zod ---
// Definimos el esquema base de Item para reuso y tipado
const itemSchema = (t: any) => z.object({
  // Nota: Dejamos el 'id' fuera del esquema principal de Zod ya que es un campo temporal para el envío/manejo de errores,
  // pero lo usaremos en el tipo SubmissionValues para mayor claridad.
  ambiente: z.string().min(1, t('pedidos_servicio:error_environment_required')),
  modelo: z.string().min(1, t('pedidos_servicio:error_model_required')),
  tejido: z.string().min(1, t('pedidos_servicio:error_fabric_required')),
  // z.coerce.number() convierte el string del input a número automáticamente
  largura: z.coerce.number()
    .positive(t('pedidos_servicio:error_width_required') || "Debe ser mayor a 0"),
  altura: z.coerce.number()
    .positive(t('pedidos_servicio:error_height_required') || "Debe ser mayor a 0"),
  cantidad_piezas: z.coerce.number()
    .int()
    .min(1, t('pedidos_servicio:min_one_item_error') || "Mínimo 1 pieza"),
  posicion_tejido: z.string().min(1, t('pedidos_servicio:error_fabric_position_required')),
  lado_comando: z.string().min(1, t('pedidos_servicio:error_command_side_required')),
  accionamiento: z.string().min(1, t('pedidos_servicio:error_actuation_required')),
  observaciones: z.string().optional(),
});

const createPedidoSchema = (t: any) => z.object({
  cliente: z.string().min(1, t('pedidos_servicio:error_client_required')),
  solicitante: z.string().optional(),
  supervisor: z.string().optional(),
  fabricador_id: z.string().min(1, t('pedidos_servicio:error_fabricador_required')),
  instalador_id: z.string().min(1, t('pedidos_servicio:error_instalador_required')),
  fecha_inicio: z.string().optional().refine((val) => {
    if (!val) return true;
    const today = new Date().toISOString().split('T')[0];
    return val >= today;
  }, { message: t('pedidos_servicio:error_start_date_past') }),
  fecha_fin: z.string().optional(),
  observaciones: z.string().optional(),
  items: z.array(itemSchema(t)).min(1, t('pedidos_servicio:error_min_one_item')),
}).refine((data) => {
  // Validación cruzada: Fecha fin >= Fecha inicio
  if (data.fecha_inicio && data.fecha_fin) {
    return data.fecha_fin >= data.fecha_inicio;
  }
  return true;
}, {
  message: t('pedidos_servicio:error_end_date_before_start'),
  path: ["fecha_fin"], // El error aparecerá en este campo
});

// Inferir el tipo de TypeScript desde el esquema
type FormValues = z.infer<ReturnType<typeof createPedidoSchema>>;

// Definir el tipo de datos que realmente se envía (incluyendo el ID temporal)
type SubmissionItem = FormValues['items'][number] & { id: string };
type SubmissionValues = Omit<FormValues, 'items'> & { items: SubmissionItem[] };


interface CreatePedidoServicioFormProps {
  clientes: ClienteData[];
  isLoading?: boolean;
  // Usamos 'any' en el onSubmit para no complicar el tipo de dato de la prop externa,
  // ya que le añadiremos el 'id' temporal al enviar.
  onSubmit?: (data: SubmissionValues) => void;
  onCancel?: () => void;
  externalErrors?: { [key: string]: string };
}

export default function CreatePedidoServicioForm({
  clientes = [],
  isLoading = false,
  onSubmit,
  onCancel,
  externalErrors,
}: CreatePedidoServicioFormProps) {
  const { t } = useAppTranslation(['pedidos_servicio', 'common']);
  const currentUser = useCurrentUser();
  const [fabricadores, setFabricadores] = useState<Instalador[]>([]);
  const [instaladores, setInstaladores] = useState<Instalador[]>([]);

  // 1. Configuración de React Hook Form + Zod
  const form = useForm<FormValues>({
    resolver: zodResolver(createPedidoSchema(t)) as any,
    defaultValues: {
      cliente: '',
      solicitante: '',
      supervisor: '',
      fecha_inicio: '',
      fecha_fin: '',
      observaciones: '',
      fabricador_id: '',
      instalador_id: '',
      items: [{
        ambiente: '',
        modelo: '',
        tejido: '',
        largura: 0, // Inicializar como número
        altura: 0,
        cantidad_piezas: 1,
        posicion_tejido: '',
        lado_comando: '',
        accionamiento: '',
        observaciones: ''
      }]
    },
    mode: 'onChange'
  });

  const { register, control, handleSubmit, formState: { errors }, setValue, watch, setError } = form;
  
  // 2. Gestión optimizada de Arrays (Items)
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // Watch para mostrar datos del cliente seleccionado en tiempo real
  const selectedClienteId = watch('cliente');
  const selectedClienteData = clientes.find(c => c.id.toString() === selectedClienteId);

  // 3. Manejo de Efectos (Cargas y Usuarios)
  
  // Cargar nombre del usuario
  useEffect(() => {
    if (currentUser) {
      const fullName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.username || '';
      setValue('solicitante', fullName);
    }
  }, [currentUser, setValue]);

  // Cargar personal (Array vacío para ejecutar solo una vez al montar)
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
        toast.error(t('common:error_loading') || 'Error al cargar personal');
      }
    };
    loadPersonal();
  }, []);

  // AJUSTE CRÍTICO 1: Manejo de errores externos del backend con mapeo de claves de array
  useEffect(() => {
    if (externalErrors) {
      Object.entries(externalErrors).forEach(([key, message]) => {
        // Mapear errores de array: ej. "cantidad_piezas-0" -> "items.0.cantidad_piezas"
        const match = key.match(/^(.+)-(\d+)$/);

        if (match) {
          const [, fieldKey, indexStr] = match;
          const index = parseInt(indexStr, 10);
          
          // Validar que el índice exista en el array de items actual
          if (index >= 0 && index < fields.length) {
            // Construir la clave de error de RHF
            const rhfKey = `items.${index}.${fieldKey}` as keyof FormValues;
            setError(rhfKey, { type: 'manual', message });
          }
        } else {
          // Errores de campos a nivel general
          setError(key as keyof FormValues, { type: 'manual', message });
        }
      });
      
      // Mostrar toast si se encontraron errores
      if (Object.keys(externalErrors).length > 0) {
          toast.error(t('pedidos_servicio:validation_errors'));
      }
    }
  }, [externalErrors, setError, t, fields]); // Se añade 'fields' a las dependencias

  // 4. Manejo del Envío
  // AJUSTE CRÍTICO 2: Añadir ID temporal antes de enviar al backend
  const onValidSubmit = (data: FormValues) => {
    // Agregar IDs temporales a los items para que el backend pueda devolver un error
    // mapeable (ej. "cantidad_piezas-0")
    const dataWithIds: SubmissionValues = {
      ...data,
      items: data.items.map((item, index) => ({
        ...item,
        // Usamos el índice como ID temporal
        id: String(index),
      })),
    } as SubmissionValues; // Casteamos al tipo de SubmissionValues

    if (onSubmit) {
      onSubmit(dataWithIds);
    }
  };

  const onInvalidSubmit = () => {
    toast.error(t('pedidos_servicio:validation_errors_check_fields') || "Revise los campos marcados en rojo");
  };

  return (
    <form onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)} className="space-y-6">
      {/* Datos principales del pedido */}
      <Card>
        <CardHeader>
          <CardTitle>{t('pedidos_servicio:general_info')}</CardTitle>
          <CardDescription>{t('pedidos_servicio:basic_data')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">{t('common:client')} *</Label>
              <Controller
                name="cliente"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.cliente ? 'border-red-500' : ''}>
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
                )}
              />
              {errors.cliente && <p className="text-sm text-red-600">{errors.cliente.message}</p>}
            </div>

            {/* Datos ReadOnly del Cliente */}
            <div className="space-y-2">
              <Label>{t('pedidos_servicio:client_phone')}</Label>
              <div className="flex items-center px-3 h-10 border rounded-md bg-muted/50 text-sm">
                {selectedClienteData?.telefono || t('pedidos_servicio:no_phone')}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('pedidos_servicio:client_contact')}</Label>
              <div className="flex items-center px-3 h-10 border rounded-md bg-muted/50 text-sm">
                {selectedClienteData?.email || t('pedidos_servicio:no_contact')}
              </div>
            </div>
          </div>

          {selectedClienteData?.direccion && (
            <div className="space-y-2">
              <Label>{t('pedidos_servicio:client_address')}</Label>
              <div className="flex items-center px-3 min-h-10 border rounded-md bg-muted/50 text-sm">
                {selectedClienteData.direccion}
              </div>
            </div>
          )}

          {/* Fabricador e Instalador */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fabricador *</Label>
              <Controller
                name="fabricador_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.fabricador_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona un Fabricador" />
                    </SelectTrigger>
                    <SelectContent>
                      {fabricadores.map((fab) => (
                        <SelectItem key={fab.id} value={fab.id.toString()}>
                          {fab.nombre} {fab.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.fabricador_id && <p className="text-sm text-red-600">{errors.fabricador_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Instalador *</Label>
              <Controller
                name="instalador_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.instalador_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona un Instalador" />
                    </SelectTrigger>
                    <SelectContent>
                      {instaladores.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id.toString()}>
                          {inst.nombre} {inst.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.instalador_id && <p className="text-sm text-red-600">{errors.instalador_id.message}</p>}
            </div>
          </div>

          {/* Solicitante y Supervisor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="solicitante">{t('pedidos_servicio:requester')}</Label>
              <Input
                {...register('solicitante')}
                placeholder={t('pedidos_servicio:requester_default')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supervisor">{t('pedidos_servicio:supervisor')}</Label>
              <Input
                {...register('supervisor')}
                placeholder={t('pedidos_servicio:supervisor_placeholder')}
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">{t('pedidos_servicio:start_date_label')}</Label>
              <Input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className={errors.fecha_inicio ? 'border-red-500' : ''}
                {...register('fecha_inicio')}
              />
              {errors.fecha_inicio && <p className="text-sm text-red-600">{errors.fecha_inicio.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_fin">{t('pedidos_servicio:end_date_label')}</Label>
              <Input
                type="date"
                className={errors.fecha_fin ? 'border-red-500' : ''}
                {...register('fecha_fin')}
              />
              {errors.fecha_fin && <p className="text-sm text-red-600">{errors.fecha_fin.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">{t('pedidos_servicio:general_observations')}</Label>
            <Textarea
              {...register('observaciones')}
              placeholder={t('pedidos_servicio:order_notes')}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items del pedido (Dinámicos) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('pedidos_servicio:items_section')}</CardTitle>
            <CardDescription>{t('pedidos_servicio:items_description')}</CardDescription>
          </div>
          <Button 
            type="button" // Importante: type button para que no envíe el form
            onClick={() => append({
              ambiente: '', modelo: '', tejido: '', largura: 0, altura: 0, 
              cantidad_piezas: 1, posicion_tejido: '', lado_comando: '', accionamiento: '', observaciones: ''
            })} 
            variant="outline" size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('pedidos_servicio:add_item')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 space-y-4 relative bg-card">
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
                {/* Ambiente */}
                <div className="space-y-2">
                  <Label>
                    {t('pedidos_servicio:environment')} *
                  </Label>
                  <Input
                    {...register(`items.${index}.ambiente`)}
                    placeholder={t('pedidos_servicio:environment_placeholder')}
                    className={errors.items?.[index]?.ambiente ? 'border-red-500' : ''}
                  />
                  {errors.items?.[index]?.ambiente && 
                    <p className="text-xs text-red-600">{errors.items[index]?.ambiente?.message}</p>
                  }
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                  <Label>{t('pedidos_servicio:model')} *</Label>
                  <Input
                    {...register(`items.${index}.modelo`)}
                    placeholder={t('pedidos_servicio:model_placeholder')}
                    className={errors.items?.[index]?.modelo ? 'border-red-500' : ''}
                  />
                  {errors.items?.[index]?.modelo && 
                    <p className="text-xs text-red-600">{errors.items[index]?.modelo?.message}</p>
                  }
                </div>

                {/* Tejido */}
                <div className="space-y-2">
                  <Label>{t('pedidos_servicio:fabric')} *</Label>
                  <Input
                    {...register(`items.${index}.tejido`)}
                    placeholder={t('pedidos_servicio:fabric_placeholder')}
                    className={errors.items?.[index]?.tejido ? 'border-red-500' : ''}
                  />
                  {errors.items?.[index]?.tejido && 
                    <p className="text-xs text-red-600">{errors.items[index]?.tejido?.message}</p>
                  }
                </div>

                {/* Cantidad */}
                <div className="space-y-2">
                  <Label>{t('pedidos_servicio:quantity')} *</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    {...register(`items.${index}.cantidad_piezas`)}
                    className={errors.items?.[index]?.cantidad_piezas ? 'border-red-500' : ''}
                  />
                  {errors.items?.[index]?.cantidad_piezas && 
                    <p className="text-xs text-red-600">{errors.items[index]?.cantidad_piezas?.message}</p>
                  }
                </div>
              </div>

              {/* Medidas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('pedidos_servicio:width')} *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder={t('pedidos_servicio:width_placeholder')}
                    {...register(`items.${index}.largura`)}
                    className={errors.items?.[index]?.largura ? 'border-red-500' : ''}
                  />
                  {errors.items?.[index]?.largura && 
                    <p className="text-xs text-red-600">{errors.items[index]?.largura?.message}</p>
                  }
                </div>
                <div className="space-y-2">
                  <Label>{t('pedidos_servicio:height')} *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder={t('pedidos_servicio:height_placeholder')}
                    {...register(`items.${index}.altura`)}
                    className={errors.items?.[index]?.altura ? 'border-red-500' : ''}
                  />
                  {errors.items?.[index]?.altura && 
                    <p className="text-xs text-red-600">{errors.items[index]?.altura?.message}</p>
                  }
                </div>
              </div>

              {/* Selects de configuración del Item */}
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
                  {errors.items?.[index]?.posicion_tejido && 
                    <p className="text-xs text-red-600">{errors.items[index]?.posicion_tejido?.message}</p>
                  }
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
                  {errors.items?.[index]?.lado_comando && 
                    <p className="text-xs text-red-600">{errors.items[index]?.lado_comando?.message}</p>
                  }
                </div>

                <div className="space-y-2">
                  <Label>{t('pedidos_servicio:actuation')} *</Label>
                  <Controller
                    name={`items.${index}.accionamiento`}
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={errors.items?.[index]?.accionamiento ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MANUAL">{t('pedidos_servicio:manual')}</SelectItem>
                          <SelectItem value="MOTORIZADO">{t('pedidos_servicio:motorized')}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.items?.[index]?.accionamiento && 
                    <p className="text-xs text-red-600">{errors.items[index]?.accionamiento?.message}</p>
                  }
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('pedidos_servicio:item_observations')}</Label>
                <Textarea
                  {...register(`items.${index}.observaciones`)}
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
        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
          {t('common:cancel')}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t('pedidos_servicio:creating') : t('pedidos_servicio:create_btn')}
        </Button>
      </div>
    </form>
  );
}