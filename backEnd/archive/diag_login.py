import sys

# Write to a log file directly to avoid terminal encoding issues
log = open('login_diag.log', 'w', encoding='utf-8')

def w(msg):
    log.write(msg + '\n')
    log.flush()

from flask import Flask
from flask_bcrypt import Bcrypt
from database import get_db_connection
import bcrypt as raw_bcrypt

app = Flask(__name__)
flask_bcrypt = Bcrypt(app)

conn = get_db_connection()
cur = conn.cursor()
cur.execute("SELECT id, email, password_hash FROM users WHERE LOWER(email) = LOWER('genetabios13@gmail.com')")
row = cur.fetchone()
cur.close()
conn.close()

if not row:
    w("User NOT FOUND!")
else:
    user_id, email, stored_hash = row
    w("User ID: " + str(user_id))
    w("Email: " + str(email))
    w("Hash: " + str(stored_hash))
    w("Hash type: " + str(type(stored_hash)))
    w("Hash len: " + str(len(stored_hash)))
    w("")

    # Generate fresh hash
    test_pw = "BHCare2026!"
    fresh_hash = flask_bcrypt.generate_password_hash(test_pw).decode('utf-8')
    w("Fresh hash: " + fresh_hash)
    w("Fresh verify: " + str(flask_bcrypt.check_password_hash(fresh_hash, test_pw)))
    w("")

    # flask_bcrypt tests
    w("--- flask_bcrypt check ---")
    for pw in ["BHCare2026!", "tempPC123!", "bhcare123"]:
        try:
            result = flask_bcrypt.check_password_hash(stored_hash, pw)
            w("  [" + ("MATCH" if result else "FAIL") + "] " + pw)
        except Exception as ex:
            w("  [ERROR] " + pw + " => " + str(ex))

    # raw bcrypt tests
    w("")
    w("--- raw bcrypt check ---")
    hash_bytes = stored_hash.encode('utf-8') if isinstance(stored_hash, str) else stored_hash
    for pw in ["BHCare2026!", "tempPC123!", "bhcare123"]:
        try:
            result = raw_bcrypt.checkpw(pw.encode('utf-8'), hash_bytes)
            w("  [" + ("MATCH" if result else "FAIL") + "] " + pw)
        except Exception as ex:
            w("  [ERROR] " + pw + " => " + str(ex))

log.close()
print("Done - check login_diag.log")
