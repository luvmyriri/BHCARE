
from database import get_db_connection

def cleanup():
    conn = get_db_connection()
    cur = conn.cursor()
    
    email = "TestCase@Example.com"
    
    cur.execute("DELETE FROM users WHERE email = %s", (email,))
    
    conn.commit()
    cur.close()
    conn.close()
    print(f"Test user {email} deleted.")

if __name__ == "__main__":
    cleanup()
