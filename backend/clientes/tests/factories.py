# clientes/tests/factories.py
import factory
from factory.django import DjangoModelFactory
from django.contrib.auth import get_user_model
from clientes.models import Cliente, Pais, TipoDocumentoConfig

User = get_user_model()

class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
    
    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.Sequence(lambda n: f'user{n}@example.com')
    password = factory.PostGenerationMethodCall('set_password', 'password123')

class PaisFactory(DjangoModelFactory):
    class Meta:
        model = Pais
    
    codigo = factory.Sequence(lambda n: f'P{n}')
    nombre = factory.Sequence(lambda n: f'País {n}')
    codigo_telefono = '+000'
    activo = True

class TipoDocumentoConfigFactory(DjangoModelFactory):
    class Meta:
        model = TipoDocumentoConfig
    
    pais = factory.SubFactory(PaisFactory)
    codigo = factory.Sequence(lambda n: f'DOC{n}')
    nombre = factory.Sequence(lambda n: f'Documento {n}')
    descripcion = 'Documento de prueba'
    regex_validacion = r'^[0-9]+$'
    mensaje_error = 'Documento inválido'
    es_para_empresa = False
    longitud_minima = 1
    longitud_maxima = 20
    formato_ejemplo = '123456'
    activo = True

class ClienteFactory(DjangoModelFactory):
    class Meta:
        model = Cliente
    
    nombre = factory.Sequence(lambda n: f'Cliente Test {n}')
    pais = factory.SubFactory(PaisFactory)
    tipo_documento = factory.SubFactory(
        TipoDocumentoConfigFactory,
        pais=factory.SelfAttribute('..pais')
    )
    numero_documento = factory.Sequence(lambda n: f'{n}' * 8)
    direccion = 'Dirección de prueba 123'
    telefono = '123456789'
    email = factory.Sequence(lambda n: f'cliente{n}@example.com')
    tipo = Cliente.TipoCliente.NUEVO
    origen = Cliente.OrigenCliente.WEB
    usuario = factory.SubFactory(UserFactory)

# Factories específicos para casos comunes
class ClienteBoliviaNITFactory(ClienteFactory):
    pais = factory.LazyFunction(lambda: PaisFactory(codigo='BO', nombre='Bolivia', codigo_telefono='+591'))
    tipo_documento = factory.LazyFunction(lambda: TipoDocumentoConfigFactory(
        pais=factory.SelfAttribute('..pais'),
        codigo='NIT',
        nombre='NIT Bolivia',
        es_para_empresa=True,
        regex_validacion=r'^[0-9]{7,11}$'
    ))
    numero_documento = '1234567017'

class ClienteBrasilCPFFactory(ClienteFactory):
    pais = factory.LazyFunction(lambda: PaisFactory(codigo='BR', nombre='Brasil', codigo_telefono='+55'))
    tipo_documento = factory.LazyFunction(lambda: TipoDocumentoConfigFactory(
        pais=factory.SelfAttribute('..pais'),
        codigo='CPF',
        nombre='CPF Brasil',
        es_para_empresa=False,
        regex_validacion=r'^[0-9]{11}$'
    ))
    numero_documento = '12345678909'