import { useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import Pagination from "@/components/common/Pagination";
import InfiniteScroll from "@/components/common/InfiniteScroll";
import { useAppTranslation } from "@/i18n/hooks";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import usePagination from "@/hooks/usePagination";
import usePaginatedProductos from "@/hooks/usePaginatedProductos";

type Producto = {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
};

const ProductosPage = () => {
  const { t } = useAppTranslation(['navigation', 'common']);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Paginación
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  });

  // Datos paginados
  const { data, isLoading } = usePaginatedProductos({
    page: pagination.currentPage,
    pageSize: pagination.pageSize,
  });

  // Actualizar total de registros cuando llegan los datos
  useEffect(() => {
    if (data?.count) {
      pagination.setTotalCount(data.count);
    }
  }, [data?.count, pagination]);

  // Skeleton rows para loading state
  const skeletonRows = Array(pagination.pageSize).fill(null);

  // Define the columns for the table
  const columns: ColumnDef<Producto>[] = [
    {
      id: "col-id",
      accessorKey: "id",
      header: "ID",
    },
    {
      id: "col-nombre",
      accessorKey: "nombre",
      header: t('navigation:name'),
    },
    {
      id: "col-codigo",
      accessorKey: "codigo",
      header: t('common:code'),
    },
    {
      id: "col-descripcion",
      accessorKey: "descripcion",
      header: t('common:description'),
    },
    {
      id: "col-precio",
      accessorKey: "precio",
      header: () => <div className="text-right">{t('common:price')}</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("precio"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      id: "col-stock",
      accessorKey: "stock",
      header: () => <div className="text-right">{t('common:stock')}</div>,
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("stock")}</div>
      ),
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

  // Columnas móvil
  const columnsMobile: ColumnDef<Producto>[] = [
    {
      id: "mobile-nombre",
      accessorKey: "nombre",
      header: t('navigation:name'),
    },
    {
      id: "mobile-codigo",
      accessorKey: "codigo",
      header: t('common:code'),
    },
    {
      id: "mobile-precio",
      accessorKey: "precio",
      header: t('common:price'),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("precio"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="text-right">{formatted}</div>;
      },
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

  const productos = data?.results || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('navigation:productos')}</CardTitle>
          <CardDescription>
            {t('navigation:manage_products')}
          </CardDescription>
        </div>
        <Button>{t('navigation:create_product')}</Button>
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
              data={isLoading ? skeletonRows : productos}
              isLoading={isLoading}
            />
          </InfiniteScroll>
        ) : (
          // Desktop: Table + Pagination
          <>
            <DataTable
              columns={columns}
              data={isLoading ? skeletonRows : productos}
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
    </Card>
  );
};

export default ProductosPage;
