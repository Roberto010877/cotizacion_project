#!/usr/bin/env python
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.test.client import Client

client = Client()
response = client.post('/api/token/', 
    data=json.dumps({'username': 'admin', 'password': 'admin123'}),
    content_type='application/json'
)
print(f"Status Code: {response.status_code}")
content = response.content.decode()
print(f"Response: {content}")
if response.status_code == 200:
    data = json.loads(content)
    print(f"\nAccess Token: {data.get('access', '')[:50]}...")
    print(f"Refresh Token: {data.get('refresh', '')[:50]}...")
