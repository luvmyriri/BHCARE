import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(host=os.getenv('DB_HOST'), port=os.getenv('DB_PORT'),
    database=os.getenv('DB_NAME'), user=os.getenv('DB_USER'), password=os.getenv('DB_PASSWORD'))
cur = conn.cursor(cursor_factory=RealDictCursor)

log = open('soap_check2.log', 'w', encoding='utf-8')

# Most recent soap note
cur.execute("SELECT id, patient_id, doctor_id, created_at FROM soap_notes ORDER BY created_at DESC LIMIT 3")
log.write("=== Latest SOAP notes ===\n")
for r in cur.fetchall(): log.write(str(dict(r)) + "\n")

# Users with doctor/medical role
cur.execute("SELECT id, email, first_name, last_name FROM users WHERE email LIKE '%doctor%' OR email LIKE '%medical%' OR email LIKE '%bhcare%'")
log.write("\n=== Doctor-like users ===\n")
for r in cur.fetchall(): log.write(str(dict(r)) + "\n")

# All users (just email + id)
cur.execute("SELECT id, email, first_name, last_name FROM users ORDER BY id")
log.write("\n=== All users ===\n")
for r in cur.fetchall(): log.write(str(dict(r)) + "\n")

conn.close()
log.close()
print("Done")
