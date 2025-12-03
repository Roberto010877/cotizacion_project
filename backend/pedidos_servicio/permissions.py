# pedidos_servicio/permissions.py
from rest_framework import permissions


class CanViewPedidos(permissions.BasePermission):
    """Permiso para ver pedidos de servicio"""
    def has_permission(self, request, view):
        return request.user.has_perm('pedidos_servicio.view_pedidoservicio')


class CanCreatePedidos(permissions.BasePermission):
    """Permiso para crear pedidos de servicio"""
    def has_permission(self, request, view):
        return request.user.has_perm('pedidos_servicio.add_pedidoservicio')


class CanEditPedidos(permissions.BasePermission):
    """Permiso para editar pedidos de servicio"""
    def has_permission(self, request, view):
        return request.user.has_perm('pedidos_servicio.change_pedidoservicio')


class CanDeletePedidos(permissions.BasePermission):
    """Permiso para eliminar pedidos de servicio"""
    def has_permission(self, request, view):
        return request.user.has_perm('pedidos_servicio.delete_pedidoservicio')
