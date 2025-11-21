#!/usr/bin/env python
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

# First, login to get token
print("1. Obteniendo token...")
login_response = requests.post(
    f"{BASE_URL}/api/token/",
    json={"username": "admin", "password": "admin123"},
    headers={"Content-Type": "application/json"}
)

if login_response.status_code != 200:
    print(f"✗ Error al obtener token: {login_response.status_code}")
    print(login_response.text)
    exit(1)

token = login_response.json()['access']
print(f"✓ Token obtenido: {token[:50]}...")

# Now test the pedidos endpoint
print("\n2. Obteniendo pedidos de servicio...")
headers = {"Authorization": f"Bearer {token}"}
pedidos_response = requests.get(
    f"{BASE_URL}/api/v1/pedidos-servicio/",
    headers=headers
)

print(f"Status: {pedidos_response.status_code}")
if pedidos_response.status_code == 200:
    pedidos = pedidos_response.json()
    print(f"✓ Respuesta recibida: {len(pedidos)} pedidos")
    print(json.dumps(pedidos, indent=2, ensure_ascii=False))
else:
    print(f"✗ Error: {pedidos_response.text}")
