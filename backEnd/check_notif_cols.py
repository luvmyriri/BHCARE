import database
conn = database.get_db_connection()
cur = conn.cursor()
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications'")
cols = [r[0] for r in cur.fetchall()]
print("COLUMNS IN NOTIFICATIONS TABLE:")
for col in cols:
    print(f"- {col}")
cur.close()
conn.close()
