#!/usr/bin/env python
import requests
import json
from datetime import date, timedelta

BASE_URL = "http://127.0.0.1:8000"

# Primero, obtener token
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
print(f"✓ Token obtenido")

# Ahora crear un pedido
print("\n2. Creando pedido de servicio...")
headers = {"Authorization": f"Bearer {token}"}
pedido_data = {
    "cliente": 13,  # ID del cliente "Test"
    "descripcion": "Instalación de sistema de climatización en salón principal",
    "estado": "PENDIENTE",
    "fecha_inicio": str(date.today()),
    "fecha_fin": str(date.today() + timedelta(days=7)),
    "valor_total": 5000000,
    "observaciones": "Cliente requiere instalación urgente"
}

print(f"Datos enviados: {json.dumps(pedido_data, ensure_ascii=False, indent=2)}")

create_response = requests.post(
    f"{BASE_URL}/api/v1/pedidos-servicio/",
    json=pedido_data,
    headers=headers
)

print(f"Status: {create_response.status_code}")
print(f"Respuesta: {json.dumps(create_response.json(), ensure_ascii=False, indent=2)}")
