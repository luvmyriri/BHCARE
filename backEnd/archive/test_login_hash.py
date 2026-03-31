from flask import Flask
from flask_bcrypt import Bcrypt
from database import get_db_connection

app = Flask(__name__)
bcrypt = Bcrypt(app)

conn = get_db_connection()
cur = conn.cursor()
cur.execute("SELECT id, email, password_hash FROM users WHERE LOWER(email) = LOWER('genetabios13@gmail.com')")
row = cur.fetchone()

if row:
    user_id, email, stored_hash = row
    print("User found: ID=%d, Email=%s" % (user_id, email))
    print("Stored hash: %s" % stored_hash)
    print("")
    
    test_passwords = ['BHCare2026!', 'tempPC123!', 'bhcare123']
    for pw in test_passwords:
        try:
            result = bcrypt.check_password_hash(stored_hash, pw)
            status = "MATCH" if result else "FAIL"
            print("  [%s] password: %s" % (status, pw))
        except Exception as e:
            print("  [ERROR] password: %s -> %s" % (pw, str(e)))
else:
    print("User NOT FOUND in database!")

cur.close()
conn.close()
