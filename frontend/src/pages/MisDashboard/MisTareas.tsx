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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/common/DataTable";
import Pagination from "@/components/common/Pagination";
import { useAppTranslation } from "@/i18n/hooks";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import usePagination from "@/hooks/usePagination";
import {apiClient} from "@/lib/apiClient";

interface Asignacion {
  id: number;
  pedido: number;
  pedido_numero: string;
  cliente_nombre: string;
  tipo_tarea: string;
  tipo_tarea_display: string;
  estado: string;
  estado_display: string;
  fecha_entrega_esperada: string;
  fecha_asignacion: string;
  created_at: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Asignacion[];
}

export default function MisTareas() {
  const { t } = useAppTranslation();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  
  const pagination = usePagination();

  useEffect(() => {
    fetchMisTareas();
  }, [pagination.currentPage, filtroEstado, filtroTipo]);

  const fetchMisTareas = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `pedidos-servicio/mis_pedidos/?page=${pagination.currentPage}&page_size=${pagination.pageSize}`;

      if (filtroEstado !== "todos") {
        url += `&estado=${filtroEstado}`;
      }

      const response = await apiClient.get<ApiResponse>(url);
      setAsignaciones(response.data.results);
      pagination.setTotalCount(response.data.count);
    } catch (err) {
      console.error("Error al cargar tareas:", err);
      setError(t("pedidos_servicio:error_loading_tasks") || "Error al cargar tareas");
      setAsignaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string): string => {
    const colors: Record<string, string> = {
      PENDIENTE: "bg-yellow-50 text-yellow-700",
      EN_PROGRESO: "bg-blue-50 text-blue-700",
      COMPLETADO: "bg-green-50 text-green-700",
      CANCELADO: "bg-red-50 text-red-700",
    };
    return colors[estado] || "bg-gray-50 text-gray-700";
  };

  const handleMarcarEnProgreso = async (id: number) => {
    try {
      await apiClient.patch(`pedidos-servicio/${id}/`, {
        estado: "EN_FABRICACION",
      });
      fetchMisTareas();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert(t("pedidos_servicio:task_status_error"));
    }
  };

  const handleMarcarCompletado = async (id: number) => {
    try {
      await apiClient.patch(`pedidos-servicio/${id}/`, {
        estado: "COMPLETADO",
      });
      fetchMisTareas();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert(t("pedidos_servicio:task_status_error"));
    }
  };

  // Definir columnas para desktop
  const columns: ColumnDef<Asignacion>[] = [
    {
      accessorKey: "pedido_numero",
      header: () => t("pedidos_servicio:order"),
      cell: ({ row }) => (
        <div className="font-mono font-semibold text-blue-600">
          #{row.original.pedido_numero}
        </div>
      ),
    },
    {
      accessorKey: "cliente_nombre",
      header: () => t("pedidos_servicio:client_label"),
      cell: ({ row }) => <span>{row.original.cliente_nombre}</span>,
    },
    {
      accessorKey: "pedido",
      header: () => t("pedidos_servicio:order_type"),
      cell: ({ row }) => (
        <Badge className="bg-blue-100 text-blue-800">
          {t("pedidos_servicio:service_order")}
        </Badge>
      ),
    },
    {
      accessorKey: "estado",
      header: () => t("pedidos_servicio:task_state"),
      cell: ({ row }) => (
        <Badge className={getEstadoColor(row.original.estado)}>
          {row.original.estado_display}
        </Badge>
      ),
    },
    {
      accessorKey: "fecha_fin",
      header: () => t("pedidos_servicio:expected_delivery"),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.fecha_fin ? new Date(row.original.fecha_fin).toLocaleDateString("es-ES") : "N/A"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => t("pedidos_servicio:actions"),
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.estado === "PENDIENTE" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleMarcarEnProgreso(row.original.id)}
              className="text-xs"
            >
              {t("pedidos_servicio:mark_as_in_progress")}
            </Button>
          )}
          {row.original.estado === "EN_PROGRESO" && (
            <Button
              size="sm"
              onClick={() => handleMarcarCompletado(row.original.id)}
              className="text-xs bg-green-600 hover:bg-green-700"
            >
              {t("pedidos_servicio:mark_as_completed")}
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Vista mobile (cards)
  const MobileView = () => (
    <div className="space-y-4">
      {asignaciones.map((asignacion) => (
        <Card key={asignacion.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-base">
                  #{asignacion.pedido_numero}
                </CardTitle>
                <CardDescription>{asignacion.cliente_nombre}</CardDescription>
              </div>
              <Badge className={getEstadoColor(asignacion.estado)}>
                {asignacion.estado_display}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-1">
              <p className="text-gray-600">
                <strong>{t("pedidos_servicio:fabricator")}:</strong>{" "}
                {asignacion.fabricador_nombre || "N/A"}
              </p>
              <p className="text-gray-600">
                <strong>{t("pedidos_servicio:installer")}:</strong>{" "}
                {asignacion.instalador_nombre || "N/A"}
              </p>
              <p className="text-gray-600">
                <strong>{t("pedidos_servicio:expected_delivery")}:</strong>{" "}
                {asignacion.fecha_fin ? new Date(asignacion.fecha_fin).toLocaleDateString("es-ES") : "N/A"}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              {asignacion.estado === "ENVIADO" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarcarEnProgreso(asignacion.id)}
                  className="flex-1"
                >
                  {t("pedidos_servicio:start_fabrication")}
                </Button>
              )}
              {(asignacion.estado === "EN_FABRICACION" || asignacion.estado === "LISTO_INSTALAR") && (
                <Button
                  size="sm"
                  onClick={() => handleMarcarCompletado(asignacion.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {t("pedidos_servicio:mark_as_completed")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>{t("pedidos_servicio:my_tasks")}</CardTitle>
          <CardDescription>
            {t("pedidos_servicio:my_tasks_description")}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("pedidos_servicio:filters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("pedidos_servicio:task_state")}
              </label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">{t("pedidos_servicio:all_states")}</SelectItem>
                  <SelectItem value="PENDIENTE">
                    {t("pedidos_servicio:pending")}
                  </SelectItem>
                  <SelectItem value="EN_PROGRESO">
                    {t("pedidos_servicio:in_progress")}
                  </SelectItem>
                  <SelectItem value="COMPLETADO">
                    {t("pedidos_servicio:completed")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setFiltroEstado("todos");
              }}
              className="mt-auto"
            >
              {t("pedidos_servicio:clear_filters")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contenido principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("pedidos_servicio:assignments")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          ) : asignaciones.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {filtroEstado !== "todos" || filtroTipo !== "todos"
                  ? t("pedidos_servicio:no_tasks_with_filters")
                  : t("pedidos_servicio:no_tasks")}
              </p>
            </div>
          ) : isDesktop ? (
            <>
              <DataTable columns={columns} data={asignaciones} />
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                totalCount={pagination.totalCount}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
                pageSizeOptions={[10, 25, 50, 100]}
                isLoading={loading}
              />
            </>
          ) : (
            <>
              <MobileView />
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                totalCount={pagination.totalCount}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
                pageSizeOptions={[10, 25, 50, 100]}
                isLoading={loading}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
