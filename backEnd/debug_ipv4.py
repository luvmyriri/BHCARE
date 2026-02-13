import psycopg2
import sys

# Force UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# Force IPv4
DB_HOST = '127.0.0.1'
DB_PORT = '5432'
DB_USER = 'postgres'
DB_PASSWORD = ''

print(f"Testing connection to {DB_HOST}:{DB_PORT} with empty password...")

try:
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        dbname='postgres',
        connect_timeout=3
    )
    print("SUCCESS! ✅ Connected to 127.0.0.1")
    conn.close()
except Exception as e:
    print(f"FAIL: {e}")

# Test localhost again for comparison
print(f"\nTesting connection to localhost:{DB_PORT} with empty password...")
try:
    conn = psycopg2.connect(
        host='localhost',
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        dbname='postgres',
        connect_timeout=3
    )
    print("SUCCESS! ✅ Connected to localhost")
    conn.close()
except Exception as e:
    print(f"FAIL: {e}")
