from database import get_db_connection
import psycopg2.extras
import sys

try:
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    print("--- USERS TABLE ---")
    cursor.execute("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users';
    """)
    for row in cursor.fetchall():
        print(f"{row['column_name']} | {row['data_type']} | Nullable: {row['is_nullable']}")
        
    print("\n--- APPOINTMENTS TABLE ---")
    cursor.execute("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'appointments';
    """)
    for row in cursor.fetchall():
        print(f"{row['column_name']} | {row['data_type']} | Nullable: {row['is_nullable']}")
        
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
