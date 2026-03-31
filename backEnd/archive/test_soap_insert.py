import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    port=os.getenv('DB_PORT', '5432'),
    database=os.getenv('DB_NAME', 'bhcare'),
    user=os.getenv('DB_USER', 'postgres'),
    password=os.getenv('DB_PASSWORD')
)
cur = conn.cursor(cursor_factory=RealDictCursor)

# Try inserting a test note with doctor_id from users table
try:
    cur.execute("""
        INSERT INTO soap_notes (patient_id, doctor_id, subjective, objective, assessment, plan)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id, doctor_id
    """, (2, 9, 'test subjective', 'test objective', 'test assessment', 'test plan'))
    row = cur.fetchone()
    print("SUCCESS - Inserted with doctor_id from users:", dict(row))
    conn.rollback()  # Don't actually save the test
except Exception as e:
    print("FAILED:", e)
    conn.rollback()

cur.close()
conn.close()
