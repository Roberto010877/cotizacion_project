import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from common.models import TipoDocumentoConfig, Pais

# Obtener países
bo = Pais.objects.get(codigo='BO')
py = Pais.objects.get(codigo='PY')
br = Pais.objects.get(codigo='BR')

# Crear tipos de documento
TipoDocumentoConfig.objects.get_or_create(codigo='NIT', pais=bo, defaults={'nombre': 'Número de Identificación Tributaria'})
TipoDocumentoConfig.objects.get_or_create(codigo='CI', pais=bo, defaults={'nombre': 'Cédula de Identidad'})
TipoDocumentoConfig.objects.get_or_create(codigo='RUC', pais=py, defaults={'nombre': 'Registro Único del Contribuyente'})
TipoDocumentoConfig.objects.get_or_create(codigo='CPF', pais=br, defaults={'nombre': 'Cadastro de Pessoas Físicas'})

print('✅ Tipos de documento creados exitosamente')
