from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductoServicioViewSet

router = DefaultRouter()
# El prefijo será 'productos' porque ya está en el path en api/urls.py
router.register(r'', ProductoServicioViewSet, basename='producto')

urlpatterns = [
    path('', include(router.urls)),
]
