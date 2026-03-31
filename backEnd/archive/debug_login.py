
from flask import Flask
from flask_bcrypt import Bcrypt
from database import get_db_connection

app = Flask(__name__)
bcrypt = Bcrypt(app)

def verify_login():
    email = "security1741@bhcare.ph"
    password = "bhcare174"
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT password_hash FROM users WHERE email = %s", (email,))
    result = cur.fetchone()
    conn.close()
    
    if not result:
        print(f"❌ User {email} not found in DB!")
        return
        
    db_hash = result[0]
    print(f"Stored Hash: {db_hash}")
    
    is_valid = bcrypt.check_password_hash(db_hash, password)
    
    if is_valid:
        print("✅ flask_bcrypt says: Password matches!")
    else:
        print("❌ flask_bcrypt says: Password DOES NOT match.")
        
        # Try generating a new hash with flask_bcrypt and see
        new_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        print(f"New flask_bcrypt hash would be: {new_hash}")
        
        # Update it?
        print("🔄 Attempting to update with flask_bcrypt hash...")
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE users SET password_hash = %s WHERE email = %s", (new_hash, email))
        conn.commit()
        conn.close()
        print("✅ Updated password hash using flask_bcrypt. Try logging in now.")

if __name__ == "__main__":
    verify_login()
