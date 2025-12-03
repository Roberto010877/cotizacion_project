from django.urls import path, include
from rest_framework.routers import DefaultRouter
# <--- IMPORTANTE
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import UserViewSet
from api.dashboard_views_folder.dashboard_views import dashboard_metrics, mis_pedidos

# Configuración del Router para ViewSets estándar
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # --- AUTENTICACIÓN JWT (Las rutas que te faltan) ---
    # Estas líneas hacen que funcionen:
    # POST http://localhost:8000/api/v1/token/
    # POST http://localhost:8000/api/v1/token/refresh/
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Rutas generadas por el router (ej: /api/v1/users/)
    path('', include(router.urls)),

    # Rutas de las aplicaciones
    path('', include('core.urls')),
    path('', include('clientes.urls')),
    path('', include('pedidos_servicio.urls')),
    path('manufactura/', include('manufactura.urls')),

    # Dashboard
    path('dashboard/metrics/', dashboard_metrics, name='dashboard-metrics'),
    path('dashboard/mis-pedidos/', mis_pedidos, name='mis-pedidos'),

    # Gestión (Productos y Cotizaciones)
    path('gestion/', include([
        path('', include('proveedores.urls')),
        path('', include('ordenes_compra.urls')),
        path('productos/', include('productos_servicios.urls')),
        path('cotizaciones/', include('cotizaciones.urls')),
    ])),
]
