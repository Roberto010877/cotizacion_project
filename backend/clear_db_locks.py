#!/usr/bin/env python
"""
Script para limpiar bloqueos de SQLite y reiniciar las conexiones
"""
import os
import sqlite3
import sys
from pathlib import Path

# Obtener ruta a la BD
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'db.sqlite3'

print(f"📊 Base de datos: {DB_PATH}")
print(f"✓ Existe: {DB_PATH.exists()}")

try:
    # Conectar a la BD
    conn = sqlite3.connect(str(DB_PATH), timeout=2)
    conn.isolation_level = None  # Autocommit
    
    cursor = conn.cursor()
    
    # Verificar integridad de la BD
    print("\n🔍 Verificando integridad de la base de datos...")
    result = cursor.execute('PRAGMA integrity_check').fetchall()
    if result[0][0] == 'ok':
        print("✅ Integridad de BD: OK")
    else:
        print(f"⚠️ Problemas encontrados: {result}")
    
    # Verificar y reconstruir índices si es necesario
    print("\n🔧 Analizando base de datos...")
    cursor.execute('ANALYZE')
    print("✅ Análisis completado")
    
    # Vacuum para liberar espacio y limpiar bloqueos
    print("\n🧹 Limpiando base de datos...")
    cursor.execute('VACUUM')
    print("✅ Limpieza completada")
    
    conn.close()
    print("\n✅ Bloqueos de BD limpiados exitosamente")
    sys.exit(0)
    
except sqlite3.OperationalError as e:
    print(f"\n❌ Error de operación: {e}")
    print("   La BD podría estar siendo usada por otro proceso")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Error: {e}")
    sys.exit(1)
