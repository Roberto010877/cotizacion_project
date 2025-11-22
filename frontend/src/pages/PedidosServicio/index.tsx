import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/common/DataTable";
import Pagination from "@/components/common/Pagination";
import InfiniteScroll from "@/components/common/InfiniteScroll";
import CreatePedidoServicioForm from "@/components/forms/CreatePedidoServicioForm";
import { useAppTranslation } from "@/i18n/hooks";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import usePagination from "@/hooks/usePagination";
import usePaginatedPedidosServicio from "@/hooks/usePaginatedPedidosServicio";
import type { PedidoServicio } from "@/hooks/usePaginatedPedidosServicio";
import axiosInstance from "@/lib/axios.new";
import toast from "react-hot-toast";

const PedidosServicioPage = () => {
  const { t } = useAppTranslation(['navigation', 'common']);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isCreating, setIsCreating] = useState(false);
  const [clientes, setClientes] = useState<Array<{ id: number; nombre: string; direccion?: string; telefono?: string; email?: string }>>([]);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [pedidosPorEstado, setPedidosPorEstado] = useState<Record<string, number>>({});

  // Cargar clientes para el formulario
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axiosInstance.get('/api/v1/clientes/?page_size=1000');
        const clientesList = response.data.results.map((cliente: any) => ({
          id: cliente.id,
          nombre: cliente.nombre,
          direccion: cliente.direccion || '',
          telefono: cliente.telefono || '',
          email: cliente.email || '',
        }));
        setClientes(clientesList);
      } catch (error) {
        console.error('Error cargando clientes:', error);
        toast.error('Error al cargar los clientes');
      }
    };

    fetchClientes();
  }, []);

  // Paginación
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  });

  // Datos paginados
  const { data, isLoading } = usePaginatedPedidosServicio({
    page: pagination.currentPage,
    pageSize: pagination.pageSize,
  });

  // Cargar estadísticas de pedidos por estado
  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const estados = ['ENVIADO', 'ACEPTADO', 'EN_FABRICACION', 'LISTO_INSTALAR', 'INSTALADO', 'COMPLETADO'];
        const conteos: Record<string, number> = {};
        
        for (const estado of estados) {
          const response = await axiosInstance.get(`/api/v1/pedidos-servicio/?estado=${estado}&page_size=1`);
          conteos[estado] = response.data.count || 0;
        }
        
        setPedidosPorEstado(conteos);
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      }
    };

    fetchEstadisticas();
  }, []);

  // Actualizar total de registros cuando llegan los datos
  useEffect(() => {
    if (data?.count) {
      pagination.setTotalCount(data.count);
    }
  }, [data?.count, pagination]);

  // Skeleton rows para loading state
  const skeletonRows = Array(pagination.pageSize).fill(null);

  // Define the columns for the table - Desktop view
  const columns: ColumnDef<PedidoServicio>[] = [
    {
      id: "col-id",
      accessorKey: "id",
      header: "ID",
    },
    {
      id: "col-numero",
      accessorKey: "numero_pedido",
      header: t('common:number'),
    },
    {
      id: "col-cliente",
      accessorKey: "cliente_nombre",
      header: t('navigation:client'),
    },
    {
      id: "col-solicitante",
      accessorKey: "solicitante",
      header: t('pedidos_servicio:requester'),
    },
    {
      id: "col-fecha_inicio",
      accessorKey: "fecha_inicio",
      header: t('common:start_date'),
      cell: ({ row }) => {
        const date = row.original.fecha_inicio;
        return date ? new Date(date as string).toLocaleDateString() : '-';
      },
    },
    {
      id: "col-estado",
      accessorKey: "estado_display",
      header: t('navigation:status'),
    },
    {
      id: "col-items",
      accessorKey: "total_items",
      header: t('pedidos_servicio:items'),
    },
    {
      id: "col-actions",
      header: t('common:actions'),
      cell: () => (
        <Button variant="ghost" size="sm">
          {t('common:view')}
        </Button>
      ),
    },
  ];

  // Columnas para vista móvil
  const columnsMobile: ColumnDef<PedidoServicio>[] = [
    {
      id: "mobile-numero",
      accessorKey: "numero_pedido",
      header: t('common:number'),
    },
    {
      id: "mobile-cliente",
      accessorKey: "cliente_nombre",
      header: t('navigation:client'),
    },
    {
      id: "mobile-estado",
      accessorKey: "estado_display",
      header: t('navigation:status'),
    },
    {
      id: "mobile-items",
      accessorKey: "total_items",
      header: t('pedidos_servicio:items'),
    },
    {
      id: "mobile-actions",
      header: t('common:actions'),
      cell: () => (
        <Button variant="ghost" size="sm">
          {t('common:view')}
        </Button>
      ),
    },
  ];

  const pedidos = data?.results || [];

  // Colores y emojis por estado
  const estadoConfig: Record<string, { bg: string; text: string; emoji: string }> = {
    ENVIADO: { bg: 'bg-blue-50', text: 'text-blue-700', emoji: '📨' },
    ACEPTADO: { bg: 'bg-indigo-50', text: 'text-indigo-700', emoji: '✅' },
    EN_FABRICACION: { bg: 'bg-orange-50', text: 'text-orange-700', emoji: '⚙️' },
    LISTO_INSTALAR: { bg: 'bg-yellow-50', text: 'text-yellow-700', emoji: '📦' },
    INSTALADO: { bg: 'bg-green-50', text: 'text-green-700', emoji: '🔧' },
    COMPLETADO: { bg: 'bg-emerald-50', text: 'text-emerald-700', emoji: '✨' },
  };

  return (
    <div className="space-y-6">
      {/* Panel de Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(estadoConfig).map(([estado, config]) => (
          <Card key={estado} className={`${config.bg} border-0`}>
            <CardContent className="p-3">
              <div className="text-2xl mb-1">{config.emoji}</div>
              <div className={`text-2xl font-bold ${config.text}`}>
                {pedidosPorEstado[estado] || 0}
              </div>
              <div className="text-xs text-gray-600 truncate">
                {estado.replace(/_/g, ' ')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla de Pedidos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('pedidos_servicio:title')}</CardTitle>
            <CardDescription>
              {t('pedidos_servicio:description')}
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            {t('pedidos_servicio:create_new')}
          </Button>
        </CardHeader>
        <CardContent>
        {isMobile ? (
          // Mobile: Infinite Scroll
          <InfiniteScroll
            onLoadMore={pagination.loadMore}
            hasMore={pagination.hasNextPage}
            isLoading={isLoading}
          >
            <DataTable
              columns={columnsMobile}
              data={isLoading ? skeletonRows : pedidos}
              isLoading={isLoading}
            />
          </InfiniteScroll>
        ) : (
          // Desktop: Table + Pagination
          <>
            <DataTable
              columns={columns}
              data={isLoading ? skeletonRows : pedidos}
              isLoading={isLoading}
            />
            <div className="mt-4">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                totalCount={pagination.totalCount}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
                pageSizeOptions={[10, 25, 50, 100]}
                isLoading={isLoading}
              />
            </div>
          </>
        )}
      </CardContent>
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('pedidos_servicio:create_new')}</DialogTitle>
          </DialogHeader>
          <CreatePedidoServicioForm
            clientes={clientes}
            isLoading={isLoadingForm}
            onCancel={() => setIsCreating(false)}
            onSubmit={async (data) => {
              setIsLoadingForm(true);
              try {
                // Crear el pedido servicio
                const pedidoResponse = await axiosInstance.post('/api/v1/pedidos-servicio/', {
                  cliente_id: data.cliente,
                  solicitante: data.solicitante,
                  supervisor: data.supervisor,
                  fecha_inicio: data.fecha_inicio,
                  fecha_fin: data.fecha_fin,
                  observaciones: data.observaciones,
                  estado: 'ENVIADO',
                });

                const pedidoId = pedidoResponse.data.id;

                // Crear los items del pedido
                for (const item of data.items) {
                  await axiosInstance.post(`/api/v1/pedidos-servicio/${pedidoId}/items/`, {
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
                  });
                }

                toast.success('Pedido creado exitosamente');
                setIsCreating(false);
                // Recargar la lista de pedidos
                pagination.setPage(1);
              } catch (error: any) {
                console.error('Error creando pedido:', error);
                toast.error(error.response?.data?.detail || 'Error al crear el pedido');
              } finally {
                setIsLoadingForm(false);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
    </div>
  );
};

export default PedidosServicioPage;


