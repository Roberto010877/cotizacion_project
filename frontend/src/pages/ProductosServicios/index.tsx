import { useState, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react"; // Agregamos Eye, quitamos MoreHorizontal

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Quitamos DropdownMenu ya que usaremos botones directos

import { DataTable } from "@/components/common/DataTable";
import Pagination from "@/components/common/Pagination";
import InfiniteScroll from "@/components/common/InfiniteScroll";

import { useAppTranslation } from "@/i18n/hooks";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import usePagination from "@/hooks/usePagination";

// Hooks de Datos (Lectura)
import { usePaginatedCatalogo } from "@/hooks/usePaginatedCatalogo";

// Hooks de Mutación
import { useProductMutations } from "./hooks/useProductMutations"; 

import { type ProductoServicio, type CatalogoFilters } from "./types";
import { ProductFilter, type FilterState } from "./components/ProductFilter";
import { ProductForm } from "./components/ProductForm"; 

const ProductosPage = () => {
  const { t } = useAppTranslation(['navigation', 'common', 'productos_servicios']);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Hooks de mutación
  const { createProduct, updateProduct, deleteProduct } = useProductMutations();

  // Estados de UI
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductoServicio | null>(null);

  const [filters, setFilters] = useState<CatalogoFilters>({
    search: '',
    tipo_producto: '',
    unidad_medida: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  });

  const { data, isLoading } = usePaginatedCatalogo({
    page: pagination.currentPage,
    pageSize: pagination.pageSize,
    filters: filters,
  });

  // Efectos
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
      if (searchTerm !== filters.search) pagination.setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (data?.count) pagination.setTotalCount(data.count);
  }, [data?.count]);

  // Handlers
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    pagination.setPage(1);
  };

  const handleClearFilters = () => {
    setFilters(prev => ({ ...prev, tipo_producto: '', unidad_medida: '' }));
    pagination.setPage(1);
  };

  const handleCreate = () => {
    setProductToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: ProductoServicio) => {
    setProductToEdit(product);
    setIsFormOpen(true);
  };

  // Por ahora, "Ver" abrirá el mismo formulario (podríamos hacerlo read-only luego si se requiere)
  const handleView = (product: ProductoServicio) => {
    setProductToEdit(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('common:delete_confirmation', "¿Estás seguro de eliminar este producto?"))) {
      await deleteProduct.mutateAsync(id);
    }
  };

  const handleSubmitForm = async (formData: any) => {
    try {
      if (productToEdit) {
        await updateProduct.mutateAsync({ id: productToEdit.id, data: formData });
      } else {
        await createProduct.mutateAsync(formData);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  // --- COLUMNAS (DESKTOP) ---
  const columns: ColumnDef<ProductoServicio>[] = [
    {
      accessorKey: "codigo",
      header: t('common:code', 'Código'),
      cell: ({ row }) => <span className="font-mono font-medium">{row.original.codigo}</span>
    },
    {
      accessorKey: "nombre",
      header: t('navigation:name', 'Nombre'),
    },
    {
      accessorKey: "tipo_producto",
      header: t('productos_servicios:product_type', 'Tipo'),
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
          {row.original.tipo_producto}
        </span>
      )
    },
    {
      accessorKey: "unidad_medida",
      header: t('productos_servicios:unit', 'Unidad'),
    },
    {
      accessorKey: "precio_base",
      header: () => <div className="text-right">{t('common:price', 'Precio Base')}</div>,
      cell: ({ row }) => {
        const val = row.getValue<string | number>("precio_base");
        const amount = Number(val || 0);
        return <div className="text-right font-medium">${amount.toFixed(2)}</div>;
      },
    },
    {
      id: "actions",
      header: t('common:actions', 'Acciones'),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-1">
            {/* Botón VER */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleView(product)}
              title={t('common:view', 'Ver')}
              className="text-gray-500 hover:text-blue-600 h-8 w-8"
            >
              <Eye className="h-4 w-4" />
            </Button>

            {/* Botón EDITAR */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleEdit(product)}
              title={t('common:edit', 'Editar')}
              className="text-gray-500 hover:text-orange-600 h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {/* Botón ELIMINAR */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDelete(product.id)}
              title={t('common:delete', 'Eliminar')}
              className="text-gray-500 hover:text-red-600 h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // --- COLUMNAS (MÓVIL) ---
  const columnsMobile: ColumnDef<ProductoServicio>[] = [
    {
      id: "mobile-info",
      header: "Producto",
      cell: ({ row }) => (
        <div className="flex flex-col py-1">
          <span className="font-medium text-sm">{row.original.nombre}</span>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{row.original.codigo}</span>
            <span>•</span>
            <span>{row.original.tipo_producto}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "precio_base",
      header: () => <div className="text-right">Precio</div>,
      cell: ({ row }) => {
         const val = row.getValue<string | number>("precio_base");
         const amount = Number(val || 0);
         return <div className="text-right font-medium">${amount.toFixed(2)}</div>;
      },
    },
    {
      id: "mobile-actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(row.original)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const productos = data?.results || [];

  return (
    <>
      <Card className="h-full flex flex-col border-0 sm:border shadow-none sm:shadow-sm bg-transparent sm:bg-card">
        <CardHeader className="px-0 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>{t('navigation:productos')}</CardTitle>
              <CardDescription className="hidden sm:block">
                {t('navigation:manage_products')}
              </CardDescription>
            </div>
            
            <Button className="w-full sm:w-auto" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              {t('navigation:create_product')}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('common:search_placeholder')}
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <ProductFilter
              currentFilters={{
                tipo_producto: filters.tipo_producto || '',
                unidad_medida: filters.unidad_medida || ''
              }}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
          </div>
        </CardHeader>

        <CardContent className="px-0 sm:px-6 flex-1">
          {isMobile ? (
            <InfiniteScroll
              onLoadMore={pagination.loadMore}
              hasMore={pagination.hasNextPage}
              isLoading={isLoading}
            >
              <DataTable
                columns={columnsMobile}
                data={productos}
                isLoading={isLoading}
                skeletonRows={10}
              />
            </InfiniteScroll>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={productos}
                isLoading={isLoading}
                skeletonRows={pagination.pageSize}
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

      <ProductForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        productToEdit={productToEdit}
        onSubmit={handleSubmitForm}
        isSubmitting={createProduct.isPending || updateProduct.isPending}
      />
    </>
  );
};

export default ProductosPage;