import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from pedidos_servicio.models import PedidoServicio, AsignacionTarea
from manufactura.models import Manufactura

# Obtener todos los pedidos
pedidos = PedidoServicio.objects.all().order_by('-created_at')
print(f"Total de pedidos: {pedidos.count()}")

# Obtener instaladores disponibles
instaladores = list(Manufactura.objects.all())
print(f"Instaladores disponibles: {len(instaladores)}")

if not instaladores:
    print("❌ No hay instaladores disponibles")
    exit(1)

# Crear asignaciones para cada pedido
contador = 0
for pedido in pedidos:
    # Verificar si ya tiene asignaciones
    asignaciones_existentes = AsignacionTarea.objects.filter(pedido=pedido).count()
    if asignaciones_existentes > 0:
        print(f"⊘ Pedido {pedido.numero_pedido} ya tiene {asignaciones_existentes} asignaciones, saltando...")
        continue
    
    # Alternar entre instaladores para distribuir
    instalador_fab = instaladores[contador % len(instaladores)]
    instalador_inst = instaladores[(contador + 1) % len(instaladores)]
    
    # Crear asignación de FABRICACION
    try:
        tarea_fab = AsignacionTarea.objects.create(
            pedido=pedido,
            instalador=instalador_fab,
            tipo_tarea=AsignacionTarea.TipoTarea.FABRICACION,
            estado=AsignacionTarea.EstadoTarea.PENDIENTE,
            descripcion_tarea=f"Fabricar los items del pedido {pedido.numero_pedido}",
            fecha_entrega_esperada=pedido.fecha_fin,
        )
        print(f"✓ Fabricación de {pedido.numero_pedido} asignada a {instalador_fab.get_full_name()}")
    except Exception as e:
        print(f"✗ Error creando fabricación para {pedido.numero_pedido}: {e}")
    
    # Crear asignación de INSTALACION
    try:
        tarea_inst = AsignacionTarea.objects.create(
            pedido=pedido,
            instalador=instalador_inst,
            tipo_tarea=AsignacionTarea.TipoTarea.INSTALACION,
            estado=AsignacionTarea.EstadoTarea.PENDIENTE,
            descripcion_tarea=f"Instalar los items del pedido {pedido.numero_pedido}",
            fecha_entrega_esperada=pedido.fecha_fin,
        )
        print(f"✓ Instalación de {pedido.numero_pedido} asignada a {instalador_inst.get_full_name()}")
    except Exception as e:
        print(f"✗ Error creando instalación para {pedido.numero_pedido}: {e}")
    
    contador += 1

# Mostrar resumen
total_asignaciones = AsignacionTarea.objects.count()
print(f"\n✓ Total de asignaciones en base de datos: {total_asignaciones}")
print("\nDesglose por estado:")
for estado in ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO']:
    count = AsignacionTarea.objects.filter(estado=estado).count()
    if count > 0:
        print(f"  - {estado}: {count}")

print("\nDesglose por tipo:")
for tipo in ['FABRICACION', 'INSTALACION']:
    count = AsignacionTarea.objects.filter(tipo_tarea=tipo).count()
    if count > 0:
        print(f"  - {tipo}: {count}")
