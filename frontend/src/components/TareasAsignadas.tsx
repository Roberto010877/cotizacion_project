import React, { useState } from 'react';
import { usePaginatedAsignaciones, useUpdateAsignacion, type AsignacionTarea } from '@/hooks/usePaginatedAsignaciones';
import { useAppTranslation } from '@/i18n/hooks';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TareaDetalleModal } from './TareaDetalleModal';

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

interface TareasAsignadasProps {
  filtroTipo?: string;
  filtroEstado?: string;
}

export const TareasAsignadas: React.FC<TareasAsignadasProps> = ({
  filtroTipo = '',
  filtroEstado = '',
}) => {
  const { t } = useAppTranslation(['pedidos-servicio', 'common']);
  const [page, setPage] = useState(1);
  const [tipoFiltro, setTipoFiltro] = useState(filtroTipo);
  const [estadoFiltro, setEstadoFiltro] = useState(filtroEstado);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedTarea, setSelectedTarea] = useState<AsignacionTarea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filters: Record<string, any> = {};
  if (tipoFiltro) filters.tipo_tarea = tipoFiltro;
  if (estadoFiltro) filters.estado = estadoFiltro;

  const { data, isLoading, error } = usePaginatedAsignaciones(page, filters);
  const { mutate: updateAsignacion } = useUpdateAsignacion();

  const handleInitiarTarea = (tareaId: number) => {
    setLoadingId(tareaId);
    setErrorMsg(null);
    updateAsignacion(
      { id: tareaId, updates: { estado: 'EN_PROGRESO' } },
      {
        onSuccess: () => {
          setSuccessId(tareaId);
          setLoadingId(null);
          setTimeout(() => setSuccessId(null), 2000);
        },
        onError: (error: any) => {
          setErrorMsg(error.response?.data?.detail || 'Error al iniciar tarea');
          setLoadingId(null);
        },
      }
    );
  };

  const handleCompletarTarea = (tareaId: number) => {
    setLoadingId(tareaId);
    setErrorMsg(null);
    updateAsignacion(
      { id: tareaId, updates: { estado: 'COMPLETADO' } },
      {
        onSuccess: () => {
          setSuccessId(tareaId);
          setLoadingId(null);
          setTimeout(() => setSuccessId(null), 2000);
        },
        onError: (error: any) => {
          setErrorMsg(error.response?.data?.detail || 'Error al completar tarea');
          setLoadingId(null);
        },
      }
    );
  };

  const handleVerDetalles = (tarea: AsignacionTarea) => {
    setSelectedTarea(tarea);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {t('pedidos-servicio:error_loading_detail') || 'Error al cargar tareas'}
      </div>
    );
  }

  const tareas = data?.results || [];

  return (
    <div className="space-y-6">
      {/* Título con contador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{t('pedidos-servicio:assigned_tasks_title')}</span>
            <span className="text-sm font-normal text-gray-500">
              ({data?.count || 0} {data?.count === 1 ? 'tarea' : 'tareas'})
            </span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Notificación de Error */}
      {errorMsg && (
        <Card className="bg-red-50 border border-red-200">
          <CardContent className="pt-6 flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{errorMsg}</span>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('pedidos-servicio:task_filters')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro por Tipo */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              {t('pedidos-servicio:task_type_filter')}
            </label>
            <Select value={tipoFiltro || 'all'} onValueChange={(val) => setTipoFiltro(val === 'all' ? '' : val)}>
              <SelectTrigger>
                <SelectValue placeholder={t('pedidos-servicio:task_type_all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('pedidos-servicio:task_type_all')}</SelectItem>
                <SelectItem value="FABRICACION">{t('pedidos-servicio:task_type_fabrication')}</SelectItem>
                <SelectItem value="INSTALACION">{t('pedidos-servicio:task_type_installation')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              {t('pedidos-servicio:task_status_filter')}
            </label>
            <Select value={estadoFiltro || 'all'} onValueChange={(val) => setEstadoFiltro(val === 'all' ? '' : val)}>
              <SelectTrigger>
                <SelectValue placeholder={t('pedidos-servicio:task_status_all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('pedidos-servicio:task_status_all')}</SelectItem>
                <SelectItem value="PENDIENTE">{t('pedidos-servicio:task_status_pending')}</SelectItem>
                <SelectItem value="EN_PROGRESO">{t('pedidos-servicio:task_status_in_progress')}</SelectItem>
                <SelectItem value="COMPLETADO">{t('pedidos-servicio:task_status_completed')}</SelectItem>
                <SelectItem value="CANCELADO">{t('pedidos-servicio:task_status_cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tareas */}
      {tareas.length > 0 ? (
        <div className="space-y-4">
          {tareas.map((tarea) => (
            <Card key={tarea.id} className="hover:shadow-lg transition">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Columna 1 */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-blue-600">
                        {t('pedidos-servicio:task_order_number')}: {tarea.pedido_numero}
                      </h3>
                      <Badge className={ESTADO_COLORS[tarea.estado] || ''}>
                        {tarea.estado_display}
                      </Badge>
                    </div>

                    <div className="space-y-2">
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
                        <p className="text-xs text-gray-500">{t('common:created')}</p>
                        <p className="text-sm">
                          {new Date(tarea.fecha_asignacion).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Columna 2 */}
                  <div>
                    <div>
                      <p className="text-xs text-gray-500">{t('pedidos-servicio:task_expected_delivery')}</p>
                      <p className="text-sm font-medium mb-4">
                        {tarea.fecha_entrega_esperada
                          ? new Date(tarea.fecha_entrega_esperada).toLocaleDateString('es-ES')
                          : '-'}
                      </p>
                    </div>

                    {tarea.descripcion_tarea && (
                      <div>
                        <p className="text-xs text-gray-500">{t('pedidos-servicio:task_description')}</p>
                        <p className="text-sm text-gray-700">{tarea.descripcion_tarea}</p>
                      </div>
                    )}

                    {tarea.notas_progreso && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500">{t('pedidos-servicio:task_notes')}</p>
                        <p className="text-sm text-gray-600 italic">{tarea.notas_progreso}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleVerDetalles(tarea)}
                  >
                    {t('pedidos-servicio:task_action_view')}
                  </Button>
                  {tarea.estado === 'PENDIENTE' && (
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                      onClick={() => handleInitiarTarea(tarea.id)}
                      disabled={loadingId === tarea.id}
                    >
                      {loadingId === tarea.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('pedidos-servicio:updating')}
                        </>
                      ) : successId === tarea.id ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          ✓
                        </>
                      ) : (
                        t('pedidos-servicio:task_action_start')
                      )}
                    </Button>
                  )}
                  {tarea.estado === 'EN_PROGRESO' && (
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                      onClick={() => handleCompletarTarea(tarea.id)}
                      disabled={loadingId === tarea.id}
                    >
                      {loadingId === tarea.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('pedidos-servicio:updating')}
                        </>
                      ) : successId === tarea.id ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          ✓
                        </>
                      ) : (
                        t('pedidos-servicio:task_action_complete')
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">{t('pedidos-servicio:task_no_tasks')}</p>
          </CardContent>
        </Card>
      )}

      {/* Paginación */}
      {data && data.count > 25 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={!data.previous}
            onClick={() => setPage(page - 1)}
          >
            {t('pedidos-servicio:pagination_previous')}
          </Button>
          <Button variant="outline" disabled>
            {t('pedidos-servicio:pagination_page')} {page}
          </Button>
          <Button
            variant="outline"
            disabled={!data.next}
            onClick={() => setPage(page + 1)}
          >
            {t('pedidos-servicio:pagination_next')}
          </Button>
        </div>
      )}

      {/* Modal de Detalles */}
      <TareaDetalleModal 
        tarea={selectedTarea} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default TareasAsignadas;
