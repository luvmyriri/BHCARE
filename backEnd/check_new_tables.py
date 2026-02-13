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
    
    tables = ['soap_notes', 'notifications']
    for table in tables:
        print(f"\nChecking table: {table}")
        cur.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}'")
        columns = [row[0] for row in cur.fetchall()]
        for col in columns:
            print(f"  - {col}")
            
    conn.close()
except Exception as e:
    print(f"Error: {e}")
