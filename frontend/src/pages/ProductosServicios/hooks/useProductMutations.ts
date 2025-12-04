import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ProductoServicio } from "../types";
import toast from "react-hot-toast";

export const useProductMutations = () => {
  const queryClient = useQueryClient();

  // 1. CREAR PRODUCTO
  const createProduct = useMutation({
    mutationFn: async (newProduct: Partial<ProductoServicio>) => {
      const response = await apiClient.post("gestion/productos/", newProduct);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogo"] });
      toast.success("Producto creado exitosamente");
    },
    onError: (error: any) => {
      toast.error("Error al crear: " + (error.response?.data?.detail || "Error desconocido"));
    },
  });

  // 2. ACTUALIZAR PRODUCTO
  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProductoServicio> }) => {
      const response = await apiClient.patch(`gestion/productos/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogo"] });
      toast.success("Producto actualizado");
    },
    onError: (error: any) => {
      toast.error("Error al actualizar: " + (error.response?.data?.detail || "Error desconocido"));
    },
  });

  // 3. ELIMINACIÓN LÓGICA (Soft Delete)
  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`gestion/productos/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogo"] });
      toast.success("Producto eliminado");
    },
    onError: (error: any) => {
      toast.error("Error al eliminar: " + (error.response?.data?.detail || "Error desconocido"));
    },
  });

  return {
    createProduct,
    updateProduct,
    deleteProduct,
  };
};