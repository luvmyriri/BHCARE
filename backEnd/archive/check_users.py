import psycopg2
import psycopg2.extras
import os
from dotenv import load_dotenv
import json
from datetime import datetime

class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)

load_dotenv()

try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'bhcare'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD')
    )
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    print("Checking last 5 registered users:")
    cur.execute("SELECT id, email, first_name, last_name, created_at FROM users ORDER BY id DESC LIMIT 5")
    rows = cur.fetchall()
    
    with open('users_list.txt', 'w') as f:
        f.write("Recent Users:\n")
        for user in rows:
            f.write(f"ID: {user['id']} | Email: {user['email']} | Name: {user['first_name']} {user['last_name']}\n")
    print("Users saved to users_list.txt")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
