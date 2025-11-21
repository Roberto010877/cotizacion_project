import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate
from core.models import User
from pedidos_servicio.views import PedidoServicioViewSet

# Crear factory
factory = APIRequestFactory()
view = PedidoServicioViewSet.as_view({'get': 'list'})

# Obtener un usuario
user = User.objects.first()
print(f'Usuario: {user.email} (staff={user.is_staff})')

# Crear request
request = factory.get('/api/v1/pedidos-servicio/?page=1&page_size=25')
force_authenticate(request, user=user)

# Ejecutar view
response = view(request)
print(f'Status: {response.status_code}')
if response.status_code == 200:
    print(f'Total: {response.data.get("count", 0)} pedidos')
else:
    print(f'Error: {response.data}')
