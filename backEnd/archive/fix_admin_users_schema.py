from database import get_db_connection

def fix_schema():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        print("Adding is_active column to admin_users...")
        cursor.execute("ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;")
        conn.commit()
        print("✅ Column added successfully.")
        conn.close()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    fix_schema()
