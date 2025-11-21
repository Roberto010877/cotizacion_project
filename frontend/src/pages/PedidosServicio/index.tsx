import { useEffect, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/common/DataTable';
import Pagination from '@/components/common/Pagination';
import { useAppTranslation } from '@/i18n/hooks';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import usePagination from '@/hooks/usePagination';
import usePaginatedPedidosServicio, { type PedidoServicio } from '@/hooks/usePaginatedPedidosServicio';
import { StatusBadge } from '@/components/StatusBadge';
import { PedidoForm } from '@/components/PedidoForm';
import { PedidoDetailView } from '@/components/PedidoDetailView';
import { PedidoEditForm } from '@/components/PedidoEditForm';
import { Plus, Search, Filter } from 'lucide-react';

const ESTADOS = ['ENVIADO', 'ACEPTADO', 'EN_FABRICACION', 'LISTO_INSTALAR', 'INSTALADO', 'COMPLETADO', 'RECHAZADO', 'CANCELADO'];

const PedidosServicioPage = () => {
  const { t } = useAppTranslation(['pedidos-servicio', 'common']);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Estado del formulario modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string>('');

  // Paginación
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  });

  // Datos paginados con filtros
  const searchFilters: Record<string, any> = {};
  if (searchTerm) {
    searchFilters.search = searchTerm;
  }
  if (selectedEstado) {
    searchFilters.estado = selectedEstado;
  }

  const { data, isLoading, refetch } = usePaginatedPedidosServicio({
    page: pagination.currentPage,
    pageSize: pagination.pageSize,
    searchFilters,
  });

  // Actualizar total de registros cuando llegan los datos
  useEffect(() => {
    if (data?.count) {
      pagination.setTotalCount(data.count);
    }
  }, [data?.count, pagination]);

  // Columnas para tabla Desktop
  const columns: ColumnDef<PedidoServicio>[] = [
    {
      id: 'col-numero',
      accessorKey: 'numero_pedido',
      header: () => <div className="font-semibold">{t('pedidos-servicio:table_number')}</div>,
      cell: ({ row }) => (
        <div className="font-mono font-semibold text-blue-600">
          {row.original.numero_pedido || '-'}
        </div>
      ),
    },
    {
      id: 'col-cliente',
      accessorKey: 'cliente_nombre',
      header: () => <div className="font-semibold">{t('pedidos-servicio:table_client')}</div>,
      cell: ({ row }) => <div>{row.original.cliente_nombre || '-'}</div>,
    },
    {
      id: 'col-solicitante',
      accessorKey: 'solicitante',
      header: () => <div className="font-semibold">{t('pedidos-servicio:table_requestor')}</div>,
      cell: ({ row }) => <div>{row.original.solicitante || '-'}</div>,
    },
    {
      id: 'col-instalador',
      accessorKey: 'colaborador_nombre',
      header: () => <div className="font-semibold">{t('pedidos-servicio:table_installer')}</div>,
      cell: ({ row }) => <div>{row.original.colaborador_nombre || '-'}</div>,
    },
    {
      id: 'col-fecha-inicio',
      accessorKey: 'fecha_inicio',
      header: () => <div className="font-semibold">{t('pedidos-servicio:table_date_start')}</div>,
      cell: ({ row }) => {
        const dateStr = row.original.fecha_inicio;
        if (!dateStr) return <div>-</div>;
        try {
          const date = new Date(dateStr);
          return <div>{date.toLocaleDateString('es-ES')}</div>;
        } catch {
          return <div>{dateStr}</div>;
        }
      },
    },
    {
      id: 'col-items',
      accessorKey: 'total_items',
      header: () => <div className="font-semibold">{t('pedidos-servicio:table_items')}</div>,
      cell: ({ row }) => (
        <div className="bg-blue-100 text-blue-700 rounded px-2 py-1 inline-block text-sm font-medium">
          {row.original.total_items || 0}
        </div>
      ),
    },
    {
      id: 'col-estado',
      accessorKey: 'estado',
      header: () => <div className="font-semibold">{t('pedidos-servicio:table_status')}</div>,
      cell: ({ row }) => (
        <StatusBadge
          estado={row.original.estado}
          showIcon={true}
        />
      ),
    },
    {
      id: 'col-actions',
      header: () => <div className="font-semibold">{t('common:actions')}</div>,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 hover:text-blue-800"
            onClick={() => {
              setSelectedPedidoId(row.original.id);
              setShowDetailModal(true);
            }}
          >
            {t('common:view')}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-green-600 hover:text-green-800"
            onClick={() => {
              setSelectedPedidoId(row.original.id);
              setShowEditModal(true);
            }}
          >
            {t('common:edit')}
          </Button>
        </div>
      ),
    },
  ];

  // Renderizar botones en cards mobile
  const getMobileActionButtons = (pedidoId: number) => (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
        onClick={() => {
          setSelectedPedidoId(pedidoId);
          setShowDetailModal(true);
        }}
      >
        {t('common:view')}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 text-xs text-green-600 border-green-200 hover:bg-green-50"
        onClick={() => {
          setSelectedPedidoId(pedidoId);
          setShowEditModal(true);
        }}
      >
        {t('common:edit')}
      </Button>
    </div>
  );

  // Card para Mobile
  const renderMobileCard = (pedido: PedidoServicio) => (
    <Card key={pedido.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-mono text-blue-600">
              {pedido.numero_pedido || 'N/A'}
            </CardTitle>
            <CardDescription>{pedido.solicitante || 'Sin solicitante'}</CardDescription>
          </div>
          {pedido.estado && <StatusBadge estado={pedido.estado} showIcon={true} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">{t('pedidos-servicio:table_client')}:</span>
            <p className="font-medium">{pedido.cliente_nombre || '-'}</p>
          </div>
          <div>
            <span className="text-gray-600">{t('pedidos-servicio:table_date_start')}:</span>
            <p className="font-medium">
              {pedido.fecha_inicio ? new Date(pedido.fecha_inicio).toLocaleDateString('es-ES') : '-'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">{t('pedidos-servicio:table_installer')}:</span>
            <p className="font-medium text-sm">{pedido.colaborador_nombre || '-'}</p>
          </div>
          <div>
            <span className="text-gray-600">{t('pedidos-servicio:table_items')}:</span>
            <p className="font-medium">{pedido.total_items || 0}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-2 border-t">
          {getMobileActionButtons(pedido.id)}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('pedidos-servicio:title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('pedidos-servicio:description')}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('pedidos-servicio:create_button')}
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('pedidos-servicio:filters_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('pedidos-servicio:search_placeholder')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  pagination.setPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Filtro por Estado */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={selectedEstado || "all"} onValueChange={(value) => {
                setSelectedEstado(value === "all" ? "" : value);
                pagination.setPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder={t('pedidos-servicio:filter_status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common:all_statuses')}</SelectItem>
                  {ESTADOS.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla o Cards */}
      <Card>
        <CardHeader>
          <CardDescription>
            {t('pedidos-servicio:total_label')}: {data?.count || 0} {t('pedidos-servicio:orders_label')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop: Tabla */}
          {!isMobile && (
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                data={data?.results || []}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Mobile: Cards */}
          {isMobile && (
            <>
              {isLoading ? (
                // Skeleton cards para mobile
                <div className="space-y-4">
                  {Array.from({ length: pagination.pageSize }).map((_, i) => (
                    <Card key={i} className="mb-4 animate-pulse">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="h-5 bg-gray-300 rounded w-24 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                          </div>
                          <div className="h-8 bg-gray-300 rounded w-20"></div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : data?.results && data.results.length > 0 ? (
                <div className="space-y-4">
                  {data.results.map((pedido) => renderMobileCard(pedido))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  {t('pedidos-servicio:no_orders')}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {!isMobile && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          onPageChange={pagination.setPage}
          pageSize={pagination.pageSize}
          onPageSizeChange={pagination.setPageSize}
        />
      )}

      {/* Modal Crear Pedido */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('pedidos-servicio:modal_create_title')}</DialogTitle>
            <DialogDescription>
              {t('pedidos-servicio:modal_create_description')}
            </DialogDescription>
          </DialogHeader>
          <PedidoForm
            onSuccess={() => {
              setShowCreateModal(false);
              refetch();
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Ver Detalle */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('pedidos-servicio:view_title') || 'Detalle del Pedido'}</DialogTitle>
          </DialogHeader>
          {selectedPedidoId && (
            <PedidoDetailView pedidoId={selectedPedidoId} />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Editar Pedido */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('pedidos-servicio:edit_title') || 'Editar Pedido'}</DialogTitle>
          </DialogHeader>
          {selectedPedidoId && (
            <PedidoEditForm
              pedidoId={selectedPedidoId}
              onSuccess={() => {
                setShowEditModal(false);
                refetch();
              }}
              onCancel={() => setShowEditModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PedidosServicioPage;
