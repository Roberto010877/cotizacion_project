/**
 * ============================================================================
 * GUÍA: AGREGAR NUEVOS CAMPOS EN CONFIGURACIÓN UI (configuracion_ui)
 * ============================================================================
 * 
 * Cuando agregas un nuevo campo en el backend como: {"pide_NUEVO_CAMPO": true}
 * debes seguir estos pasos:
 * 
 * PASO 1: Agregar el campo en la sección de atributos dinámicos
 * ---------------------------------------------------------------
 * Ubicación: Línea ~280 (buscar "Atributos Dinámicos")
 * 
 * Template para INPUT:
 * {configUI.pide_NUEVO_CAMPO && (
 *   <div className="space-y-1">
 *     <Label className="text-xs text-blue-800 font-medium">
 *       {t('cotizaciones:TRADUCCION_KEY')}
 *     </Label>
 *     <Input
 *       {...register(`${itemPath}.atributos_seleccionados.NUEVO_CAMPO`)}
 *       placeholder="Placeholder..."
 *       className="h-8 bg-white text-xs"
 *     />
 *   </div>
 * )}
 * 
 * Template para SELECT:
 * {configUI.pide_NUEVO_CAMPO && (
 *   <div className="space-y-1">
 *     <Label className="text-xs text-blue-800 font-medium">
 *       {t('cotizaciones:TRADUCCION_KEY')}
 *     </Label>
 *     <Controller
 *       name={`${itemPath}.atributos_seleccionados.NUEVO_CAMPO` as any}
 *       control={control}
 *       defaultValue="Opcion1"
 *       render={({ field }) => (
 *         <Select onValueChange={field.onChange} value={field.value}>
 *           <SelectTrigger className="h-8 bg-white text-xs">
 *             <SelectValue placeholder="Selec." />
 *           </SelectTrigger>
 *           <SelectContent>
 *             <SelectItem value="Opcion1">Opción 1</SelectItem>
 *             <SelectItem value="Opcion2">Opción 2</SelectItem>
 *           </SelectContent>
 *         </Select>
 *       )}
 *     />
 *   </div>
 * )}
 * 
 * PASO 2: Agregar traducciones en los 3 idiomas
 * ----------------------------------------------
 * Archivos a modificar:
 * - frontend/src/i18n/locales/es/cotizaciones.json
 * - frontend/src/i18n/locales/en/cotizaciones.json
 * - frontend/src/i18n/locales/pt/cotizaciones.json
 * 
 * Agregar la línea (después de "color" o similar):
 * "TRADUCCION_KEY": "Texto en el idioma correspondiente",
 * 
 * Ejemplo:
 * ES: "side": "Lado"
 * EN: "side": "Side"
 * PT: "side": "Lado"
 * 
 * CAMPOS IMPLEMENTADOS ACTUALMENTE:
 * ----------------------------------
 * ✅ pide_apertura    → SELECT (Central, Lateral Izq/Der, Doble)
 * ✅ pide_color       → INPUT (texto libre)
 * ✅ pide_cinta       → INPUT (texto libre)
 * ✅ pide_varillas    → INPUT (texto libre)
 * ✅ pide_tejido      → INPUT (texto libre)
 * ✅ pide_riel        → INPUT (texto libre)
 * ✅ pide_barral      → INPUT (texto libre)
 * ✅ pide_frunce      → SELECT (x2.0, x2.2, x2.5, x3.0)
 * ✅ pide_caida       → SELECT (Regular, Invertida)
 * ✅ pide_mando       → SELECT (Izquierdo, Derecho)
 * ✅ pide_lado_comando → SELECT (Izquierdo, Derecho) - Unificado con pide_mando
 * 
 * NOTA: El orden de los campos en el código determina el orden visual
 * ============================================================================
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Plus, Trash2, Save, Calculator, Check, ChevronsUpDown } from 'lucide-react';
import toast from 'react-hot-toast';

// Imports de UI y Hooks del proyecto
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Hooks personalizados (asumo que existen por tu estructura)
import { useAppTranslation } from '@/i18n/hooks';
import { apiClient } from '@/lib/apiClient';
import useCurrentUser from '@/hooks/useCurrentUser';

// --- Interfaces de Datos (Backend) ---
interface ClienteData {
  id: number;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

interface ProductoServicio {
  id: number;
  codigo: string;
  nombre: string;
  unidad_medida: 'M2' | 'ML' | 'UN' | 'GL';
  precio_base: string | number; // Puede venir como string del API decimal
  requiere_medidas: boolean;
  configuracion_ui: Record<string, any>;
}

// --- Interfaces del Formulario ---
// Definimos tipos auxiliares para el manejo de Zod
type FormValues = z.infer<typeof createCotizacionSchema>;

// --- 1. ESQUEMAS DE VALIDACIÓN ZOD (TEMPORALMENTE SIN VALIDACIONES) ---
// Schemas definidos pero el resolver está deshabilitado

const itemSchema = z.object({
  id: z.number().optional(), // ID del item en modo edición
  producto_id: z.string().min(1, 'Debe seleccionar un producto'),
  producto_nombre: z.string().optional(),
  unidad_medida: z.string().optional(),
  precio_unitario: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  cantidad: z.number().min(0.01, 'La cantidad debe ser mayor a 0'),
  ancho: z.number().min(0, 'El ancho no puede ser negativo').optional(),
  alto: z.number().min(0, 'El alto no puede ser negativo').optional(),
  porcentaje_descuento: z.number().min(0, 'El descuento no puede ser negativo').max(100, 'El descuento no puede ser mayor a 100%').optional(),
  atributos_seleccionados: z.record(z.string(), z.any()).optional(),
  requiere_medidas: z.boolean().optional(),
  configuracion_ui: z.record(z.string(), z.any()).optional(),
});

const ambienteSchema = z.object({
  id: z.number().optional(), // ID del ambiente en modo edición
  nombre: z.string().min(1, 'El nombre del ambiente es requerido'),
  items: z.array(itemSchema).min(1, 'Debe agregar al menos un item al ambiente'),
});

const createCotizacionSchema = z.object({
  cliente: z.string().min(1, 'Debe seleccionar un cliente'),
  vendedor_id: z.string().optional(),
  fecha_validez: z.string().min(1, 'La fecha de validez es requerida'),
  descuento_global: z.number().min(0, 'El descuento no puede ser negativo').max(100, 'El descuento no puede ser mayor a 100%').optional(),
  ambientes: z.array(ambienteSchema).min(1, 'Debe agregar al menos un ambiente con items'),
});

// --- 2. COMPONENTES AUXILIARES (Para mantener el archivo ordenado) ---

// Componente para renderizar una fila de ITEM (Lógica compleja de UI)
const ItemRow = ({ 
  index, 
  ambienteIndex, 
  control, 
  register, 
  remove, 
  errors, 
  catalogo, 
  setValue, 
  t 
}: any) => {
  const itemPath = `ambientes.${ambienteIndex}.items.${index}`;
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  // Observamos valores para reactividad (mostrar/ocultar campos)
  const productoId = useWatch({ control, name: `${itemPath}.producto_id` });
  const requiereMedidas = useWatch({ control, name: `${itemPath}.requiere_medidas` });
  const configUI = useWatch({ control, name: `${itemPath}.configuracion_ui` }) || {};
  const unidadMedida = useWatch({ control, name: `${itemPath}.unidad_medida` });
  const precioUnitario = useWatch({ control, name: `${itemPath}.precio_unitario` });
  const cantidad = useWatch({ control, name: `${itemPath}.cantidad` });
  const ancho = useWatch({ control, name: `${itemPath}.ancho` });
  const alto = useWatch({ control, name: `${itemPath}.alto` });
  const descuento = useWatch({ control, name: `${itemPath}.porcentaje_descuento` });

  // Cálculo del total de la línea en tiempo real
  const totalLinea = useMemo(() => {
    let factor = 1;
    const cant = parseFloat(cantidad) || 0;
    const precio = parseFloat(precioUnitario) || 0;
    const desc = parseFloat(descuento) || 0;

    if (unidadMedida === 'M2' && requiereMedidas) {
        const area = (parseFloat(ancho) || 0) * (parseFloat(alto) || 0);
        factor = Math.max(1, area); // Mínimo 1m2
    } else if (unidadMedida === 'ML') {
        factor = parseFloat(ancho) || 1;
    }

    const subtotal = precio * factor * cant;
    return subtotal * (1 - (desc / 100));
  }, [cantidad, precioUnitario, descuento, unidadMedida, requiereMedidas, ancho, alto]);

  const handleProductoChange = (val: string) => {
    const prod = catalogo.find((p: ProductoServicio) => p.id.toString() === val);
    if (prod) {
        setValue(`${itemPath}.producto_id`, val);
        setValue(`${itemPath}.producto_nombre`, prod.nombre);
        setValue(`${itemPath}.unidad_medida`, prod.unidad_medida);
        setValue(`${itemPath}.precio_unitario`, parseFloat(prod.precio_base.toString()));
        setValue(`${itemPath}.requiere_medidas`, prod.requiere_medidas);
        setValue(`${itemPath}.configuracion_ui`, prod.configuracion_ui);
        setValue(`${itemPath}.cantidad`, 1);
        
        // Reset medidas
        if (prod.unidad_medida === 'M2') {
            setValue(`${itemPath}.ancho`, 1.00);
            setValue(`${itemPath}.alto`, 1.00);
        } else {
            setValue(`${itemPath}.ancho`, 0);
            setValue(`${itemPath}.alto`, 0);
        }
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
      <div className="flex flex-wrap gap-2 items-end">
        {/* 1. Producto (Combobox) - flex-1 con min-width */}
        <div className="flex-1 min-w-[300px] space-y-2">
          <Label className="text-xs font-semibold text-gray-500">{t('cotizaciones:product')}</Label>
          <Controller
            name={`${itemPath}.producto_id` as any}
            control={control}
            render={({ field }) => (
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className={cn(
                      "w-full justify-between h-10",
                      errors?.producto_id && "border-red-500"
                    )}
                  >
                    {field.value
                      ? catalogo.find((prod: ProductoServicio) => prod.id.toString() === field.value)?.nombre
                      : t('cotizaciones:select_product')}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                  <Command>
                    <CommandInput placeholder={t('cotizaciones:search_product')} />
                    <CommandEmpty>{t('cotizaciones:no_product_found')}</CommandEmpty>
                    <CommandGroup>
                      {catalogo.map((prod: ProductoServicio) => (
                        <CommandItem
                          key={prod.id}
                          value={prod.nombre}
                          onSelect={() => {
                            handleProductoChange(prod.id.toString());
                            setPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === prod.id.toString() ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {prod.nombre}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          />
        </div>

        {/* 2. Cantidad - ancho fijo */}
        <div className="w-20 space-y-2">
          <Label className="text-xs font-semibold text-gray-500">
            {t('cotizaciones:quantity')}
          </Label>
          <Input
            type="number"
            step="0.01"
            {...register(`${itemPath}.cantidad`, {
              setValueAs: (v:any) => (v === '' ? 0 : parseFloat(v)),
            })}
            className={cn("h-10", errors?.cantidad && 'border-red-500')}
          />
        </div>

        {/* 3. Medidas (Condicional) - ancho fijo cada una */}
        {requiereMedidas ? (
          <>
            <div className="w-24 space-y-2">
              <Label className="text-xs font-semibold text-gray-500">
                {t('cotizaciones:width')} (m)
              </Label>
              <Input
                type="number"
                step="0.01"
                {...register(`${itemPath}.ancho`, {
                  setValueAs: (v: any) => (v === '' ? 0 : parseFloat(v)),
                })}
                className={cn("h-10", errors?.ancho && 'border-red-500')}
              />
            </div>
            <div className="w-24 space-y-2">
              <Label className="text-xs font-semibold text-gray-500">
                {t('cotizaciones:height')} (m)
              </Label>
              <Input
                type="number"
                step="0.01"
                {...register(`${itemPath}.alto`, {
                  setValueAs: (v:any) => (v === '' ? 0 : parseFloat(v)),
                })}
                className={cn("h-10", errors?.alto && 'border-red-500')}
              />
            </div>
          </>
        ) : (
          <div className="w-48 bg-gray-50 rounded-md flex items-center justify-center text-xs text-gray-400 h-10">
            N/A
          </div>
        )}

        {/* 4. Total Línea - ancho fijo */}
        <div className="w-32 space-y-2">
          <Label className="text-xs font-semibold text-gray-500 text-right block">Total</Label>
          <div className="h-10 flex items-center justify-end font-bold text-gray-700 px-3 bg-gray-100 rounded-md border">
            ${totalLinea.toFixed(2)}
          </div>
        </div>
        
        {/* 5. Botón de Eliminar - ancho fijo */}
        <div className="w-10 flex items-center justify-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-red-500 hover:bg-red-50 hover:text-red-700 h-10 w-10"
            onClick={() => remove(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Atributos Dinámicos (Configuración UI del Producto) */}
      {productoId && Object.keys(configUI).length > 0 && (
        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3 bg-blue-50/30 p-3 rounded-md border border-blue-100">
          
          {/* 1. APERTURA */}
          {configUI.pide_apertura && (
            <div className="space-y-1">
              <Label className="text-xs text-blue-800 font-medium">{t('cotizaciones:opening')}</Label>
              <Controller
                name={`${itemPath}.atributos_seleccionados.apertura` as any}
                control={control}
                defaultValue="Central"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-8 bg-white text-xs">
                      <SelectValue placeholder="Selec." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Central">Central</SelectItem>
                      <SelectItem value="Lateral Izquierda">Lateral Izquierda</SelectItem>
                      <SelectItem value="Lateral Derecha">Lateral Derecha</SelectItem>
                      <SelectItem value="Doble">Doble</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* 2. COLOR */}
          {configUI.pide_color && (
            <div className="space-y-1">
              <Label className="text-xs text-blue-800 font-medium">{t('cotizaciones:color')}</Label>
              <Input
                {...register(`${itemPath}.atributos_seleccionados.color`)}
                placeholder="Color..."
                className="h-8 bg-white text-xs"
              />
            </div>
          )}

          {/* 3. CINTA */}
          {configUI.pide_cinta && (
            <div className="space-y-1">
              <Label className="text-xs text-blue-800 font-medium">{t('cotizaciones:tape')}</Label>
              <Input
                {...register(`${itemPath}.atributos_seleccionados.cinta`)}
                placeholder="Cinta..."
                className="h-8 bg-white text-xs"
              />
            </div>
          )}

          {/* 4. VARILLAS */}
          {configUI.pide_varillas && (
            <div className="space-y-1">
              <Label className="text-xs text-blue-800 font-medium">{t('cotizaciones:rods')}</Label>
              <Input
                {...register(`${itemPath}.atributos_seleccionados.varillas`)}
                placeholder="Varillas..."
                className="h-8 bg-white text-xs"
              />
            </div>
          )}

          {/* 5. TEJIDO */}
          {configUI.pide_tejido && (
            <div className="space-y-1">
              <Label className="text-xs text-blue-800 font-medium">{t('cotizaciones:fabric')}</Label>
              <Input
                {...register(`${itemPath}.atributos_seleccionados.tejido`)}
                placeholder="Tejido..."
                className="h-8 bg-white text-xs"
              />
            </div>
          )}

          {/* 6. RIEL */}
          {configUI.pide_riel && (
            <div className="space-y-1">
              <Label className="text-xs text-blue-800 font-medium">{t('cotizaciones:rail')}</Label>
              <Input
                {...register(`${itemPath}.atributos_seleccionados.riel`)}
                placeholder="Modelo riel..."
                className="h-8 bg-white text-xs"
              />
            </div>
          )}

          {/* 7. BARRAL */}
          {configUI.pide_barral && (
            <div className="space-y-1">
              <Label className="text-xs text-blue-800 font-medium">{t('cotizaciones:rod')}</Label>
              <Input
                {...register(`${itemPath}.atributos_seleccionados.barral`)}
                placeholder="Modelo barral..."
                className="h-8 bg-white text-xs"
              />
            </div>
          )}

          {/* 8. FRUNCE */}
          {configUI.pide_frunce && (
            <div className="space-y-1">
              <Label className="text-xs text-blue-800 font-medium">{t('cotizaciones:gathering')}</Label>
              <Controller
                name={`${itemPath}.atributos_seleccionados.frunce` as any}
                control={control}
                defaultValue="2.0"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-8 bg-white text-xs">
                      <SelectValue placeholder="Selec." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2.0">x 2.0</SelectItem>
                      <SelectItem value="2.2">x 2.2</SelectItem>
                      <SelectItem value="2.5">x 2.5</SelectItem>
                      <SelectItem value="3.0">x 3.0</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* 9. CAÍDA */}
          {configUI.pide_caida && (
            <div className="space-y-1">
              <Label className="text-xs text-blue-800 font-medium">{t('cotizaciones:drop')}</Label>
              <Controller
                name={`${itemPath}.atributos_seleccionados.caida` as any}
                control={control}
                defaultValue="Regular"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-8 bg-white text-xs">
                      <SelectValue placeholder="Selec." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular">Regular (Frente)</SelectItem>
                      <SelectItem value="Invertida">Invertida (Atrás)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* 10. MANDO / LADO COMANDO (Unificado) */}
          {(configUI.pide_mando || configUI.pide_lado_comando) && (
            <div className="space-y-1">
              <Label className="text-xs text-blue-800 font-medium">
                {configUI.pide_mando ? t('cotizaciones:control') : t('cotizaciones:command_side')}
              </Label>
              <Controller
                name={`${itemPath}.atributos_seleccionados.mando` as any}
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-8 bg-white text-xs">
                      <SelectValue placeholder="Selec." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Izquierdo">Izquierdo</SelectItem>
                      <SelectItem value="Derecho">Derecho</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente para manejar la lista de items dentro de un ambiente
const ItemsList = ({ ambienteIndex, control, register, errors, catalogo, setValue, t }: any) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `ambientes.${ambienteIndex}.items`
    });

    const itemsError = errors?.ambientes?.[ambienteIndex]?.items;
    const itemsErrorMessage = !Array.isArray(itemsError) && itemsError?.message ? itemsError.message : null;

    return (
        <div className="space-y-3">
            {fields.map((field, index) => (
                <ItemRow 
                    key={field.id}
                    index={index}
                    ambienteIndex={ambienteIndex}
                    control={control}
                    register={register}
                    remove={remove}
                    errors={errors?.ambientes?.[ambienteIndex]?.items?.[index]}
                    catalogo={catalogo}
                    setValue={setValue}
                    t={t}
                />
            ))}
            
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ 
                    producto_id: '', 
                    cantidad: 1, 
                    precio_unitario: 0, 
                    requiere_medidas: false,
                    atributos_seleccionados: {} 
                })}
                className="w-full border-dashed border-2 hover:bg-gray-50 hover:border-blue-400 text-gray-500"
            >
                <Plus className="mr-2 h-4 w-4" /> {t('cotizaciones:add_item')}
            </Button>
            
            {itemsErrorMessage && (
                <p className="text-xs text-red-500 text-center font-medium">
                    {itemsErrorMessage}
                </p>
            )}
        </div>
    );
};


// --- 3. COMPONENTE PRINCIPAL ---

interface CotizacionFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
  isLoading?: boolean;
  initialData?: any; // Datos de la cotización a editar
  mode?: 'create' | 'edit'; // Modo del formulario
}

export default function CotizacionForm({ 
  onCancel, 
  onSuccess, 
  isLoading: externalLoading,
  initialData,
  mode = 'create'
}: CotizacionFormProps) {
  const { t } = useAppTranslation(['cotizaciones', 'common']);
  const currentUser = useCurrentUser();
  
  // Estado local
  const [clientes, setClientes] = useState<ClienteData[]>([]);
  const [catalogo, setCatalogo] = useState<ProductoServicio[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Configuración del Formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(createCotizacionSchema),
    defaultValues: {
      cliente: '',
      vendedor_id: currentUser?.id?.toString() || '',
      fecha_validez: format(new Date(new Date().setDate(new Date().getDate() + 15)), 'yyyy-MM-dd'), // +15 días por defecto
      descuento_global: 0,
      ambientes: [
        { nombre: '', items: [] }
      ]
    },
    mode: 'onSubmit'
  });

  const { register, control, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, reset } = form;

  // Array de Ambientes (Capa 2)
  const { fields: ambienteFields, append: appendAmbiente, remove: removeAmbiente } = useFieldArray({
    control,
    name: "ambientes"
  });

  // Watch para información de cliente
  const selectedClienteId = watch('cliente');
  const selectedCliente = clientes.find(c => c.id.toString() === selectedClienteId);
  
  // Debug: Log del valor del cliente cuando cambia
  useEffect(() => {
    console.log("👀 [WATCH] selectedClienteId cambió a:", selectedClienteId, "tipo:", typeof selectedClienteId);
  }, [selectedClienteId]);

  // --- EFECTOS: Carga de Datos ---
  useEffect(() => {
    const loadDependencies = async () => {
        try {
            setIsLoadingData(true);
            const [clientesRes, catalogoRes] = await Promise.all([
                apiClient.get('/clientes/?page_size=1000'),
                apiClient.get('/gestion/productos/?page_size=1000&is_active=true')
            ]);
            setClientes(clientesRes.data.results || []);
            setCatalogo(catalogoRes.data.results || []);
        } catch (error) {
            console.error("Error cargando dependencias", error);
            toast.error(t('common:error_loading_data'));
        } finally {
            setIsLoadingData(false);
        }
    };
    loadDependencies();
  }, [t]);

  // NUEVO: Cargar datos iniciales cuando sea modo edición
  const hasLoadedInitialData = useRef(false);
  
  useEffect(() => {
    if (mode === 'edit' && initialData && !isLoadingData && catalogo.length > 0 && clientes.length > 0 && !hasLoadedInitialData.current) {
      console.log("📝 [EDIT MODE] Cargando datos iniciales:", initialData);
      console.log("📦 [EDIT MODE] Catálogo disponible:", catalogo.length, "productos");
      console.log("👥 [EDIT MODE] Clientes disponibles:", clientes.length, "clientes");
      
      // Validar que el estado permita edición
      if (!['BORRADOR', 'ENVIADA'].includes(initialData.estado)) {
        toast.error(t('cotizaciones:cannot_edit_status', { estado: initialData.estado }));
        onCancel();
        return;
      }

      // Transformar datos de la API al formato del formulario
      const formData = {
        cliente: initialData.cliente?.toString() || '',
        vendedor_id: initialData.vendedor?.toString() || initialData.vendedor_id?.toString() || currentUser?.id?.toString() || '',
        fecha_validez: initialData.fecha_validez || '',
        descuento_global: parseFloat(initialData.descuento_total || '0'),
        ambientes: (initialData.ambientes || []).map((amb: any) => {
          console.log("🏠 [EDIT MODE] Procesando ambiente:", amb.nombre, "con", amb.items?.length, "items");
          
          return {
            id: amb.id,
            nombre: amb.nombre || '',
            items: (amb.items || []).map((item: any) => {
              console.log("🔍 [EDIT MODE] Buscando producto:", item.producto_nombre);
              
              // Buscar el producto en el catálogo para obtener toda su info
              const productoCompleto = catalogo.find((p: ProductoServicio) => 
                p.nombre === item.producto_nombre || p.id.toString() === item.producto_id?.toString()
              );
              
              if (productoCompleto) {
                console.log("✅ [EDIT MODE] Producto encontrado:", productoCompleto.nombre);
              } else {
                console.warn("⚠️ [EDIT MODE] Producto NO encontrado en catálogo:", item.producto_nombre);
              }
              
              return {
                id: item.id,
                producto_id: productoCompleto?.id?.toString() || '',
                producto_nombre: item.producto_nombre || '',
                unidad_medida: item.unidad_medida || 'UN',
                precio_unitario: parseFloat(item.precio_unitario || '0'),
                cantidad: parseFloat(item.cantidad || '1'),
                ancho: parseFloat(item.ancho || '0'),
                alto: parseFloat(item.alto || '0'),
                porcentaje_descuento: parseFloat(item.porcentaje_descuento || '0'),
                requiere_medidas: productoCompleto?.requiere_medidas || false,
                configuracion_ui: productoCompleto?.configuracion_ui || {},
                atributos_seleccionados: item.atributos_seleccionados || {},
              };
            })
          };
        })
      };

      console.log("🔄 [EDIT MODE] Datos transformados para el formulario:", formData);
      console.log("📊 [EDIT MODE] Total ambientes:", formData.ambientes.length);
      console.log("📊 [EDIT MODE] Total items:", formData.ambientes.reduce((sum: number, amb: any) => sum + amb.items.length, 0));
      console.log("🎯 [EDIT MODE] Cliente seleccionado:", formData.cliente);
      console.log("🔍 [EDIT MODE] ¿Cliente existe en lista?", clientes.some(c => c.id.toString() === formData.cliente));
      
      reset(formData);
      hasLoadedInitialData.current = true;
      
      // Forzar el valor del cliente con setValue después del reset
      setTimeout(() => {
        setValue('cliente', formData.cliente, { shouldValidate: false });
        console.log("✨ [EDIT MODE] setValue('cliente', '8') ejecutado después del reset");
      }, 0);
      
      console.log("✨ [EDIT MODE] reset() ejecutado con los datos");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialData?.id, isLoadingData, catalogo.length, clientes.length]);

  // Log solo cuando cambia el estado de submitting
  useEffect(() => {
    if (isSubmitting) {
      console.log("⏳ [FORM] Formulario en estado de envío...");
    }
  }, [isSubmitting]);

  // --- MANEJO DE ENVÍO ---
  const onSubmit = async (data: FormValues) => {
    console.log(`🚀 [1] onSubmit iniciado - Modo: ${mode}`);
    console.log("📦 [2] Datos del formulario:", data);
    
    try {
        console.log("🔄 [3] Preparando payload...");
        
        // Limpieza de datos antes de enviar
        // El backend espera una estructura limpia, los campos calculados no se envían
        const payload = {
            cliente: parseInt(data.cliente ?? '0'),
            vendedor_id: data.vendedor_id ? parseInt(data.vendedor_id) : null,
            fecha_validez: data.fecha_validez ?? '',
            descuento_total: data.descuento_global ?? 0, // Backend espera descuento_total
            ambientes: (data.ambientes ?? []).map((ambiente, ambIndex) => {
                const ambientePayload: any = {
                    nombre: ambiente.nombre ?? '',
                    items: (ambiente.items ?? []).map((item, itemIndex) => {
                        const itemPayload: any = {
                            numero_item: itemIndex + 1,
                            producto_id: parseInt(item.producto_id ?? '0'),
                            cantidad: parseFloat(item.cantidad?.toString() ?? '0'),
                            ancho: parseFloat(item.ancho?.toString() ?? '0'),
                            alto: parseFloat(item.alto?.toString() ?? '0'),
                            porcentaje_descuento: parseFloat(item.porcentaje_descuento?.toString() ?? '0'),
                            atributos_seleccionados: item.atributos_seleccionados ?? {}
                        };
                        
                        // Solo incluir ID en modo edición
                        if (mode === 'edit' && item.id) {
                            itemPayload.id = item.id;
                        }
                        
                        return itemPayload;
                    })
                };
                
                // Solo incluir ID y orden en modo edición
                if (mode === 'edit' && ambiente.id) {
                    ambientePayload.id = ambiente.id;
                    ambientePayload.orden = ambIndex + 1;
                }
                // En modo creación, el backend calcula el orden automáticamente
                
                return ambientePayload;
            })
        };

        console.log("📤 [4] Payload preparado:", payload);
        console.log(`🌐 [5] Enviando petición ${mode === 'edit' ? 'PUT' : 'POST'}...`);
        
        let response;
        if (mode === 'edit' && initialData?.id) {
          // Actualizar cotización existente
          response = await apiClient.put(`/gestion/cotizaciones/${initialData.id}/`, payload);
          toast.success(t('cotizaciones:update_success'));
        } else {
          // Crear nueva cotización
          response = await apiClient.post('/gestion/cotizaciones/', payload);
          toast.success(t('cotizaciones:create_success'));
        }
        
        console.log("✅ [6] Respuesta recibida:", response.data);
        
        console.log("🏁 [7] Ejecutando callback de éxito...");
        if (onSuccess) onSuccess();
        else onCancel(); // Volver si no hay callback success
        
        console.log("✨ [8] Proceso completado exitosamente");

    } catch (error: any) {
        console.error(`❌ [ERROR] Error al ${mode === 'edit' ? 'actualizar' : 'crear'} cotización`, error);
        console.error("📋 [ERROR] Detalles del error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        const errorMsg = error.response?.data?.detail || 
                        (mode === 'edit' ? t('cotizaciones:update_error') : t('common:error_generic')) || 
                        "Error al guardar";
        toast.error(errorMsg);
    }
  };

  const onInvalid = (errors: any) => {
    console.log("⚠️ [VALIDACIÓN] Errores de validación detectados");
    
    // Extraer solo los mensajes de error sin referencias circulares
    const extractErrorMessages = (obj: any, path = ''): any => {
      if (!obj) return null;
      
      if (obj.message) {
        return { path, message: obj.message };
      }
      
      if (Array.isArray(obj)) {
        return obj.map((item, idx) => extractErrorMessages(item, `${path}[${idx}]`)).filter(Boolean);
      }
      
      if (typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
          const value = extractErrorMessages(obj[key], path ? `${path}.${key}` : key);
          if (value) result[key] = value;
        }
        return Object.keys(result).length > 0 ? result : null;
      }
      
      return null;
    };
    
    const errorMessages = extractErrorMessages(errors);
    console.log("📝 [VALIDACIÓN] Mensajes de error:", errorMessages);
    
    toast.error(t('common:check_form_errors') || "Por favor revise los errores en el formulario");
  };

  if (isLoadingData) {
      return <div className="p-8 text-center">Cargando...</div>;
  }

  return (
    <form onSubmit={(e) => {
      console.log("🖱️ [SUBMIT] Evento submit capturado");
      handleSubmit(onSubmit, onInvalid)(e);
    }} className="space-y-6 pb-20">
      
      {/* 1. ENCABEZADO (Igual que PedidoServicio) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            {t('cotizaciones:general_info')}
          </CardTitle>
          <CardDescription>{t('cotizaciones:basic_data_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cliente */}
                <div className="space-y-2">
                    <Label>{t('common:client')} *</Label>
                    <Controller
                        key={`cliente-${mode}-${initialData?.id || 'new'}`}
                        name="cliente"
                        control={control}
                        render={({ field }) => (
                            <Select 
                                onValueChange={field.onChange} 
                                value={field.value}
                            >
                                <SelectTrigger className={errors.cliente ? 'border-red-500' : ''}>
                                    <SelectValue placeholder={t('cotizaciones:select_client')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clientes.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.cliente && <p className="text-xs text-red-600">{errors.cliente.message}</p>}
                </div>

                {/* Info Cliente (Readonly) */}
                <div className="space-y-2">
                    <Label>{t('cotizaciones:client_phone')}</Label>
                    <Input readOnly value={selectedCliente?.telefono || '-'} className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                    <Label>{t('cotizaciones:client_email')}</Label>
                    <Input readOnly value={selectedCliente?.email || '-'} className="bg-gray-50" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                     <Label>{t('cotizaciones:validity_date')} *</Label>
                     <Input type="date" {...register('fecha_validez')} className={errors.fecha_validez ? 'border-red-500' : ''} />
                </div>
                 <div className="space-y-2">
                     <Label>{t('cotizaciones:global_discount')} (%)</Label>
                     <Input type="number" step="0.01" max="100" {...register('descuento_global', { 
                         setValueAs: (v: any) => v === '' ? 0 : parseFloat(v) 
                     })} placeholder="0" />
                </div>
            </div>

        </CardContent>
      </Card>

      {/* 2. AMBIENTES E ITEMS (Estructura de 3 Capas) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{t('cotizaciones:environments_and_items')}</h3>
            <Button 
                type="button" 
                onClick={() => appendAmbiente({ nombre: '', items: [] })}
                variant="secondary"
                size="sm"
            >
                <Plus className="h-4 w-4 mr-2" /> {t('cotizaciones:add_environment')}
            </Button>
        </div>

        {ambienteFields.map((ambiente, idx) => (
            <Card key={ambiente.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3 bg-gray-50/40 border-b">
                    <div className="flex items-center justify-between">
                        <div className="w-full max-w-md">
                            <Label className="text-xs text-gray-500 uppercase mb-1 block">{t('cotizaciones:environment_name')}</Label>
                            <Input 
                                {...register(`ambientes.${idx}.nombre` as const)} 
                                placeholder="Ej: Sala Principal, Dormitorio..."
                                className={`font-semibold ${errors.ambientes?.[idx]?.nombre ? 'border-red-500' : ''}`}
                            />
                            {errors.ambientes?.[idx]?.nombre && (
                                <p className="text-xs text-red-500 mt-1">{errors.ambientes[idx].nombre?.message}</p>
                            )}
                        </div>
                        {ambienteFields.length > 1 && (
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500"
                                onClick={() => removeAmbiente(idx)}
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-4 bg-gray-50/20">
                    {/* LISTA DE ITEMS DENTRO DEL AMBIENTE */}
                    <ItemsList 
                        ambienteIndex={idx}
                        control={control}
                        register={register}
                        errors={errors}
                        catalogo={catalogo}
                        setValue={setValue}
                        t={t}
                    />
                </CardContent>
            </Card>
        ))}
      </div>

      {/* FOOTER FLOTANTE O BOTONES DE ACCIÓN */}
      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white p-4 shadow-lg z-10 rounded-lg">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting || externalLoading}>
          {t('common:cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting || externalLoading} className="min-w-[150px]">
          {isSubmitting || externalLoading ? (
             <span className="flex items-center gap-2">
               {mode === 'edit' ? t('cotizaciones:saving_changes') : 'Guardando...'}
             </span>
          ) : (
             <span className="flex items-center gap-2">
               <Save className="h-4 w-4" /> 
               {mode === 'edit' ? t('cotizaciones:update_btn') : t('cotizaciones:create_btn')}
             </span>
          )}
        </Button>
      </div>

    </form>
  );
}