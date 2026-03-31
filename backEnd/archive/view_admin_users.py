from database import get_db_connection

def view_admin_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT count(*) FROM admin_users")
        count = cursor.fetchone()[0]
        print(f"Admin Users Count: {count}")
        
        cursor.execute("SELECT id, username, email FROM admin_users")
        users = cursor.fetchall()
        print("Admin Users Data:")
        for u in users:
            print(u)
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    view_admin_users()
