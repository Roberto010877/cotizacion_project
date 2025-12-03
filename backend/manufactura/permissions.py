# manufactura/permissions.py
from rest_framework import permissions


class CanViewManufactura(permissions.BasePermission):
    """Permiso para ver personal de manufactura"""
    def has_permission(self, request, view):
        return request.user.has_perm('manufactura.view_manufactura')


class CanCreateManufactura(permissions.BasePermission):
    """Permiso para crear personal de manufactura"""
    def has_permission(self, request, view):
        return request.user.has_perm('manufactura.add_manufactura')


class CanEditManufactura(permissions.BasePermission):
    """Permiso para editar personal de manufactura"""
    def has_permission(self, request, view):
        return request.user.has_perm('manufactura.change_manufactura')


class CanDeleteManufactura(permissions.BasePermission):
    """Permiso para eliminar personal de manufactura"""
    def has_permission(self, request, view):
        return request.user.has_perm('manufactura.delete_manufactura')
