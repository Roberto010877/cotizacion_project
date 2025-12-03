import re
with open('pedidos_servicio/models.py') as f:
    lines = f.readlines()
    for i, line in enumerate(lines, 1):
        if re.search(r'\bfabricador\b|\binstalador\b', line, re.IGNORECASE):
            print(f'{i}: {line.rstrip()}')
