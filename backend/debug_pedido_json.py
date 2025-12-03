import requests
import json

# Obtener token
response = requests.post(
    'http://127.0.0.1:8000/api/token/',
    data={'username': 'admin', 'password': 'admin123'}
)

if response.status_code != 200:
    print(f"Error: {response.status_code}")
    exit(1)

token = response.json()['access']
headers = {'Authorization': f'Bearer {token}'}

# Obtener el pedido PED-0000001
response = requests.get(
    'http://127.0.0.1:8000/api/v1/pedidos-servicio/?numero_pedido=PED-0000001',
    headers=headers
)

if response.status_code == 200:
    data = response.json()
    if data.get('results'):
        pedido = data['results'][0]
        print("✅ Pedido PED-0000001 completo:")
        print(json.dumps(pedido, indent=2))
    else:
        print("❌ No hay resultados")
else:
    print(f"Error: {response.status_code}")
    print(response.text)

# También intentar acceder por ID si conocemos el ID
response = requests.get(
    'http://127.0.0.1:8000/api/v1/pedidos-servicio/1/',
    headers=headers
)

if response.status_code == 200:
    print("\n✅ Pedido con ID=1 completo:")
    print(json.dumps(response.json(), indent=2))
else:
    print(f"No hay pedido con ID=1: {response.status_code}")
