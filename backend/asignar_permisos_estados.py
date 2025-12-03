"""
Script para asignar permisos de cambio de estado a los diferentes grupos.

Flujo de estados:
ENVIADO → ACEPTADO → EN_FABRICACION → LISTO_INSTALAR → INSTALADO → COMPLETADO

Roles y permisos:
- Comercial: Puede crear (ENVIADO) y aceptar/rechazar pedidos
- Manufacturador: Puede cambiar a EN_FABRICACION y LISTO_INSTALAR
- Instalador: Puede cambiar a INSTALADO
- Admin/Supervisor: Puede completar o cancelar pedidos
"""

import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from pedidos_servicio.models import PedidoServicio


def asignar_permisos_grupos():
    """Asigna permisos personalizados a cada grupo según su rol"""
    
    # Obtener el ContentType de PedidoServicio
    content_type = ContentType.objects.get_for_model(PedidoServicio)
    
    # Obtener todos los permisos personalizados
    permisos = {
        'aceptado': Permission.objects.get(
            codename='can_change_to_aceptado',
            content_type=content_type
        ),
        'en_fabricacion': Permission.objects.get(
            codename='can_change_to_en_fabricacion',
            content_type=content_type
        ),
        'listo_instalar': Permission.objects.get(
            codename='can_change_to_listo_instalar',
            content_type=content_type
        ),
        'instalado': Permission.objects.get(
            codename='can_change_to_instalado',
            content_type=content_type
        ),
        'completado': Permission.objects.get(
            codename='can_change_to_completado',
            content_type=content_type
        ),
        'rechazado': Permission.objects.get(
            codename='can_change_to_rechazado',
            content_type=content_type
        ),
        'cancelado': Permission.objects.get(
            codename='can_change_to_cancelado',
            content_type=content_type
        ),
        'delete': Permission.objects.get(
            codename='can_delete_pedido',
            content_type=content_type
        ),
    }
    
    # ========================================
    # GRUPO: COMERCIAL
    # ========================================
    grupo_comercial, created = Group.objects.get_or_create(name='Comercial')
    print(f"\n{'Creando' if created else 'Actualizando'} grupo: Comercial")
    
    # Comercial puede: Aceptar, Rechazar y Eliminar pedidos
    grupo_comercial.permissions.add(
        permisos['aceptado'],
        permisos['rechazado'],
        permisos['delete']
    )
    print("  ✓ Puede cambiar a: ACEPTADO, RECHAZADO")
    print("  ✓ Puede eliminar pedidos en estado ENVIADO")
    
    # ========================================
    # GRUPO: MANUFACTURADOR (antes FABRICADOR)
    # ========================================
    grupo_manufacturador, created = Group.objects.get_or_create(name='manufacturador')
    print(f"\n{'Creando' if created else 'Actualizando'} grupo: manufacturador")
    
    # Manufacturador puede: En Fabricación, Listo para Instalar
    grupo_manufacturador.permissions.add(
        permisos['en_fabricacion'],
        permisos['listo_instalar']
    )
    print("  ✓ Puede cambiar a: EN_FABRICACION, LISTO_INSTALAR")
    
    # ========================================
    # GRUPO: INSTALADOR
    # ========================================
    grupo_instalador, created = Group.objects.get_or_create(name='instalador')
    print(f"\n{'Creando' if created else 'Actualizando'} grupo: instalador")
    
    # Instalador puede: Instalado
    grupo_instalador.permissions.add(
        permisos['instalado']
    )
    print("  ✓ Puede cambiar a: INSTALADO")
    
    # ========================================
    # GRUPO: ADMIN (Supervisor)
    # ========================================
    grupo_admin, created = Group.objects.get_or_create(name='Admin')
    print(f"\n{'Creando' if created else 'Actualizando'} grupo: Admin")
    
    # Admin puede: Completar y Cancelar pedidos (además de todos los anteriores)
    grupo_admin.permissions.add(
        permisos['aceptado'],
        permisos['en_fabricacion'],
        permisos['listo_instalar'],
        permisos['instalado'],
        permisos['completado'],
        permisos['rechazado'],
        permisos['cancelado'],
        permisos['delete']
    )
    print("  ✓ Puede cambiar a: TODOS LOS ESTADOS")
    print("  ✓ Puede eliminar pedidos")
    
    print("\n" + "="*60)
    print("✅ Permisos asignados correctamente")
    print("="*60)
    
    # Mostrar resumen
    print("\n📋 RESUMEN DE PERMISOS POR GRUPO:")
    print("\n1. COMERCIAL:")
    print("   - Crear pedidos (estado inicial: ENVIADO)")
    print("   - Aceptar pedidos (ENVIADO → ACEPTADO)")
    print("   - Rechazar pedidos (cualquier estado → RECHAZADO)")
    
    print("\n2. MANUFACTURADOR:")
    print("   - Iniciar fabricación (ACEPTADO → EN_FABRICACION)")
    print("   - Marcar listo (EN_FABRICACION → LISTO_INSTALAR)")
    
    print("\n3. INSTALADOR:")
    print("   - Confirmar instalación (LISTO_INSTALAR → INSTALADO)")
    
    print("\n4. ADMIN:")
    print("   - Completar pedidos (INSTALADO → COMPLETADO)")
    print("   - Cancelar pedidos (cualquier estado → CANCELADO)")
    print("   - Control total de todos los cambios de estado")
    
    print("\n💡 NOTA: Los superusuarios tienen todos los permisos automáticamente")
    print("\n")


if __name__ == '__main__':
    try:
        asignar_permisos_grupos()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
