import psycopg2
import psycopg2.extras
from flask_bcrypt import Bcrypt
from flask import Flask
from database import get_db_connection

app = Flask(__name__)
bcrypt = Bcrypt(app)

def check_superadmin_password():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT email, password_hash, role FROM users WHERE email='superadmin@bhcare.com'")
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if not user:
        print("Super admin not found.")
        return
        
    email, hash_val, role = user
    print(f"User: {email}")
    print(f"Role: {role}")
    print(f"Hash: {hash_val}")
    
    test_pw = "admin123"
    result = bcrypt.check_password_hash(hash_val, test_pw)
    print(f"Password '{test_pw}' matches hash? {result}")

if __name__ == "__main__":
    check_superadmin_password()
