import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {apiClient} from "@/lib/apiClient";
import toast, { Toaster } from "react-hot-toast";
import { useAppTranslation } from "@/i18n/hooks";
import { useSelector } from "react-redux";
import { AccessDenied } from "@/components/common/AccessDenied";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Instalador = {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ciudad: string;
  especialidad: string;
  estado: string;
  cargo: string;
  calificacion: number;
  total_instalaciones: number;
  usuario?: {
    id: number;
    username: string;
  } | null;
};

type FormData = {
  nombre: string;
  apellido: string;
  documento?: string;
  email: string;
  telefono: string;
  ciudad: string;
  especialidad: string;
  estado: string;
};

type DialogType = "create" | "edit" | "createAccess" | "changeStatus" | "delete" | null;

const ESTADO_OPTIONS = ["ACTIVO", "INACTIVO", "VACACIONES", "BAJA"];

const InstaladoresPage = () => {
  const [instaladores, setInstaladores] = useState<Instalador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstalador, setSelectedInstalador] = useState<Instalador | null>(null);
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    documento: "",
    email: "",
    telefono: "",
    ciudad: "",
    especialidad: "",
    estado: "ACTIVO",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("ACTIVO");
  const { t } = useAppTranslation(['instaladores', 'common']);
  const currentUser = useSelector((state: any) => state.auth.user);

  const isCurrentUserAdmin = currentUser?.role?.toUpperCase() === 'ADMIN' || currentUser?.username === 'admin';

  if (!isCurrentUserAdmin) {
    return <AccessDenied />;
  }

  useEffect(() => {
    fetchInstaladores();
  }, []);

  const fetchInstaladores = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("manufactura/");
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setInstaladores(data);
      setError(null);
    } catch (err) {
      setError(t("instaladores:error_loading"));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      documento: "",
      email: "",
      telefono: "",
      ciudad: "",
      especialidad: "",
      estado: "ACTIVO",
    });
    setSelectedInstalador(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogType("create");
  };

  const openEditDialog = (instalador: Instalador) => {
    setSelectedInstalador(instalador);
    setFormData({
      nombre: instalador.nombre,
      apellido: instalador.apellido,
      email: instalador.email,
      telefono: instalador.telefono,
      ciudad: instalador.ciudad,
      especialidad: instalador.especialidad,
      estado: instalador.estado,
    });
    setDialogType("edit");
  };

  const openChangeStatusDialog = (instalador: Instalador) => {
    setSelectedInstalador(instalador);
    setSelectedStatus(instalador.estado);
    setDialogType("changeStatus");
  };

  const openDeleteDialog = (instalador: Instalador) => {
    setSelectedInstalador(instalador);
    setDialogType("delete");
  };

  const openCreateAccessDialog = (instalador: Instalador) => {
    setSelectedInstalador(instalador);
    setDialogType("createAccess");
  };

  const handleSaveInstalador = async () => {
    // Validar campos requeridos
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.email.trim()) {
      toast.error(t("instaladores:required_field"));
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(t("instaladores:loading"));

    try {
      if (dialogType === "create") {
        await apiClient.post("manufactura/", formData);
        toast.dismiss(loadingToast);
        toast.success(t("instaladores:installer_added"));
      } else if (dialogType === "edit" && selectedInstalador) {
        await apiClient.patch(
          `manufactura/${selectedInstalador.id}/`,
          formData
        );
        toast.dismiss(loadingToast);
        toast.success(t("instaladores:installer_updated"));
      }

      fetchInstaladores();
      closeDialog();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errorMsg = err.response?.data?.detail || 
        (dialogType === "create" ? t("instaladores:error_adding") : t("instaladores:error_updating"));
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!selectedInstalador) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading(t("instaladores:loading"));

    try {
      await apiClient.patch(
        `instaladores/${selectedInstalador.id}/`,
        { estado: selectedStatus }
      );
      toast.dismiss(loadingToast);
      toast.success(t("instaladores:status_updated"));
      fetchInstaladores();
      closeDialog();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errorMsg = err.response?.data?.detail || t("instaladores:error_updating_status");
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInstalador = async () => {
    if (!selectedInstalador) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading(t("instaladores:loading"));

    try {
      await apiClient.delete(`manufactura/${selectedInstalador.id}/`);
      toast.dismiss(loadingToast);
      toast.success(t("instaladores:installer_deleted"));
      fetchInstaladores();
      closeDialog();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errorMsg = err.response?.data?.detail || t("instaladores:error_deleting");
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCrearAcceso = async () => {
    if (!selectedInstalador) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading(t("instaladores:loading"));

    try {
      await apiClient.post(`manufactura/${selectedInstalador.id}/crear_acceso/`);
      toast.dismiss(loadingToast);
      toast.success(t("instaladores:access_created"));
      fetchInstaladores();
      closeDialog();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errorMsg = err.response?.data?.detail || t("instaladores:error_creating_access");
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDialog = () => {
    setDialogType(null);
    resetForm();
  };

  const getEstadoBadge = (estado: string) => {
    const variants: any = {
      ACTIVO: "bg-green-100 text-green-800",
      INACTIVO: "bg-red-100 text-red-800",
      VACACIONES: "bg-yellow-100 text-yellow-800",
      BAJA: "bg-gray-100 text-gray-800",
    };
    
    const labels: any = {
      ACTIVO: t("instaladores:activo"),
      INACTIVO: t("instaladores:inactivo"),
      VACACIONES: t("instaladores:vacaciones"),
      BAJA: t("instaladores:baja"),
    };

    return (
      <Badge className={variants[estado] || "bg-gray-100 text-gray-800"}>
        {labels[estado] || estado}
      </Badge>
    );
  };

  const filteredInstaladores = instaladores.filter((instalador) =>
    `${instalador.nombre} ${instalador.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instalador.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instalador.telefono.includes(searchTerm) ||
    instalador.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<Instalador>[] = [
    {
      accessorKey: "nombre",
      header: t("instaladores:nombre"),
      cell: ({ row }) => {
        const nombre = row.getValue("nombre");
        const apellido = row.original.apellido;
        return `${nombre} ${apellido}`;
      },
    },
    {
      accessorKey: "email",
      header: t("instaladores:email"),
    },
    {
      accessorKey: "telefono",
      header: t("instaladores:telefono"),
    },
    {
      accessorKey: "ciudad",
      header: t("instaladores:ciudad"),
    },
    {
      accessorKey: "cargo",
      header: t("instaladores:cargo"),
      cell: ({ row }) => {
        const cargo = row.getValue("cargo") as string;
        // Transformar FABRICADOR -> Fabricador
        return cargo.charAt(0).toUpperCase() + cargo.slice(1).toLowerCase();
      },
    },
    {
      accessorKey: "especialidad",
      header: t("instaladores:especialidad"),
    },
    {
      accessorKey: "estado",
      header: t("instaladores:estado"),
      cell: ({ row }) => getEstadoBadge(row.getValue("estado")),
    },
    {
      accessorKey: "calificacion",
      header: t("instaladores:calificacion"),
      cell: ({ row }) => {
        const rating = row.getValue("calificacion");
        return `${Number(rating).toFixed(2)} ⭐`;
      },
    },
    {
      accessorKey: "total_instalaciones",
      header: t("instaladores:total_instalaciones"),
    },
    {
      id: "acciones",
      header: t("common:actions"),
      cell: ({ row }) => {
        const instalador = row.original;
        const tieneUsuario = instalador.usuario !== null && instalador.usuario !== undefined;

        return (
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
              onClick={() => openEditDialog(instalador)}
            >
              {t("instaladores:edit")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500 text-amber-600 hover:bg-amber-50"
              onClick={() => openChangeStatusDialog(instalador)}
            >
              {t("instaladores:change_status")}
            </Button>
            <Button
              size="sm"
              variant={tieneUsuario ? "outline" : "default"}
              disabled={tieneUsuario}
              onClick={() => openCreateAccessDialog(instalador)}
            >
              {tieneUsuario ? t("instaladores:usuario_sistema") : t("instaladores:create_access")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
              onClick={() => openDeleteDialog(instalador)}
            >
              {t("instaladores:delete")}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Toaster position="top-right" />

      {/* Dialog para agregar/editar instalador */}
      <Dialog open={dialogType === "create" || dialogType === "edit"} onOpenChange={(open) => {
        if (!open) closeDialog();
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "create" ? t("instaladores:add_new_installer") : t("instaladores:edit_installer")}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "create" ? 
                t("instaladores:description") : 
                `${t("instaladores:edit")} ${selectedInstalador?.nombre}`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre" className="text-sm font-medium">
                  {t("instaladores:nombre")} *
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder={t("instaladores:nombre")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="apellido" className="text-sm font-medium">
                  {t("instaladores:apellido")} *
                </Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  placeholder={t("instaladores:apellido")}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="documento" className="text-sm font-medium">
                  {t("instaladores:documento")}
                </Label>
                <Input
                  id="documento"
                  value={formData.documento || ""}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  placeholder={t("instaladores:documento")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  {t("instaladores:email")} *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t("instaladores:email")}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefono" className="text-sm font-medium">
                  {t("instaladores:telefono")}
                </Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder={t("instaladores:telefono")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ciudad" className="text-sm font-medium">
                  {t("instaladores:ciudad")}
                </Label>
                <Input
                  id="ciudad"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  placeholder={t("instaladores:ciudad")}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="especialidad" className="text-sm font-medium">
                  {t("instaladores:especialidad")}
                </Label>
                <Input
                  id="especialidad"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                  placeholder={t("instaladores:especialidad")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="estado" className="text-sm font-medium">
                  {t("instaladores:estado")}
                </Label>
                <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                  <SelectTrigger id="estado" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADO_OPTIONS.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {t(`instaladores:${estado.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={closeDialog}>
              {t("common:cancel")}
            </Button>
            <Button
              onClick={handleSaveInstalador}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? t("instaladores:loading") : t("instaladores:save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para cambiar estado */}
      <Dialog open={dialogType === "changeStatus"} onOpenChange={(open) => {
        if (!open) closeDialog();
      }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t("instaladores:change_status")}</DialogTitle>
            <DialogDescription>
              {selectedInstalador && `${selectedInstalador.nombre} ${selectedInstalador.apellido}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="status" className="text-sm font-medium">
                {t("instaladores:select_status")}
              </Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADO_OPTIONS.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {t(`instaladores:${estado.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={closeDialog}>
              {t("common:cancel")}
            </Button>
            <Button
              onClick={handleChangeStatus}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? t("instaladores:loading") : t("instaladores:confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para crear acceso */}
      <Dialog open={dialogType === "createAccess"} onOpenChange={(open) => {
        if (!open) closeDialog();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("instaladores:create_user_access")}</DialogTitle>
            <DialogDescription>
              {t("instaladores:description")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInstalador && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-left font-semibold">{t("instaladores:nombre")}:</Label>
                <div className="col-span-3 text-gray-700">{selectedInstalador.nombre}</div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-left font-semibold">{t("instaladores:apellido")}:</Label>
                <div className="col-span-3 text-gray-700">{selectedInstalador.apellido}</div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-left font-semibold">{t("instaladores:email")}:</Label>
                <div className="col-span-3 text-gray-700">{selectedInstalador.email}</div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-left font-semibold">{t("instaladores:telefono")}:</Label>
                <div className="col-span-3 text-gray-700">{selectedInstalador.telefono}</div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-blue-800">
                <p className="font-semibold mb-2">📧 {t("instaladores:create_user_access")}</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>{t("instaladores:create_user_access")} para acceder al sistema</li>
                  <li>Se generará automáticamente un username basado en el email</li>
                  <li>Se creará una contraseña segura</li>
                  <li>Las credenciales se enviarán por email</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={closeDialog}
            >
              {t("common:cancel")}
            </Button>
            <Button
              onClick={handleCrearAcceso}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? t("instaladores:loading") : t("instaladores:create_access")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para eliminar */}
      <Dialog open={dialogType === "delete"} onOpenChange={(open: boolean) => {
        if (!open) closeDialog();
      }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t("instaladores:delete_installer")}</DialogTitle>
            <DialogDescription>
              {selectedInstalador && (
                <span>
                  {t("instaladores:confirm_delete_message").replace(
                    "{name}",
                    `${selectedInstalador.nombre} ${selectedInstalador.apellido}`
                  )}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeDialog}>
              {t("common:cancel")}
            </Button>
            <Button
              onClick={handleDeleteInstalador}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? t("instaladores:loading") : t("instaladores:delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contenido principal */}
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle>{t("instaladores:title")}</CardTitle>
                <CardDescription>{t("instaladores:description")}</CardDescription>
              </div>
              <Button 
                onClick={openCreateDialog}
                className="bg-green-600 hover:bg-green-700"
              >
                {t("instaladores:add_new")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder={t("instaladores:search_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : instaladores.length === 0 ? (
                <div className="text-center py-4 text-gray-500">{t("instaladores:no_instaladores")}</div>
              ) : (
                <div className="overflow-x-auto border rounded-md">
                  <DataTable columns={columns} data={filteredInstaladores} isLoading={isLoading} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default InstaladoresPage;
