from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, PaisViewSet, TipoDocumentoConfigViewSet

router_v1 = DefaultRouter()
router_v1.register(r'clientes', ClienteViewSet, basename='cliente')
router_v1.register(r'paises', PaisViewSet, basename='pais')
router_v1.register(r'tipos-documento', TipoDocumentoConfigViewSet, basename='tipodocumento')

urlpatterns = router_v1.urls

# Se necesita vincular explícitamente la acción personalizada si no aparece automáticamente
opciones_filtro_view = ClienteViewSet.as_view({
    'get': 'opciones_filtro'
})

urlpatterns.append(
    path('clientes/opciones-filtro/', opciones_filtro_view, name='cliente-opciones-filtro')
)