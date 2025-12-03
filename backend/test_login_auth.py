#!/usr/bin/env python
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model, authenticate
from rest_framework.test import APIClient

User = get_user_model()

print("=" * 70)
print("DIAGNÓSTICO COMPLETO DE AUTENTICACIÓN JWT")
print("=" * 70)

# 1. Verificar usuario admin
print("\n1️⃣  VERIFICAR USUARIO ADMIN EN BD")
print("-" * 70)
admin_user = User.objects.filter(username='admin').first()

if admin_user:
    print(f"✅ Usuario encontrado: {admin_user.username}")
    print(f"   Email: {admin_user.email}")
    print(f"   Superuser: {admin_user.is_superuser}")
    print(f"   Staff: {admin_user.is_staff}")
    print(f"   Activo: {admin_user.is_active}")
    print(f"   Último login: {admin_user.last_login}")
else:
    print("❌ Usuario 'admin' NO encontrado")
    print("\n   Usuarios disponibles:")
    for user in User.objects.all()[:10]:
        print(f"     - {user.username}")
    sys.exit(1)

# 2. Probar autenticación de Django
print("\n2️⃣  PROBAR AUTENTICACIÓN DJANGO")
print("-" * 70)
try:
    authenticated_user = authenticate(username='admin', password='admin123')
    if authenticated_user:
        print(f"✅ Autenticación Django: EXITOSA")
        print(f"   Usuario: {authenticated_user.username}")
    else:
        print(f"❌ Autenticación Django: FALLIDA")
        print("   La contraseña podría ser incorrecta")
except Exception as e:
    print(f"❌ Error en autenticación: {str(e)}")

# 3. Probar endpoint JWT vía API
print("\n3️⃣  PROBAR ENDPOINT JWT (/api/token/)")
print("-" * 70)
try:
    client = APIClient()
    response = client.post('/api/token/', 
        {'username': 'admin', 'password': 'admin123'},
        format='json'
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Token generado exitosamente")
        print(f"\n   Access Token:")
        print(f"   {data['access'][:80]}...")
        if 'refresh' in data:
            print(f"\n   Refresh Token:")
            print(f"   {data['refresh'][:80]}...")
        
        # 4. Probar usar el token
        print("\n4️⃣  VERIFICAR TOKEN CON /api/users/me/")
        print("-" * 70)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access']}")
        me_response = client.get('/api/users/me/')
        
        if me_response.status_code == 200:
            print(f"✅ Token válido. Usuario autenticado:")
            print(f"   {me_response.json()}")
        else:
            print(f"❌ Error verificando token: {me_response.status_code}")
            print(f"   {me_response.content.decode()}")
    else:
        print(f"❌ Error en /api/token/")
        print(f"   Response: {response.content.decode()}")
        
except Exception as e:
    print(f"❌ Error en prueba: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
print("DIAGNÓSTICO COMPLETADO")
print("=" * 70)
