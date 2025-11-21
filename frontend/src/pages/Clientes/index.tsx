import React, { useState } from 'react'; // Added comment to force refresh
import { useFilterOptions, type Cliente } from '@/hooks/useClientes';
import usePaginatedClientes from '@/hooks/usePaginatedClientes';
import usePagination from '@/hooks/usePagination';
import { useAppTranslation } from '@/i18n/hooks';
import { Toaster } from 'react-hot-toast';
import CreateClienteForm from '@/components/forms/CreateClienteForm';
import EditClienteForm from '@/components/forms/EditClienteForm';
import DeleteConfirmationDialog from '@/components/dialogs/DeleteConfirmationDialog';
import ClienteDetailModal from '@/components/dialogs/ClienteDetailModal';
import Pagination from '@/components/common/Pagination';
import InfiniteScroll from '@/components/common/InfiniteScroll';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const ClientesPage: React.FC = () => {
  const { t } = useAppTranslation(['clientes', 'common']);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Filtros
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // Paginación
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  });

  // Datos paginados
  const { data, isLoading, isError, refetch } = usePaginatedClientes({
    page: pagination.currentPage,
    pageSize: pagination.pageSize,
    searchFilters,
  });

  // Filtros disponibles
  const { data: filterOptions } = useFilterOptions();

  // Actualizar total de registros cuando llegan los datos
  React.useEffect(() => {
    if (data?.count) {
      pagination.setTotalCount(data.count);
    }
  }, [data?.count]);

  const handleFilterChange = (key: string, value: any) => {
    setSearchFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    pagination.resetPagination();
  };

  const handleCreateSuccess = () => {
    refetch?.();
    pagination.resetPagination();
  };

  const handleEditClick = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    refetch?.();
    setIsEditDialogOpen(false);
    setSelectedCliente(null);
  };

  const handleDeleteClick = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    refetch?.();
    setIsDeleteDialogOpen(false);
    setSelectedCliente(null);
    pagination.resetPagination();
  };

  const handleViewClick = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDetailModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    pagination.setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (size: number) => {
    pagination.setPageSize(size);
  };

  if (isError) {
    return <div className="text-red-500">{t('common:error_loading_data')}</div>;
  }

  const clientes = data?.results || [];

  // Skeleton rows for loading state
  const SkeletonRow = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">{t('clientes:client_management')}</h1>
      
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Filtro por Nombre */}
        <Input
          placeholder={t('clientes:filter_by_name')}
          className="max-w-sm"
          onChange={(e) => handleFilterChange('nombre', e.target.value)}
          disabled={isLoading}
        />

        {/* Filtro por País */}
        {filterOptions?.paises && (
          <Select onValueChange={(value) => handleFilterChange('pais', value)} disabled={isLoading}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('clientes:filter_by_country')} />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.paises.map(pais => (
                <SelectItem key={pais.id} value={String(pais.id)}>
                  {pais.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Filtro por Tipo de Cliente */}
        {filterOptions?.tipos_cliente && (
          <Select onValueChange={(value) => handleFilterChange('tipo', value)} disabled={isLoading}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('clientes:filter_by_client_type')} />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.tipos_cliente.map(tipo => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={isLoading}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          {t('clientes:create_client')}
        </Button>
      </div>

      {/* Modal de Crear Cliente */}
      <CreateClienteForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        paisOptions={filterOptions?.paises || []}
        tiposClienteOptions={filterOptions?.tipos_cliente || []}
        origenesClienteOptions={filterOptions?.origenes_cliente || []}
      />

      {/* Modal de Editar Cliente */}
      <EditClienteForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        cliente={selectedCliente}
        onSuccess={handleEditSuccess}
        paisOptions={filterOptions?.paises || []}
        tiposClienteOptions={filterOptions?.tipos_cliente || []}
        origenesClienteOptions={filterOptions?.origenes_cliente || []}
      />

      {/* Dialog de Confirmar Eliminación */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        cliente={selectedCliente}
        onSuccess={handleDeleteSuccess}
      />

      {/* Modal de Detalles del Cliente */}
      <ClienteDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        cliente={selectedCliente}
      />

      <div className="bg-white shadow-md rounded-lg p-4">
        {isMobile ? (
          // Mobile: Infinite Scroll
          <InfiniteScroll
            onLoadMore={pagination.loadMore}
            hasMore={pagination.hasNextPage}
            isLoading={isLoading}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('clientes:table_header_name')}</TableHead>
                  <TableHead>{t('clientes:table_header_document')}</TableHead>
                  <TableHead>{t('clientes:table_header_country')}</TableHead>
                  <TableHead>{t('clientes:table_header_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && clientes.length === 0 ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <SkeletonRow key={idx} />
                  ))
                ) : clientes.length > 0 ? (
                  clientes.map((cliente: Cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nombre}</TableCell>
                      <TableCell className="text-sm">{cliente.numero_documento}</TableCell>
                      <TableCell className="text-sm">{cliente.pais_nombre}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewClick(cliente)}
                            disabled={isLoading}
                          >
                            {t('common:view')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(cliente)}
                            disabled={isLoading}
                          >
                            {t('common:edit')}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(cliente)}
                            disabled={isLoading}
                          >
                            {t('common:delete')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      {t('clientes:no_clients_found')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </InfiniteScroll>
        ) : (
          // Desktop: Number Pagination
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('clientes:table_header_name')}</TableHead>
                  <TableHead>{t('clientes:table_header_document')}</TableHead>
                  <TableHead>{t('clientes:table_header_country')}</TableHead>
                  <TableHead>{t('clientes:table_header_email')}</TableHead>
                  <TableHead>{t('clientes:table_header_phone')}</TableHead>
                  <TableHead>{t('clientes:table_header_client_type')}</TableHead>
                  <TableHead>{t('clientes:table_header_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <SkeletonRow key={idx} />
                  ))
                ) : clientes.length > 0 ? (
                  clientes.map((cliente: Cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nombre}</TableCell>
                      <TableCell>{cliente.numero_documento}</TableCell>
                      <TableCell>{cliente.pais_nombre}</TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell>{cliente.telefono}</TableCell>
                      <TableCell>{cliente.tipo}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleViewClick(cliente)}
                          disabled={isLoading}
                        >
                          {t('common:view')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleEditClick(cliente)}
                          disabled={isLoading}
                        >
                          {t('common:edit')}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(cliente)}
                          disabled={isLoading}
                        >
                          {t('common:delete')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      {t('clientes:no_clients_found')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalCount={pagination.totalCount}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              isLoading={isLoading}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ClientesPage;