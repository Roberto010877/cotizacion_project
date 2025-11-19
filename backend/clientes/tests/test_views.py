# clientes/tests/test_views.py
import pytest
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from clientes.models import Cliente
from .factories import (
    ClienteFactory, 
    UserFactory, 
    ClienteBoliviaNITFactory,
    ClienteBrasilCPFFactory
)

User = get_user_model()

@pytest.mark.django_db
class TestClienteViewSet(APITestCase):
    
    def setUp(self):
        """Configuración inicial para cada test"""
        # Usuario con todos los permisos para clientes
        self.user_with_perms = UserFactory(username='user_with_perms')
        content_type = ContentType.objects.get_for_model(Cliente)
        permissions = Permission.objects.filter(content_type=content_type)
        self.user_with_perms.user_permissions.set(permissions)
        
        # Usuario sin permisos específicos
        self.user_without_perms = UserFactory(username='user_without_perms')
        
        self.client = APIClient()
        # Por defecto, autenticamos al usuario CON permisos
        self.client.force_authenticate(user=self.user_with_perms)
        
        self.cliente = ClienteFactory()
        self.list_url = reverse('cliente-list')
        self.detail_url = reverse('cliente-detail', kwargs={'pk': self.cliente.pk})
    
    def test_list_clientes(self):
        """Test del listado de clientes"""
        ClienteFactory.create_batch(3)
        
        response = self.client.get(self.list_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 4  # Incluye el del setUp
        assert 'nombre' in response.data['results'][0]
    
    def test_retrieve_cliente(self):
        """Test de obtención de un cliente específico"""
        response = self.client.get(self.detail_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['nombre'] == self.cliente.nombre
        assert response.data['numero_documento'] == self.cliente.numero_documento
    
    def test_create_cliente(self):
        """Test de creación de cliente"""
        pais = self.cliente.pais
        tipo_documento = self.cliente.tipo_documento
        
        data = {
            'nombre': 'Nuevo Cliente API',
            'pais': pais.id,
            'tipo_documento': tipo_documento.id,
            'numero_documento': '999888777',
            'direccion': 'Dirección desde API',
            'telefono': '555-1234',
            'email': 'api@example.com',
            'origen': 'WEB'
        }
        
        response = self.client.post(self.list_url, data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['nombre'] == 'Nuevo Cliente API'
        
        # Verificar que se creó en la base de datos
        assert Cliente.objects.filter(numero_documento='999888777').exists()
    
    def test_update_cliente(self):
        """Test de actualización de cliente"""
        data = {
            'nombre': 'Nombre Actualizado API',
            'direccion': 'Nueva dirección API',
            'telefono': '999-8888',
            'email': 'actualizado@example.com'
        }
        
        response = self.client.patch(self.detail_url, data)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['nombre'] == 'Nombre Actualizado API'
        
        # Verificar actualización en BD
        self.cliente.refresh_from_db()
        assert self.cliente.nombre == 'Nombre Actualizado API'
        assert self.cliente.telefono == '999-8888'
    
    def test_delete_cliente(self):
        """Test de eliminación de cliente (soft delete)"""
        response = self.client.delete(self.detail_url)
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verificar soft delete
        self.cliente.refresh_from_db()
        assert self.cliente.is_active == False
    
    def test_estadisticas_endpoint(self):
        """Test del endpoint de estadísticas"""
        # Crear clientes con diferentes características
        ClienteBoliviaNITFactory(total_gastado=1000, numero_de_compras=2)
        ClienteBrasilCPFFactory(total_gastado=500, numero_de_compras=1)
        ClienteFactory(total_gastado=300, numero_de_compras=1, is_active=False)
        
        url = reverse('cliente-estadisticas')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'estadisticas_generales' in response.data
        assert 'distribucion_por_tipo' in response.data
        assert 'distribucion_por_pais' in response.data
        
        stats = response.data['estadisticas_generales']
        assert stats['total_clientes'] == 4  # Incluye setUp + 2 nuevos activos
        assert stats['ventas_totales'] == 1800.0  # 1000 + 500 + 0 del setUp
    
    def test_buscar_por_documento_endpoint_success(self):
        """Test de búsqueda por documento exitosa"""
        cliente = ClienteBoliviaNITFactory()
        
        url = reverse('cliente-buscar-por-documento')
        params = {
            'pais': cliente.pais.id,
            'tipo_documento': cliente.tipo_documento.id,
            'numero_documento': cliente.numero_documento
        }
        
        response = self.client.get(url, params)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['nombre'] == cliente.nombre
        assert response.data['numero_documento'] == cliente.numero_documento
    
    def test_buscar_por_documento_endpoint_not_found(self):
        """Test de búsqueda por documento cuando no existe"""
        url = reverse('cliente-buscar-por-documento')
        params = {
            'pais': 999,
            'tipo_documento': 999,
            'numero_documento': 'NOEXISTE'
        }
        
        response = self.client.get(url, params)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert 'error' in response.data
        assert 'no encontrado' in response.data['error'].lower()
    
    def test_buscar_por_documento_endpoint_missing_params(self):
        """Test de búsqueda por documento con parámetros faltantes"""
        url = reverse('cliente-buscar-por-documento')
        params = {
            'pais': 1
            # Faltan tipo_documento y numero_documento
        }
        
        response = self.client.get(url, params)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data
    
    def test_actualizar_estadisticas_endpoint(self):
        """Test del endpoint de actualización de estadísticas"""
        cliente = ClienteFactory(numero_de_compras=2, total_gastado=400.00)
        
        url = reverse('cliente-actualizar-estadisticas', kwargs={'pk': cliente.pk})
        data = {'monto_compra': 150.00}
        
        response = self.client.post(url, data)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['nuevo_total_gastado'] == 550.00
        assert response.data['nuevo_numero_compras'] == 3
        
        # Verificar en BD
        cliente.refresh_from_db()
        assert cliente.total_gastado == 550.00
        assert cliente.numero_de_compras == 3
    
    def test_opciones_filtro_endpoint(self):
        """Test del endpoint de opciones de filtro"""
        url = reverse('cliente-opciones-filtro')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'paises' in response.data
        assert 'tipos_documento' in response.data
        assert 'tipos_cliente' in response.data
        assert 'origenes_cliente' in response.data
    
    def test_unauthenticated_access(self):
        """Test de acceso no autenticado"""
        self.client.logout()
        
        response = self.client.get(self.list_url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_filter_by_pais(self):
        """Test de filtrado por país"""
        cliente_bo = ClienteBoliviaNITFactory()
        cliente_br = ClienteBrasilCPFFactory()
        
        response = self.client.get(self.list_url, {'pais': cliente_bo.pais.id})
        
        assert response.status_code == status.HTTP_200_OK
        results = response.data['results']
        
        # Todos los resultados deben ser del país filtrado
        for cliente_data in results:
            assert cliente_data['pais'] == cliente_bo.pais.id
    
    def test_search_by_name(self):
        """Test de búsqueda por nombre"""
        cliente_especial = ClienteFactory(nombre='Cliente Especial Búsqueda')
        
        response = self.client.get(self.list_url, {'search': 'Especial Búsqueda'})
        
        assert response.status_code == status.HTTP_200_OK
        results = response.data['results']
        assert len(results) == 1
        assert results[0]['nombre'] == 'Cliente Especial Búsqueda'

    # --- Tests de Permisos ---

    def test_list_clientes_no_permission(self):
        """Test que un usuario sin permiso de vista no puede listar clientes (403)"""
        self.client.force_authenticate(user=self.user_without_perms)
        response = self.client.get(self.list_url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_cliente_no_permission(self):
        """Test que un usuario sin permiso de creación no puede crear un cliente (403)"""
        self.client.force_authenticate(user=self.user_without_perms)
        data = {
            'nombre': 'Intento de Creación',
            'pais': self.cliente.pais.id,
            'tipo_documento': self.cliente.tipo_documento.id,
            'numero_documento': '123'
        }
        response = self.client.post(self.list_url, data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_update_cliente_no_permission(self):
        """Test que un usuario sin permiso de edición no puede actualizar un cliente (403)"""
        self.client.force_authenticate(user=self.user_without_perms)
        data = { 'nombre': 'Intento de Actualización' }
        response = self.client.patch(self.detail_url, data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_delete_cliente_no_permission(self):
        """Test que un usuario sin permiso de eliminación no puede borrar un cliente (403)"""
        self.client.force_authenticate(user=self.user_without_perms)
        response = self.client.delete(self.detail_url)
        assert response.status_code == status.HTTP_403_FORBIDDEN