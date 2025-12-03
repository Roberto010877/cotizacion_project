"""
Script interactivo para vincular usuario 'instalador' con Rafael Reyes
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from manufactura.models import Manufactura

User = get_user_model()

# Vincular instalador → Rafael Reyes
try:
    usuario = User.objects.get(username='instalador')
    print(f"✅ Usuario encontrado: {usuario.username}")
    
    rafael = Manufactura.objects.get(documento='DOC75156100')
    print(f"✅ Personal encontrado: {rafael.get_full_name()} - {rafael.cargo}")
    
    rafael.usuario = usuario
    rafael.save()
    
    print(f"\n🎉 ¡VINCULACIÓN EXITOSA!")
    print(f"   Usuario 'instalador' ahora está vinculado a '{rafael.get_full_name()}'")
    print(f"\n✅ Cuando 'instalador' inicie sesión, verá las tareas asignadas a Rafael Reyes")
    
except User.DoesNotExist:
    print("❌ Usuario 'instalador' no encontrado")
except Manufactura.DoesNotExist:
    print("❌ Rafael Reyes (DOC75156100) no encontrado")
