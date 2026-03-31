import psycopg2
import sys
import os
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv()

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD') or ""
DB_NAME = os.getenv('DB_NAME', 'bhcare')

print(f"Connecting to {DB_NAME}...")
try:
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        dbname=DB_NAME
    )
    cur = conn.cursor()
    
    # List tables
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    tables = cur.fetchall()
    print("\nTables found:")
    for t in tables:
        print(f"- {t[0]}")
    
    # Check column count in users to verify our changes
    if any(t[0] == 'users' for t in tables):
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'users';")
        cols = cur.fetchall()
        print(f"\nUsers table columns ({len(cols)}):")
        # print([c[0] for c in cols]) # Optional
        
    conn.close()
    print("\nVerification Complete! ✅")
except Exception as e:
    print(f"\nFAIL: {e}")
