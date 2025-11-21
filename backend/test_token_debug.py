#!/usr/bin/env python
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cotidomo_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.test.client import Client
import socket

# Get local IP
hostname = socket.gethostname()
local_ip = socket.gethostbyname(hostname)
print(f"Hostname: {hostname}, Local IP: {local_ip}")

# Test with different URLs
client = Client()
response = client.post('/api/token/', 
    data=json.dumps({'username': 'admin', 'password': 'admin123'}),
    content_type='application/json'
)
print(f"Django Test Client - Status: {response.status_code}")
if response.status_code == 200:
    data = json.loads(response.content.decode())
    print(f"✓ Token generation works!")
    print(f"  Access: {data.get('access', '')[:40]}...")
else:
    print(f"✗ Failed: {response.content.decode()}")
