"""
Script para crear registro de Rita en la tabla Manufactura
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from manufactura.models import Manufactura

def crear_rita_manufactura():
    """
    Crea un registro de Rita en la tabla Manufactura con cargo COMERCIAL
    """
    print("=" * 70)
    print("CREANDO REGISTRO RITA EN TABLA MANUFACTURA")
    print("=" * 70)
    
    # Verificar si ya existe
    if Manufactura.objects.filter(documento='DOC-RITA-001').exists():
        print("\n⚠️  Rita ya existe en manufactura")
        rita = Manufactura.objects.get(documento='DOC-RITA-001')
        print(f"   Nombre: {rita.get_full_name()}")
        print(f"   Cargo: {rita.cargo}")
        print(f"   ID: {rita.id}")
        return rita
    
    # Crear registro
    try:
        rita = Manufactura.objects.create(
            nombre='Rita',
            apellido='Comercial',
            documento='DOC-RITA-001',
            email='rita.comercial@cortinas.com',
            telefono='+595981234567',
            ciudad='Asunción',
            cargo='COMERCIAL',
            especialidad='Ventas y Coordinación',
            estado='ACTIVO',
            calificacion=5.0,
        )
        
        print(f"\n✅ Registro creado exitosamente")
        print(f"   ID: {rita.id}")
        print(f"   Nombre: {rita.get_full_name()}")
        print(f"   Documento: {rita.documento}")
        print(f"   Email: {rita.email}")
        print(f"   Cargo: {rita.cargo}")
        print(f"   Ciudad: {rita.ciudad}")
        print(f"   Estado: {rita.estado}")
        
        print("\n" + "=" * 70)
        print("✅ RITA CREADA EN MANUFACTURA EXITOSAMENTE")
        print("=" * 70)
        
        return rita
        
    except Exception as e:
        print(f"\n❌ Error al crear registro: {str(e)}")
        return None

if __name__ == '__main__':
    crear_rita_manufactura()
