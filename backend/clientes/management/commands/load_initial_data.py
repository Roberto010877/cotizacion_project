# clientes/management/commands/load_initial_data.py
from django.core.management.base import BaseCommand
from common.models import Pais, TipoDocumentoConfig

class Command(BaseCommand):
    help = 'Carga datos iniciales de países y tipos de documento'

    def handle(self, *args, **options):
        # Crear países
        paises_data = [
            {'codigo': 'BO', 'nombre': 'Bolivia', 'codigo_telefono': '+591'},
            {'codigo': 'PY', 'nombre': 'Paraguay', 'codigo_telefono': '+595'},
            {'codigo': 'BR', 'nombre': 'Brasil', 'codigo_telefono': '+55'},
            {'codigo': 'AR', 'nombre': 'Argentina', 'codigo_telefono': '+54'},
        ]
        
        for pais_data in paises_data:
            pais, created = Pais.objects.get_or_create(
                codigo=pais_data['codigo'],
                defaults=pais_data
            )
            if created:
                self.stdout.write(f'✅ País creado: {pais.nombre}')

        # Crear tipos de documento
        documentos_data = [
            # Bolivia
            {'pais': 'BO', 'codigo': 'NIT', 'nombre': 'NIT', 
             'regex_validacion': r'^[0-9]{7,11}$', 
             'mensaje_error': 'NIT debe contener 7-11 dígitos numéricos',
             'es_para_empresa': True, 'longitud_minima': 7, 'longitud_maxima': 11},
            
            {'pais': 'BO', 'codigo': 'CI', 'nombre': 'Cédula de Identidad', 
             'regex_validacion': r'^[0-9]{6,8}[A-Z]*$', 
             'mensaje_error': 'CI debe contener 6-8 dígitos + letras opcionales',
             'es_para_empresa': False, 'longitud_minima': 6, 'longitud_maxima': 10},
            
            # Paraguay
            {'pais': 'PY', 'codigo': 'RUC', 'nombre': 'RUC', 
             'regex_validacion': r'^[0-9]{6,10}-[0-9]{1}$', 
             'mensaje_error': 'RUC debe tener formato: 12345678-1',
             'es_para_empresa': True, 'longitud_minima': 8, 'longitud_maxima': 11},
            
            # Brasil
            {'pais': 'BR', 'codigo': 'CPF', 'nombre': 'CPF', 
             'regex_validacion': r'^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$|^[0-9]{11}$', 
             'mensaje_error': 'CPF debe tener formato: 123.456.789-09 o 12345678909',
             'es_para_empresa': False, 'longitud_minima': 11, 'longitud_maxima': 14},
        ]
        
        for doc_data in documentos_data:
            pais = Pais.objects.get(codigo=doc_data.pop('pais'))
            tipo_doc, created = TipoDocumentoConfig.objects.get_or_create(
                pais=pais,
                codigo=doc_data['codigo'],
                defaults=doc_data
            )
            if created:
                self.stdout.write(f'✅ Documento creado: {pais.nombre} - {tipo_doc.nombre}')

        self.stdout.write(self.style.SUCCESS('✅ Datos iniciales cargados exitosamente'))