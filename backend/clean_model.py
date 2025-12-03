import re

# Leer el archivo
with open('pedidos_servicio/models.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Buscar y reemplazar los dos campos ForeignKey problemáticos
# Campo fabricador (líneas 63-71)
pattern1 = r'''    fabricador = models\.ForeignKey\(\s*Instalador,\s*on_delete=models\.SET_NULL,\s*null=True,\s*blank=True,\s*related_name='pedidos_como_fabricador',\s*verbose_name="Fabricador",\s*help_text="Instalador/técnico que fabrica el producto"\s*\)\s*'''

# Campo instalador (líneas 73-81)
pattern2 = r'''    instalador = models\.ForeignKey\(\s*Instalador,\s*on_delete=models\.SET_NULL,\s*null=True,\s*blank=True,\s*related_name='pedidos_como_instalador',\s*verbose_name="Instalador",\s*help_text="Instalador/técnico que instala el producto"\s*\)\s*'''

# Hacer los reemplazos
content = re.sub(pattern1, '', content, flags=re.DOTALL)
content = re.sub(pattern2, '', content, flags=re.DOTALL)

# Escribir de vuelta
with open('pedidos_servicio/models.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Campos fabricador e instalador eliminados")
