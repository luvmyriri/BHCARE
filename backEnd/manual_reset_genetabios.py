
from database import get_db_connection
from flask_bcrypt import Bcrypt
from flask import Flask

app = Flask(__name__)
bcrypt = Bcrypt(app)

def manual_reset():
    email = "genetabios13@gmail.com"
    new_password = "tempPC123!"
    hashed = bcrypt.generate_password_hash(new_password).decode('utf-8')
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE users SET password_hash = %s WHERE LOWER(email) = LOWER(%s)", (hashed, email))
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"Password for {email} manually reset to: {new_password}")

if __name__ == "__main__":
    try:
        manual_reset()
    except Exception as e:
        print(f"Error: {e}")
