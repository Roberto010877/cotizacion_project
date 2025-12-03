import requests
import json

# Obtener token
response = requests.post(
    'http://127.0.0.1:8000/api/token/',
    data={'username': 'admin', 'password': 'admin123'}
)

if response.status_code != 200:
    print(f"Error: {response.status_code}")
    print(response.text)
    exit(1)

token = response.json()['access']

# Obtener un pedido
headers = {'Authorization': f'Bearer {token}'}
response = requests.get(
    'http://127.0.0.1:8000/api/v1/pedidos-servicio/?page_size=1',
    headers=headers
)

if response.status_code == 200:
    data = response.json()
    if data.get('results'):
        pedido = data['results'][0]
        print("✅ Campos devueltos en el pedido:")
        print(json.dumps({
            'numero_pedido': pedido.get('numero_pedido'),
            'fabricador_nombre': pedido.get('fabricador_nombre'),
            'fabricador_id': pedido.get('fabricador_id'),
            'instalador_nombre': pedido.get('instalador_nombre'),
            'instalador_id': pedido.get('instalador_id'),
        }, indent=2))
    else:
        print("❌ No hay pedidos")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
