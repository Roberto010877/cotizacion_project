# backend/pedidos_servicio/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PedidoServicioViewSet

router = DefaultRouter()
router.register(r'pedidos-servicio', PedidoServicioViewSet,
                basename='pedido-servicio')

urlpatterns = [
    path('', include(router.urls)),
]
