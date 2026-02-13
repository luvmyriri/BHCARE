import psycopg2
import os
from dotenv import load_dotenv
import sys

# Force UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

load_dotenv()

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD')

print(f"Loaded from .env:")
print(f"DB_PASSWORD type: {type(DB_PASSWORD)}")
print(f"DB_PASSWORD repr: {repr(DB_PASSWORD)}")

# Test 1: Using variable
print("\nTest 1: Connecting using variable...")
try:
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        dbname='postgres'
    )
    print("SUCCESS! ✅")
    conn.close()
except Exception as e:
    print(f"FAIL: {e}")

# Test 2: Hardcoded empty string
print("\nTest 2: Connecting using hardcoded empty string...")
try:
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password='',
        dbname='postgres'
    )
    print("SUCCESS! ✅")
    conn.close()
except Exception as e:
    print(f"FAIL: {e}")
