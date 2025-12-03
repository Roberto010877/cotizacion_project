#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Obtener token JWT
response = requests.post(
    'http://127.0.0.1:8000/api/token/',
    data={
        'username': 'admin',
        'password': 'admin123'
    }
)

if response.status_code != 200:
    print(f"❌ Error getting token: {response.status_code}")
    print(response.text)
    sys.exit(1)

token = response.json()['access']
print(f"✅ Token obtenido: {token[:20]}...")

# Obtener idioma actual
headers = {'Authorization': f'Bearer {token}'}

# Primero, intentar obtener el usuario actual
print(f"\n🔍 Probando diferentes URLs...")

urls_to_try = [
    'http://127.0.0.1:8000/api/v1/users/me/',
    'http://127.0.0.1:8000/api/v1/users/',
    'http://127.0.0.1:8000/api/v1/users/1/',
]

for url in urls_to_try:
    try:
        response = requests.get(url, headers=headers, timeout=5)
        print(f"  {url} -> {response.status_code}")
        if response.text:
            print(f"    Response: {response.text[:100]}")
    except Exception as e:
        print(f"  {url} -> Error: {e}")

response = requests.get(
    'http://127.0.0.1:8000/api/v1/users/me/',
    headers=headers
)

print(f"\n📋 Usuario actual:")
print(f"Status Code: {response.status_code}")
print(f"Response Text: {response.text}")
if response.status_code == 200:
    user_data = response.json()
    print(json.dumps(user_data, indent=2))
else:
    print("❌ Error obteniendo usuario")

# Obtener idioma desde el endpoint dedicado
response = requests.get(
    'http://127.0.0.1:8000/api/v1/users/me/language/',
    headers=headers
)

print(f"\n🔤 Idioma actual (GET /api/users/me/language/):")
print(json.dumps(response.json(), indent=2))

# Cambiar idioma a English
print(f"\n🔄 Cambiando idioma a 'en'...")
response = requests.patch(
    'http://127.0.0.1:8000/api/v1/users/me/language/',
    headers=headers,
    json={'language': 'en'}
)

print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

# Verificar en base de datos
admin = User.objects.get(username='admin')
print(f"\n✅ Idioma en BD después de PATCH: {admin.language}")

# Cambiar a Portuguese
print(f"\n🔄 Cambiando idioma a 'pt'...")
response = requests.patch(
    'http://127.0.0.1:8000/api/v1/users/me/language/',
    headers=headers,
    json={'language': 'pt'}
)

print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

# Verificar en base de datos
admin = User.objects.get(username='admin')
print(f"\n✅ Idioma en BD después de PATCH: {admin.language}")

# GET final para confirmar
response = requests.get(
    'http://127.0.0.1:8000/api/v1/users/me/language/',
    headers=headers
)
print(f"\n🔤 Idioma final (GET /api/users/me/language/):")
print(json.dumps(response.json(), indent=2))
