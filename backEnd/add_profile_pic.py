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
    
    # Check if column exists first to be safe
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_picture'")
    if cur.fetchone():
        print("Column profile_picture already exists")
    else:
        cur.execute("ALTER TABLE users ADD COLUMN profile_picture TEXT")
        conn.commit()
        print("Column profile_picture added successfully")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
