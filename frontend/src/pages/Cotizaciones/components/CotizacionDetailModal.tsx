import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Loader2, X, Printer } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { useAppTranslation } from "@/i18n/hooks";
import { apiClient } from '@/lib/apiClient';

// --- Tipos de Datos (Adaptados a la respuesta del Backend) ---
interface ItemCotizacion {
  id: number;
  numero_item: number;
  producto_codigo?: string; // Asumiendo que el serializer lo envía o está en producto nested
  producto_nombre: string;
  unidad_medida: string;
  cantidad: number;
  ancho: number;
  alto: number;
  precio_unitario: number;
  precio_total: number;
  descripcion_completa: string; // El snapshot de texto
  atributos_especificos?: {
    observaciones?: string;
  };
}

interface AmbienteCotizacion {
  id: number;
  nombre: string;
  items: ItemCotizacion[];
}

interface CotizacionDetail {
  id: number;
  numero: string;
  cliente_nombre: string;
  vendedor_nombre: string;
  fecha_emision: string;
  fecha_validez: string;
  estado: string;
  observaciones: string;
  total_general: number;
  descuento_total: number;
  ambientes: AmbienteCotizacion[]; // Estructura anidada
}

interface CotizacionDetailModalProps {
  cotizacionId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CotizacionDetailModal = ({
  cotizacionId,
  isOpen,
  onClose,
}: CotizacionDetailModalProps) => {
  const { t } = useAppTranslation(['cotizaciones', 'common']);
  const [cotizacion, setCotizacion] = useState<CotizacionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos al abrir
  useEffect(() => {
    if (isOpen && cotizacionId) {
      fetchCotizacion(cotizacionId);
    } else {
      setCotizacion(null);
    }
  }, [isOpen, cotizacionId]);

  const fetchCotizacion = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Ajusta la URL según tu router en Django
      const { data } = await apiClient.get(`/cotizaciones/${id}/`);
      setCotizacion(data);
    } catch (err) {
      console.error("Error fetching detail:", err);
      setError(t('common:error_loading_data') || "Error cargando la cotización");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cotizacion) return;
    try {
      // Endpoint definido en tu ViewSet (action 'pdf')
      const response = await apiClient.get(`/cotizaciones/${cotizacion.id}/pdf/`, {
        responseType: 'blob', // Importante para descargar archivos
      });
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${cotizacion.numero}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error("Error downloading PDF:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BORRADOR': return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
      case 'ENVIADA': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'ACEPTADA': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'RECHAZADA': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
        
        {/* HEADER MODAL */}
        <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between bg-gray-50/50">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-xl flex items-center gap-3">
               {isLoading ? (
                 <span className="w-32 h-6 bg-gray-200 animate-pulse rounded" />
               ) : (
                 <>
                   Presupuesto #{cotizacion?.numero}
                   {cotizacion && (
                     <Badge className={`ml-2 ${getStatusColor(cotizacion.estado)}`}>
                       {cotizacion.estado}
                     </Badge>
                   )}
                 </>
               )}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {t('cotizaciones:detail_subtitle') || "Detalles completos de la cotización"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        {/* CONTENIDO SCROLLABLE */}
        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">Cargando información...</p>
            </div>
          ) : error ? (
             <div className="flex items-center justify-center h-64 text-red-500">
                {error}
             </div>
          ) : cotizacion ? (
            <div className="space-y-8">

              {/* 1. INFORMACIÓN DEL ENCABEZADO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-lg border shadow-sm">
                 <div className="space-y-3">
                    <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Cliente</span>
                        <p className="font-medium text-lg">{cotizacion.cliente_nombre}</p>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Vendedor</span>
                        <p className="text-sm">{cotizacion.vendedor_nombre || 'Sistema'}</p>
                    </div>
                 </div>
                 <div className="space-y-3 text-right md:text-left">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase">Fecha Emisión</span>
                            <p className="font-medium">
                                {cotizacion.fecha_emision ? format(new Date(cotizacion.fecha_emision), 'dd/MM/yyyy') : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase">Válido Hasta</span>
                            <p className="font-medium text-red-600">
                                {cotizacion.fecha_validez ? format(new Date(cotizacion.fecha_validez), 'dd/MM/yyyy') : '-'}
                            </p>
                        </div>
                    </div>
                 </div>
              </div>

              {/* 2. ITERACIÓN POR AMBIENTES (ESTILO PDF) */}
              <div className="space-y-6">
                {cotizacion.ambientes?.map((ambiente) => (
                    <div key={ambiente.id} className="border rounded-lg overflow-hidden shadow-sm bg-white">
                        {/* CABECERA DE AMBIENTE */}
                        <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
                            <h3 className="font-bold text-sm uppercase text-gray-700">
                                Ambiente: {ambiente.nombre}
                            </h3>
                            <Badge variant="outline" className="text-[10px] bg-white">
                                {ambiente.items.length} ítems
                            </Badge>
                        </div>

                        {/* TABLA DE ITEMS */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-3 py-2 text-center w-[5%]">#</th>
                                        <th className="px-3 py-2 text-center w-[10%]">Código</th>
                                        <th className="px-3 py-2 w-[25%]">Tipo</th>
                                        <th className="px-3 py-2 text-center w-[8%]">Cant</th>
                                        <th className="px-3 py-2 text-center w-[10%]">Ancho</th>
                                        <th className="px-3 py-2 text-center w-[10%]">Alto</th>
                                        <th className="px-3 py-2 text-center w-[8%]">Un</th>
                                        <th className="px-3 py-2 text-right w-[12%]">V. Unit</th>
                                        <th className="px-3 py-2 text-right w-[12%]">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {ambiente.items.map((item) => (
                                        <>
                                            {/* FILA 1: DATOS NUMÉRICOS */}
                                            <tr key={`data-${item.id}`} className="bg-white hover:bg-gray-50/50">
                                                <td className="px-3 py-2 text-center font-medium text-gray-500">
                                                    {item.numero_item}
                                                </td>
                                                <td className="px-3 py-2 text-center text-gray-600">
                                                    {item.producto_codigo || '-'}
                                                </td>
                                                <td className="px-3 py-2 font-medium text-gray-900">
                                                    {item.producto_nombre}
                                                </td>
                                                <td className="px-3 py-2 text-center font-bold">
                                                    {item.cantidad}
                                                </td>
                                                <td className="px-3 py-2 text-center text-gray-600">
                                                    {item.ancho > 0 ? item.ancho : '-'}
                                                </td>
                                                <td className="px-3 py-2 text-center text-gray-600">
                                                    {item.alto > 0 ? item.alto : '-'}
                                                </td>
                                                <td className="px-3 py-2 text-center text-xs text-gray-500">
                                                    {item.unidad_medida}
                                                </td>
                                                <td className="px-3 py-2 text-right tabular-nums">
                                                    {item.precio_unitario.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-3 py-2 text-right font-bold tabular-nums">
                                                    {item.precio_total.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>

                                            {/* FILA 2: DESCRIPCIÓN (SNAPSHOT) */}
                                            <tr key={`desc-${item.id}`} className="bg-white">
                                                <td colSpan={9} className="px-3 pb-4 pt-1 border-b border-gray-200">
                                                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 italic">
                                                        <span className="font-semibold not-italic text-gray-700 mr-2">Detalle:</span>
                                                        {item.descripcion_completa}
                                                        
                                                        {item.atributos_especificos?.observaciones && (
                                                            <div className="mt-1 text-amber-700 not-italic">
                                                                <span className="font-bold">Nota:</span> {item.atributos_especificos.observaciones}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
              </div>

              {/* 3. TOTALES Y OBSERVACIONES */}
              <div className="flex flex-col md:flex-row gap-6 justify-between pt-4">
                 <div className="flex-1">
                    {cotizacion.observaciones && (
                        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                            <h4 className="text-sm font-bold text-yellow-800 mb-1">Observaciones Generales</h4>
                            <p className="text-sm text-yellow-700 whitespace-pre-wrap">
                                {cotizacion.observaciones}
                            </p>
                        </div>
                    )}
                 </div>
                 
                 <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded-lg border space-y-2">
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">
                            {(cotizacion.total_general + (cotizacion.descuento_total || 0)).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
                        </span>
                     </div>
                     
                     {cotizacion.descuento_total > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                            <span>Descuento</span>
                            <span>- {cotizacion.descuento_total.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}</span>
                        </div>
                     )}

                     <Separator className="my-2" />
                     
                     <div className="flex justify-between items-end">
                        <span className="font-bold text-lg">Total</span>
                        <span className="font-bold text-2xl text-blue-700">
                            {cotizacion.total_general.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
                        </span>
                     </div>
                 </div>
              </div>

            </div>
          ) : null}
        </ScrollArea>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 border-t bg-gray-50 flex flex-row justify-between items-center sm:justify-between">
            <div className="text-xs text-muted-foreground hidden sm:block">
                ID Interno: {cotizacion?.id}
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                    Cerrar
                </Button>
                <Button onClick={handleDownloadPDF} disabled={!cotizacion} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Printer className="h-4 w-4" />
                    Descargar PDF
                </Button>
            </div>
        </DialogFooter>
        
      </DialogContent>
    </Dialog>
  );
};