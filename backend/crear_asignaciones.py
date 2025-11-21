import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from pedidos_servicio.models import PedidoServicio, AsignacionTarea
from instaladores.models import Instalador

# Obtener el pedido más reciente
pedido = PedidoServicio.objects.last()
print(f"Pedido: {pedido.numero_pedido}")

# Obtener un instalador
instalador = Instalador.objects.first()
print(f"Instalador: {instalador.get_full_name()}")

# Crear asignación de FABRICACION
tarea_fab = AsignacionTarea.objects.create(
    pedido=pedido,
    instalador=instalador,
    tipo_tarea=AsignacionTarea.TipoTarea.FABRICACION,
    estado=AsignacionTarea.EstadoTarea.PENDIENTE,
    descripcion_tarea="Fabricar los items según el pedido",
    fecha_entrega_esperada=pedido.fecha_fin,
)
print(f"✓ Asignación de Fabricación creada: {tarea_fab}")

# Obtener otro instalador para instalación
instaladores = Instalador.objects.all()
if len(instaladores) > 1:
    instalador2 = instaladores[1]
    tarea_inst = AsignacionTarea.objects.create(
        pedido=pedido,
        instalador=instalador2,
        tipo_tarea=AsignacionTarea.TipoTarea.INSTALACION,
        estado=AsignacionTarea.EstadoTarea.PENDIENTE,
        descripcion_tarea="Instalar los items en el lugar del cliente",
        fecha_entrega_esperada=pedido.fecha_fin,
    )
    print(f"✓ Asignación de Instalación creada: {tarea_inst}")
else:
    print("⚠ No hay segundo instalador disponible")

print("\n✓ Asignaciones creadas exitosamente")
