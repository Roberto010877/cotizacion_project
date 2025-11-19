# clientes/tests/test_filters.py
import pytest
from clientes.filters import ClienteFilter
from .factories import ClienteFactory, ClienteBoliviaNITFactory, ClienteBrasilCPFFactory

@pytest.mark.django_db
class TestClienteFilter:
    
    def test_filter_by_nombre(self):
        """Test de filtrado por nombre"""
        cliente1 = ClienteFactory(nombre='Juan Pérez')
        cliente2 = ClienteFactory(nombre='María García')
        
        queryset = Cliente.objects.all()
        filterset = ClienteFilter({'nombre': 'Juan'}, queryset=queryset)
        
        results = filterset.qs
        assert len(results) == 1
        assert results[0].nombre == 'Juan Pérez'
    
    def test_filter_by_pais(self):
        """Test de filtrado por país"""
        cliente_bo = ClienteBoliviaNITFactory()
        cliente_br = ClienteBrasilCPFFactory()
        
        queryset = Cliente.objects.all()
        filterset = ClienteFilter({'pais': cliente_bo.pais.id}, queryset=queryset)
        
        results = filterset.qs
        assert len(results) == 1
        assert results[0].pais.codigo == 'BO'
    
    def test_filter_by_tipo_documento(self):
        """Test de filtrado por tipo de documento"""
        cliente_bo = ClienteBoliviaNITFactory()
        cliente_br = ClienteBrasilCPFFactory()
        
        queryset = Cliente.objects.all()
        filterset = ClienteFilter(
            {'tipo_documento': cliente_bo.tipo_documento.id}, 
            queryset=queryset
        )
        
        results = filterset.qs
        assert len(results) == 1
        assert results[0].tipo_documento.codigo == 'NIT'
    
    def test_filter_by_tipo_cliente(self):
        """Test de filtrado por tipo de cliente"""
        cliente_vip = ClienteFactory(tipo='VIP')
        cliente_nuevo = ClienteFactory(tipo='NUEVO')
        
        queryset = Cliente.objects.all()
        filterset = ClienteFilter({'tipo': 'VIP'}, queryset=queryset)
        
        results = filterset.qs
        assert len(results) == 1
        assert results[0].tipo == 'VIP'
    
    def test_filter_es_empresa(self):
        """Test de filtrado por es_empresa"""
        cliente_empresa = ClienteBoliviaNITFactory()  # Es empresa
        cliente_persona = ClienteBrasilCPFFactory()   # Es persona
        
        queryset = Cliente.objects.all()
        
        # Filtrar empresas
        filterset_empresa = ClienteFilter({'es_empresa': True}, queryset=queryset)
        results_empresa = filterset_empresa.qs
        assert len(results_empresa) == 1
        assert results_empresa[0].es_empresa == True
        
        # Filtrar personas
        filterset_persona = ClienteFilter({'es_empresa': False}, queryset=queryset)
        results_persona = filterset_persona.qs
        assert len(results_persona) == 1
        assert results_persona[0].es_empresa == False
    
    def test_filter_activo(self):
        """Test de filtrado por cliente activo"""
        from django.utils import timezone
        from datetime import timedelta
        
        cliente_activo = ClienteFactory(fecha_ultima_compra=timezone.now())
        cliente_inactivo = ClienteFactory(
            fecha_ultima_compra=timezone.now() - timedelta(days=200)
        )
        
        queryset = Cliente.objects.all()
        
        # Filtrar activos
        filterset_activo = ClienteFilter({'activo': True}, queryset=queryset)
        results_activo = filterset_activo.qs
        assert len(results_activo) == 1
        assert results_activo[0].es_cliente_activo == True
        
        # Filtrar inactivos
        filterset_inactivo = ClienteFilter({'activo': False}, queryset=queryset)
        results_inactivo = filterset_inactivo.qs
        assert len(results_inactivo) == 1
        assert results_inactivo[0].es_cliente_activo == False
    
    def test_filter_by_fecha_range(self):
        """Test de filtrado por rango de fechas"""
        from django.utils import timezone
        from datetime import timedelta
        
        hoy = timezone.now()
        cliente_reciente = ClienteFactory(created_at=hoy)
        cliente_antiguo = ClienteFactory(created_at=hoy - timedelta(days=30))
        
        queryset = Cliente.objects.all()
        
        # Filtrar desde hace 15 días
        filterset = ClienteFilter({
            'fecha_desde': (hoy - timedelta(days=15)).date()
        }, queryset=queryset)
        
        results = filterset.qs
        assert len(results) == 1
        assert results[0].created_at.date() == hoy.date()
    
    def test_multiple_filters(self):
        """Test de múltiples filtros combinados"""
        cliente_bo_vip = ClienteBoliviaNITFactory(tipo='VIP')
        cliente_bo_nuevo = ClienteBoliviaNITFactory(tipo='NUEVO')
        cliente_br_vip = ClienteBrasilCPFFactory(tipo='VIP')
        
        queryset = Cliente.objects.all()
        filterset = ClienteFilter({
            'pais': cliente_bo_vip.pais.id,
            'tipo': 'VIP'
        }, queryset=queryset)
        
        results = filterset.qs
        assert len(results) == 1
        assert results[0].pais.codigo == 'BO'
        assert results[0].tipo == 'VIP'