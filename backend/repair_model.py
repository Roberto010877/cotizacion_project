#!/usr/bin/env python
# Script para reparar la indentación del campo instalador

with open('pedidos_servicio/models.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Encontrar y reparar la línea 63 (índice 62)
# Debe estar indentada con 4 espacios
if len(lines) > 62 and 'instalador = models.ForeignKey' in lines[62]:
    # Agregar indentación correcta
    if not lines[62].startswith('    '):
        lines[62] = '    ' + lines[62]
        print(f"✓ Reparada indentación de línea 63: {lines[62][:50]}...")

# Escribir de vuelta
with open('pedidos_servicio/models.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✓ Archivo reparado")
