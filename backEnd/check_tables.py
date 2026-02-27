import database
conn = database.get_db_connection()
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
tables = cur.fetchall()
print([t[0] for t in tables])
cur.close()
conn.close()
