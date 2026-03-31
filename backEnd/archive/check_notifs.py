import database
conn = database.get_db_connection()
cur = conn.cursor()
cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications'")
print(cur.fetchall())
cur.close()
conn.close()
