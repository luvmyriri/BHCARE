import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST', '127.0.0.1'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'bhcare'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD')
    )
    cur = conn.cursor()
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'")
    columns = [row[0] for row in cur.fetchall()]
    with open('columns.txt', 'w') as f:
        f.write("\n".join(columns))
    print("Columns written to columns.txt")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
