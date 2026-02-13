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
    
    # Check before
    cur.execute("SELECT first_name FROM users WHERE id = 1")
    print(f"Before: {cur.fetchone()[0]}")
    
    # Update
    cur.execute("UPDATE users SET first_name = 'Marc Alexis' WHERE id = 1")
    print(f"Rows updated: {cur.rowcount}")
    
    conn.commit()
    
    # Check after
    cur.execute("SELECT first_name FROM users WHERE id = 1")
    print(f"After: {cur.fetchone()[0]}")
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")
