import psycopg2
import sys
from database import get_db_connection

def add_prescription_column():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Add column if not exists
        cursor.execute("""
            ALTER TABLE soap_notes 
            ADD COLUMN IF NOT EXISTS prescription JSONB;
        """)
        
        conn.commit()
        print("Successfully added prescription column to soap_notes table.")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    add_prescription_column()
