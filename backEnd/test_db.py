
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'bhcare'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD')
    )
    print("Connection successful!")
    
    cursor = conn.cursor()
    cursor.execute("SELECT to_regclass('public.users');")
    table_exists = cursor.fetchone()[0]
    
    if table_exists:
        print("Table 'users' exists.")
        cursor.execute("SELECT count(*) FROM users;")
        count = cursor.fetchone()[0]
        print(f"Number of users: {count}")
    else:
        print("Table 'users' does not exist.")
        
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Connection failed: {e}")
