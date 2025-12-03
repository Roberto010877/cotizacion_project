#!/bin/env powershell

# Script para limpiar procesos Python y base de datos bloqueada

Write-Host "🛑 Deteniendo procesos Python..." -ForegroundColor Yellow

# Detener todos los procesos manage.py y python
Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq 'python' } | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

Write-Host "✅ Procesos detenidos" -ForegroundColor Green

# Cambiar al directorio backend
Set-Location "D:\Documentos\ProjectDJango\cotidomo_project\backend"

Write-Host "`n📊 Limpiando bloqueos de base de datos..." -ForegroundColor Yellow

# Ejecutar el script de limpieza
& python clear_db_locks.py

Write-Host "`n✅ Base de datos limpiada" -ForegroundColor Green

Write-Host "`n🚀 Iniciando servidor Django..." -ForegroundColor Cyan
& python manage.py runserver
