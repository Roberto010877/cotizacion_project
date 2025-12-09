"""
Configuración centralizada de paginación para toda la aplicación.

Este módulo define las clases base de paginación que pueden ser
reutilizadas en todas las apps del proyecto.
"""

from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """
    Paginación estándar para todas las vistas del proyecto.
    
    - Tamaño por defecto: 20 elementos por página
    - Parametrizable vía query param: ?page_size=X
    - Límite máximo: 100 elementos por página
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
