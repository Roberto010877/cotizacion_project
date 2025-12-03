#!/usr/bin/env python
# Agregar el campo fabricador

with open('pedidos_servicio/models.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Buscar donde está "    instalador = models.ForeignKey" (la que recién arreglamos)
# E insertar fabricador ANTES
fabricador_field = '''    fabricador = models.ForeignKey(
        Instalador,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pedidos_como_fabricador',
        verbose_name="Fabricador",
        help_text="Instalador/técnico que fabrica el producto"
    )

'''

# Buscar la línea de instalador y insertar fabricador antes
if '    instalador = models.ForeignKey(' in content and 'fabricador' not in content:
    content = content.replace(
        '    instalador = models.ForeignKey(',
        fabricador_field + '    instalador = models.ForeignKey('
    )
    print("✓ Campo fabricador agregado")
else:
    print("✗ No se pudo agregar fabricador (ya existe o no se encontró instalador)")

with open('pedidos_servicio/models.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Archivo actualizado")
