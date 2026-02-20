
import psycopg2
from flask_bcrypt import Bcrypt
from app import app, get_db

bcrypt = Bcrypt(app)

def reset_password(email, new_password):
    print(f"Resetting password for {email} to {new_password}...")
    try:
        with app.app_context():
            conn = get_db()
            cur = conn.cursor()
            
            # 1. Hashing
            pw_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
            
            # 2. Update
            cur.execute("UPDATE users SET password_hash = %s WHERE email = %s", (pw_hash, email))
            conn.commit()
            
            if cur.rowcount > 0:
                print("✅ Password updated successfully.")
            else:
                print("❌ User not found.")
                
            cur.close()
            conn.close()
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    reset_password("genetabios13@gmail.com", "password123")
