
from database import get_db_connection

def check_user():
    conn = get_db_connection()
    cur = conn.cursor()
    
    email = "genetabios13@gmail.com"
    cur.execute("SELECT id, email, password_hash FROM users WHERE LOWER(email) = LOWER(%s)", (email,))
    user = cur.fetchone()
    
    if user:
        print(f"User FOUND: {user[0]} | {user[1]}")
        print(f"Hash: {user[2]}")
    else:
        print("User NOT FOUND")
        
    conn.close()

if __name__ == "__main__":
    check_user()
