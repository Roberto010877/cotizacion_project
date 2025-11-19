from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('', include('core.urls')),
    path('', include('clientes.urls')),
    path('gestion/', include([
        path('', include('proveedores.urls')),
        path('productos/', include('productos.urls')),
        path('cotizaciones/', include('cotizaciones.urls')),
    ])),
]




