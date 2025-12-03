from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CotizacionViewSet

router = DefaultRouter()
router.register(r'', CotizacionViewSet, basename='cotizacion')

urlpatterns = [
    path('', include(router.urls)),
]
# El prefijo será 'cotizaciones' porque ya está en el path en api/urls.py
