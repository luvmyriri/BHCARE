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
    
    # Get all column names from users table
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users'
    """)
    columns = cur.fetchall()
    print("Current columns in users table:")
    for col in columns:
        print(f"- {col[0]} ({col[1]})")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
