# Script para desarrollo rápido del proyecto Cotidomo (Windows)
# Usa el entorno global: C:\Users\Roberto\Envs\cotidomo_env

$COTIDOMO_ENV = "C:\Users\Roberto\Envs\cotidomo_env"
$PYTHON = "$COTIDOMO_ENV\Scripts\python.exe"
$PROJECT_PATH = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Iniciando Cotidomo en modo rápido ===" -ForegroundColor Cyan
Write-Host "Entorno: $COTIDOMO_ENV" -ForegroundColor Gray
Write-Host ""

# Backend
Write-Host "[1/2] Iniciando Backend..." -ForegroundColor Yellow
Push-Location "$PROJECT_PATH\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$PYTHON' manage.py runserver 0.0.0.0:8000"
Write-Host "Backend iniciado en http://127.0.0.1:8000" -ForegroundColor Green
Pop-Location

# Frontend
Write-Host "[2/2] Iniciando Frontend..." -ForegroundColor Yellow
Push-Location "$PROJECT_PATH\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Write-Host "Frontend iniciado en http://localhost:5173" -ForegroundColor Green
Pop-Location

Write-Host ""
Write-Host "=== Proyecto Listo ===" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "API: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "Admin: http://127.0.0.1:8000/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C en cualquier ventana para detener" -ForegroundColor Yellow
