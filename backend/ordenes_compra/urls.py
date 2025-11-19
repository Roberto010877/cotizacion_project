from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrdenCompraViewSet

router = DefaultRouter()
router.register(r'ordenes-compra', OrdenCompraViewSet, basename='ordencompra')

urlpatterns = [
    path('', include(router.urls)),
]
