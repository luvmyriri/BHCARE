import sys
sys.path.append('c:/xampp/htdocs/BHCARE/backend')
from database import get_db_connection

conn = get_db_connection()
cur = conn.cursor()
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='appointments'")
cols = [r[0] for r in cur.fetchall()]
print(cols)
cur.close()
conn.close()
