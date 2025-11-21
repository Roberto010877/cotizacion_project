from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PedidoServicioViewSet, AsignacionTareaViewSet

router = DefaultRouter()
router.register(r'pedidos-servicio', PedidoServicioViewSet, basename='pedido-servicio')
router.register(r'asignaciones-tareas', AsignacionTareaViewSet, basename='asignacion-tarea')

urlpatterns = [
    path('', include(router.urls)),
]

