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
    
    print("Checking last 5 notifications:")
    cur.execute("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5")
    rows = cur.fetchall()
    print(json.dumps(rows, indent=2, cls=DateTimeEncoder))
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
