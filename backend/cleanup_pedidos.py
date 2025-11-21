import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()
cursor.execute('SELECT name FROM sqlite_master WHERE type="table" AND name LIKE "pedidos_servicio_%"')
tables = cursor.fetchall()
for (table_name,) in tables:
    print(f'Dropping {table_name}')
    cursor.execute(f'DROP TABLE IF EXISTS {table_name}')
conn.commit()
conn.close()
print('✓ Todas las tablas eliminadas')
