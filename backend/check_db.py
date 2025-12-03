import sqlite3

conn = sqlite3.connect('db.sqlite3')
c = conn.cursor()

# Listar columnas
c.execute("PRAGMA table_info(pedidos_servicio_pedidoservicio)")
print("Columnas en pedidos_servicio_pedidoservicio:")
for row in c.fetchall():
    print(f"  {row[1]} ({row[2]})")

conn.close()
