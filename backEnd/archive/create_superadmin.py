from database import get_db_connection
from flask_bcrypt import Bcrypt
from flask import Flask
from datetime import datetime

app = Flask(__name__)
bcrypt = Bcrypt(app)

def setup_superadmin():
    conn = get_db_connection()
    cur = conn.cursor()
    
    email = "superadmin@bhcare.com"
    password = "admin123"
    hashed = bcrypt.generate_password_hash(password).decode('utf-8')
    
    # Check if exists
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    existing = cur.fetchone()
    
    if existing:
        # Update existing
        cur.execute("""
            UPDATE users SET password_hash = %s, role = 'Super Admin' WHERE email = %s
        """, (hashed, email))
        print(f"Updated existing superadmin: {email} / {password}")
    else:
        # Insert
        try:
            # We must provide all absolutely required fields.
            cur.execute("""
                INSERT INTO users (email, password_hash, first_name, last_name, date_of_birth, gender, contact_number, barangay, city, province, role, status)
                VALUES (%s, %s, 'Super', 'Admin', '1980-01-01', 'Not Specified', '09999999999', 'System', 'System City', 'System Prov', 'Super Admin', 'Active')
            """, (email, hashed))
            print(f"Created new superadmin: {email} / {password}")
        except Exception as e:
            print(f"Error creating superadmin: {e}")
            conn.rollback()
            return
    
    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    setup_superadmin()
