import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'BHCare_DB'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'admin')
    )
    cur = conn.cursor()
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='users'")
    cols = [r[0] for r in cur.fetchall()]
    print('USER COLS:', cols)
    if 'status' not in cols:
        print('ADDING STATUS COLUMN...')
        cur.execute("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'Active'")
        conn.commit()
        print('STATUS COLUMN ADDED.')
    cur.close()
    conn.close()
except Exception as e:
    print('ERROR:', e)
