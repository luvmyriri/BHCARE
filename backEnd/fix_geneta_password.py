
from database import get_db_connection
from flask_bcrypt import Bcrypt
from flask import Flask

app = Flask(__name__)
bcrypt = Bcrypt(app)

def reset_password():
    email = "genetabios13@gmail.com"
    new_password = "tempPC123!"
    
    print(f"Resetting password for {email} to {new_password}")
    
    hashed = bcrypt.generate_password_hash(new_password).decode('utf-8')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("UPDATE users SET password_hash = %s WHERE LOWER(email) = LOWER(%s)", (hashed, email))
    conn.commit()
    
    if cur.rowcount > 0:
        print("✅ Password updated successfully.")
    else:
        print("❌ User not found.")
        
    cur.close()
    conn.close()

if __name__ == "__main__":
    reset_password()
