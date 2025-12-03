import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cotidomo_backend.settings")
django.setup()

from common.models import Pais, TipoDocumentoConfig

# Crear tipos de documento por país
tipos_documento = [
    {"pais": "BO", "codigo": "NIT", "nombre": "NIT"},
    {"pais": "BO", "codigo": "CI", "nombre": "Cédula de Identidad"},
    {"pais": "PY", "codigo": "RUC", "nombre": "RUC"},
    {"pais": "BR", "codigo": "CPF", "nombre": "CPF"},
]

for tipo_data in tipos_documento:
    pais = Pais.objects.get(codigo=tipo_data["pais"])
    tipo, created = TipoDocumentoConfig.objects.get_or_create(
        pais=pais,
        codigo=tipo_data["codigo"],
        defaults={
            "nombre": tipo_data["nombre"],
            "es_para_empresa": tipo_data["codigo"] in ["NIT", "RUC"]
        }
    )
    if created:
        print(f"✓ Tipo de documento {tipo_data['codigo']} ({tipo_data['pais']}) creado")
    else:
        print(f"✓ Tipo de documento {tipo_data['código']} ({tipo_data['pais']}) ya existe")

print("\n✓ Tipos de documento listos")
