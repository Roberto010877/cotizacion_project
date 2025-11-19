# clientes/tests/test_serializers.py
import pytest
from rest_framework.exceptions import ErrorDetail
from clientes.serializers import (
    ClienteSerializer, 
    ClienteCreateSerializer,
    ClienteUpdateSerializer
)
from .factories import ClienteFactory, PaisFactory, TipoDocumentoConfigFactory

@pytest.mark.django_db
class TestClienteSerializers:
    
    def test_cliente_serializer(self):
        """Test del serializer básico de cliente"""
        cliente = ClienteFactory()
        serializer = ClienteSerializer(cliente)
        
        data = serializer.data
        assert data['nombre'] == cliente.nombre
        assert data['pais_nombre'] == cliente.pais.nombre
        assert data['tipo_documento_nombre'] == cliente.tipo_documento.nombre
        assert data['es_empresa'] == cliente.es_empresa
        assert 'id' in data
        assert 'numero_documento' in data
    
    def test_cliente_create_serializer_valid(self):
        """Test del serializer de creación con datos válidos"""
        pais = PaisFactory()
        tipo_documento = TipoDocumentoConfigFactory(pais=pais)
        
        data = {
            'nombre': 'Nuevo Cliente Test',
            'pais': pais.id,
            'tipo_documento': tipo_documento.id,
            'numero_documento': '12345678901',
            'direccion': 'Dirección de prueba',
            'telefono': '123456789',
            'email': 'nuevo@example.com',
            'origen': 'WEB',
            'preferencias_contacto': 'WHATSAPP'
        }
        
        serializer = ClienteCreateSerializer(data=data)
        assert serializer.is_valid() == True, serializer.errors
    
    def test_cliente_create_serializer_invalid_country_mismatch(self):
        """Test del serializer de creación con país y documento no coincidentes"""
        pais_bolivia = PaisFactory(codigo='BO')
        pais_brasil = PaisFactory(codigo='BR')
        documento_brasil = TipoDocumentoConfigFactory(pais=pais_brasil)
        
        data = {
            'nombre': 'Cliente Test',
            'pais': pais_bolivia.id,  # Bolivia
            'tipo_documento': documento_brasil.id,  # Documento Brasil ❌
            'numero_documento': '12345678901'
        }
        
        serializer = ClienteCreateSerializer(data=data)
        assert serializer.is_valid() == False
        assert 'tipo_documento' in serializer.errors
        assert 'no pertenece al país' in str(serializer.errors['tipo_documento'][0])
    
    def test_cliente_create_serializer_missing_required_fields(self):
        """Test del serializer de creación con campos requeridos faltantes"""
        data = {
            'nombre': 'Cliente Test'
            # Faltan pais, tipo_documento, numero_documento
        }
        
        serializer = ClienteCreateSerializer(data=data)
        assert serializer.is_valid() == False
        assert 'pais' in serializer.errors
        assert 'tipo_documento' in serializer.errors
        assert 'numero_documento' in serializer.errors
    
    def test_cliente_update_serializer(self):
        """Test del serializer de actualización"""
        cliente = ClienteFactory()
        
        data = {
            'nombre': 'Nombre Actualizado',
            'direccion': 'Nueva dirección',
            'telefono': '987654321',
            'email': 'actualizado@example.com',
            'origen': 'RECOMENDACION',
            'preferencias_contacto': 'EMAIL'
        }
        
        serializer = ClienteUpdateSerializer(instance=cliente, data=data)
        assert serializer.is_valid() == True, serializer.errors
        
        updated_cliente = serializer.save()
        assert updated_cliente.nombre == 'Nombre Actualizado'
        assert updated_cliente.telefono == '987654321'
        assert updated_cliente.preferencias_contacto == 'EMAIL'
    
    def test_cliente_serializer_read_only_fields(self):
        """Test que verifica que ciertos campos son de solo lectura"""
        cliente = ClienteFactory()
        
        data = {
            'numero_de_compras': 999,  # ❌ Debería ser ignorado
            'total_gastado': 9999.99,  # ❌ Debería ser ignorado
            'nombre': 'Nombre Válido'
        }
        
        serializer = ClienteSerializer(instance=cliente, data=data, partial=True)
        assert serializer.is_valid() == True, serializer.errors
        
        # Los campos de solo lectura no deberían cambiar
        updated_cliente = serializer.save()
        assert updated_cliente.numero_de_compras == cliente.numero_de_compras
        assert updated_cliente.total_gastado == cliente.total_gastado