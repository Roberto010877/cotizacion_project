#!/bin/bash

# Script para desarrollo rápido del proyecto Cotidomo

echo "=== Iniciando Cotidomo en modo rápido ==="

# 1. Backend
echo "[1/3] Iniciando Backend..."
cd backend
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
echo "Backend iniciado (PID: $BACKEND_PID)"

# 2. Frontend  
echo "[2/3] Iniciando Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend iniciado (PID: $FRONTEND_PID)"

echo "[3/3] Proyecto listo!"
echo "URL: http://localhost:5173"
echo "API: http://127.0.0.1:8000"
echo ""
echo "Para detener: presiona Ctrl+C"

# Mantener el script corriendo
wait
