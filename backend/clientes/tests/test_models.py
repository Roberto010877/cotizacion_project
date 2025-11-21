# clientes/tests/test_models.py
import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from clientes.models import Cliente, Pais, TipoDocumentoConfig
from .factories import ClienteFactory, PaisFactory, TipoDocumentoConfigFactory, ClienteBoliviaNITFactory

@pytest.mark.django_db
class TestClienteModel:
    
    def test_cliente_creation(self):
        """Test que verifica la creación básica de un cliente"""
        cliente = ClienteFactory()
        assert cliente.is_active == True
        assert cliente.tipo == Cliente.TipoCliente.NUEVO
        assert cliente.numero_de_compras == 0
        assert cliente.total_gastado == 0
    
    def test_cliente_str_representation(self):
        """Test del método __str__"""
        cliente = ClienteFactory(nombre="Juan Pérez")
        expected_str = f"Juan Pérez ({cliente.tipo_documento.nombre}: {cliente.numero_documento})"
        assert str(cliente) == expected_str
    
    def test_es_empresa_property(self):
        """Test de la propiedad es_empresa"""
        # Cliente con documento de empresa
        cliente_empresa = ClienteBoliviaNITFactory()
        assert cliente_empresa.es_empresa == True
        
        # Cliente con documento de persona
        cliente_persona = ClienteFactory(
            tipo_documento__es_para_empresa=False
        )
        assert cliente_persona.es_empresa == False
    
    def test_es_cliente_activo_property(self):
        """Test de la propiedad es_cliente_activo"""
        cliente = ClienteFactory()
        
        # Cliente sin compras
        assert cliente.es_cliente_activo == False
        
        # Cliente con compra reciente
        cliente.fecha_ultima_compra = timezone.now()
        assert cliente.es_cliente_activo == True
        
        # Cliente con compra antigua (más de 6 meses)
        cliente.fecha_ultima_compra = timezone.now() - timedelta(days=200)
        assert cliente.es_cliente_activo == False
    
    def test_promedio_compra_property(self):
        """Test de la propiedad promedio_compra"""
        cliente = ClienteFactory(
            numero_de_compras=4,
            total_gastado=1000.00
        )
        assert cliente.promedio_compra == 250.00
        
        # Cliente sin compras
        cliente_sin_compras = ClienteFactory()
        assert cliente_sin_compras.promedio_compra == 0
    
    def test_clean_validation_success(self):
        """Test de validación clean() exitosa"""
        cliente = ClienteFactory.build()
        try:
            cliente.clean()  # No debe lanzar excepción
            assert True
        except ValidationError:
            assert False, "La validación clean() falló incorrectamente"
    
    def test_clean_validation_country_mismatch(self):
        """Test de validación cuando país y tipo documento no coinciden"""
        pais_bolivia = PaisFactory(codigo='BO', nombre='Bolivia')
        pais_brasil = PaisFactory(codigo='BR', nombre='Brasil')
        
        documento_brasil = TipoDocumentoConfigFactory(
            pais=pais_brasil,
            codigo='CPF',
            nombre='CPF Brasil'
        )
        
        cliente = ClienteFactory.build(
            pais=pais_bolivia,
            tipo_documento=documento_brasil  # ❌ No coincide
        )
        
        with pytest.raises(ValidationError) as exc_info:
            cliente.clean()
        
        assert 'tipo_documento' in str(exc_info.value)
    
    def test_clean_validation_document_length(self):
        """Test de validación de longitud de documento"""
        cliente = ClienteFactory.build(
            tipo_documento__longitud_minima=5,
            tipo_documento__longitud_maxima=10,
            numero_documento='123'  # ❌ Muy corto
        )
        
        with pytest.raises(ValidationError) as exc_info:
            cliente.clean()
        
        assert 'Longitud debe estar entre' in str(exc_info.value)
    
    def test_actualizar_estadisticas_method(self):
        """Test del método actualizar_estadisticas"""
        cliente = ClienteFactory(
            numero_de_compras=2,
            total_gastado=500.00,
            tipo=Cliente.TipoCliente.NUEVO
        )
        
        # Actualizar con nueva compra
        cliente.actualizar_estadisticas(300.00)
        
        assert cliente.numero_de_compras == 3
        assert cliente.total_gastado == 800.00
        assert cliente.tipo == Cliente.TipoCliente.RECURRENTE  # Debería actualizarse
        
        # Verificar que se convierte en VIP
        cliente.actualizar_estadisticas(500.00)  # Total > 1000 y compras >= 10
        cliente.numero_de_compras = 9  # Forzar para probar VIP
        cliente.actualizar_estadisticas(500.00)
        assert cliente.tipo == Cliente.TipoCliente.VIP
    
    def test_soft_delete(self):
        """Test que verifica el soft delete"""
        cliente = ClienteFactory()
        original_id = cliente.id
        
        # "Eliminar" el cliente
        cliente.delete()
        
        # Verificar que sigue en la base de datos pero inactivo
        assert Cliente.objects.filter(id=original_id).exists()
        assert Cliente.objects.get(id=original_id).is_active == False
    
    def test_telefono_completo_property(self):
        """Test de la propiedad telefono_completo"""
        cliente = ClienteFactory(
            pais__codigo_telefono='+591',
            telefono='71234567'
        )
        assert cliente.telefono_completo == '+591 71234567'
        
        # Sin teléfono
        cliente_sin_telefono = ClienteFactory(telefono='')
        assert cliente_sin_telefono.telefono_completo == ''