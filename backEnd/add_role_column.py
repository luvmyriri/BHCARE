import psycopg2
from database import get_db_connection

def add_role_column():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        print("Checking for 'role' column...")
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='role';
        """)
        
        if cur.fetchone():
            print("✅ 'role' column already exists.")
        else:
            print("Creating 'role' column...")
            cur.execute("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'Patient';")
            
            # Update existing users based on logic
            print("Backfilling roles based on existing logic...")
            
            # Admin
            cur.execute("UPDATE users SET role = 'Administrator' WHERE LOWER(email) LIKE '%admin%'")
            
            # Doctors
            cur.execute("UPDATE users SET role = 'Medical Staff' WHERE LOWER(first_name) LIKE '%dr.%' OR LOWER(last_name) LIKE '%dr.%'")
            
            conn.commit()
            print("✅ 'role' column added and backfilled.")
            
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    add_role_column()
