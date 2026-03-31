import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv
import sys

# Force UTF-8 encoding for stdout/stderr just in case, though we removed emojis
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

load_dotenv()

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME', 'bhcare')

print(f"Attempting connection to: {DB_HOST}:{DB_PORT} as {DB_USER}")

exists = False

# 1. Try connecting to default 'postgres' database
try:
    print("\n1. Connecting to default 'postgres' database...")
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        dbname='postgres'
    )
    print("SUCCESS: Connected to 'postgres' database successfully!")
    
    # 2. Check if 'bhcare' database exists
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
    result = cur.fetchone()
    if result:
        exists = True
        print(f"SUCCESS: Database '{DB_NAME}' already exists.")
    else:
        print(f"FAIL: Database '{DB_NAME}' does not exist.")
        print(f"Attempting to create database '{DB_NAME}'...")
        try:
            cur.execute(sql.SQL("CREATE DATABASE {}").format(
                sql.Identifier(DB_NAME)
            ))
            print(f"SUCCESS: Database '{DB_NAME}' created successfully!")
            exists = True
        except Exception as e:
            print(f"FAIL: Failed to create database: {e}")
    
    cur.close()
    conn.close()

except Exception as e:
    print(f"FAIL: Failed to connect to 'postgres' database: {e}")
    print("Check your DB_PASSWORD in .env")

# 3. Try connecting to target database
if exists:
    try:
        print(f"\n3. Connecting to '{DB_NAME}' database...")
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname=DB_NAME
        )
        print(f"SUCCESS: Connected to '{DB_NAME}' database successfully!")
        conn.close()
    except Exception as e:
        print(f"FAIL: Failed to connect to '{DB_NAME}' database: {e}")
else:
    print(f"\nSkipping connection to '{DB_NAME}' because it was not found or created.")
