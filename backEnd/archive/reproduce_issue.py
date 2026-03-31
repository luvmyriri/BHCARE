import requests
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'bhcare'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD')
    )

def test_notification():
    # 1. Get a user
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users LIMIT 1")
    user = cur.fetchone()
    if not user: return
    user_id = user[0]
    conn.close()

    # 2. Create SOAP note
    url = 'http://localhost:5000/api/soap-notes'
    data = {
        'patient_id': user_id,
        'subjective': 'Test New',
        'objective': 'Test New',
        'assessment': 'Test New',
        'plan': 'Test New'
    }
    
    try:
        requests.post(url, json=data)
    except: pass

    # 3. Check latest notification
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, type, is_read, created_at FROM notifications WHERE user_id = %s ORDER BY created_at DESC LIMIT 1", (user_id,))
    row = cur.fetchone()
    print(f"Latest Notification: ID={row[0]}, Type={row[1]}, IsRead={row[2]}")
    conn.close()

if __name__ == "__main__":
    test_notification()
