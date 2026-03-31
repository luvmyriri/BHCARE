import psycopg2
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
cur = conn.cursor()

# Find the FK constraint name on soap_notes.doctor_id
cur.execute("""
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'soap_notes'::regclass 
    AND contype = 'f'
    AND conname LIKE '%doctor%'
""")
rows = cur.fetchall()
print("FK constraints on doctor_id:", rows)

for row in rows:
    constraint_name = row[0]
    print(f"Dropping constraint: {constraint_name}")
    cur.execute(f"ALTER TABLE soap_notes DROP CONSTRAINT IF EXISTS {constraint_name}")

conn.commit()
cur.close()
conn.close()
print("Done - FK constraint on doctor_id dropped")
