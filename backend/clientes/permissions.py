# clientes/permissions.py
from rest_framework import permissions

class CanViewClientes(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('clientes.view_cliente')

class CanCreateClientes(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('clientes.add_cliente')

class CanEditClientes(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('clientes.change_cliente')

class CanDeleteClientes(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('clientes.delete_cliente')