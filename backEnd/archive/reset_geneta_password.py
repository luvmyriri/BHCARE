
from database import get_db_connection
from flask_bcrypt import Bcrypt
from flask import Flask

app = Flask(__name__)
bcrypt = Bcrypt(app)

def reset_password():
    email = "genetabios13@gmail.com"
    new_password = "BHCare2026!"  # New password for the user

    print(f"Resetting password for: {email}")
    print(f"New password: {new_password}")

    hashed = bcrypt.generate_password_hash(new_password).decode('utf-8')
    print(f"Generated hash: {hashed}")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "UPDATE users SET password_hash = %s WHERE LOWER(email) = LOWER(%s)",
        (hashed, email)
    )
    conn.commit()

    if cur.rowcount > 0:
        print(f"✅ Password updated successfully for {email}")
        print(f"   The user can now login with: {new_password}")
    else:
        print(f"❌ User not found: {email}")

    cur.close()
    conn.close()

    # Verify by re-reading
    conn2 = get_db_connection()
    cur2 = conn2.cursor()
    cur2.execute("SELECT password_hash FROM users WHERE LOWER(email) = LOWER(%s)", (email,))
    row = cur2.fetchone()
    if row:
        ok = bcrypt.check_password_hash(row[0], new_password)
        print(f"✅ Verification check: {'PASS' if ok else 'FAIL'}")
    cur2.close()
    conn2.close()

if __name__ == "__main__":
    reset_password()
