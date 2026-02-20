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

log = open('soap_doctor_check.log', 'w', encoding='utf-8')

# Check soap_notes doctor_id values
cur.execute("SELECT id, patient_id, doctor_id, created_at FROM soap_notes ORDER BY created_at DESC LIMIT 10")
notes = cur.fetchall()
log.write("=== SOAP NOTES ===\n")
for n in notes:
    log.write(str(dict(n)) + "\n")

# Check admin_users
cur.execute("SELECT id, username, role FROM admin_users")
admins = cur.fetchall()
log.write("\n=== ADMIN USERS ===\n")
for a in admins:
    log.write(str(dict(a)) + "\n")

# Try the actual query used by the API
cur.execute("""
    SELECT 
        sn.id, sn.doctor_id,
        CASE 
            WHEN au.id IS NOT NULL THEN 'Dr. ' || au.username
            WHEN u.id IS NOT NULL THEN 'Dr. ' || u.first_name || ' ' || u.last_name
            ELSE NULL
        END as doctor_name
    FROM soap_notes sn
    LEFT JOIN admin_users au ON sn.doctor_id = au.id
    LEFT JOIN users u ON sn.doctor_id = u.id AND au.id IS NULL
    ORDER BY sn.created_at DESC
    LIMIT 10
""")
rows = cur.fetchall()
log.write("\n=== DOCTOR NAME QUERY RESULT ===\n")
for r in rows:
    log.write(str(dict(r)) + "\n")

conn.close()
log.close()
print("Done - check soap_doctor_check.log")
