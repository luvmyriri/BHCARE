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
    print("User NOT FOUND!")
else:
    user_id, email, stored_hash = row
    print("User ID:", user_id)
    print("Email:", email)
    print("Hash:", stored_hash)
    print("Hash type:", type(stored_hash))
    print("Hash len:", len(stored_hash))
    print("")

    # Generate a fresh hash to compare formats
    test_pw = "BHCare2026!"
    fresh_hash = flask_bcrypt.generate_password_hash(test_pw).decode('utf-8')
    print("Fresh hash for %s: %s" % (test_pw, fresh_hash))
    print("Fresh hash matches:", flask_bcrypt.check_password_hash(fresh_hash, test_pw))
    print("")

    # Try flask_bcrypt check
    print("--- flask_bcrypt check ---")
    for pw in ["BHCare2026!", "tempPC123!"]:
        try:
            result = flask_bcrypt.check_password_hash(stored_hash, pw)
            print("  flask_bcrypt [%s]: %s" % ("MATCH" if result else "FAIL", pw))
        except Exception as ex:
            print("  flask_bcrypt [ERROR]: %s => %s" % (pw, ex))

    # Try raw bcrypt check
    print("")
    print("--- raw bcrypt check ---")
    hash_bytes = stored_hash.encode('utf-8') if isinstance(stored_hash, str) else stored_hash
    for pw in ["BHCare2026!", "tempPC123!"]:
        try:
            result = raw_bcrypt.checkpw(pw.encode('utf-8'), hash_bytes)
            print("  raw [%s]: %s" % ("MATCH" if result else "FAIL", pw))
        except Exception as ex:
            print("  raw [ERROR]: %s => %s" % (pw, ex))
