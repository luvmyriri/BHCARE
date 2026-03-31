import database
import datetime

conn = database.get_db_connection()
cur = conn.cursor()

try:
    # Check if table exists
    cur.execute("SELECT to_regclass('public.document_requests')")
    result = cur.fetchone()
    if result and result[0]:
        print("Table 'document_requests' already exists.")
    else:
        # Create table
        cur.execute("""
            CREATE TABLE document_requests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                document_type VARCHAR(100) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            )
        """)
        conn.commit()
        print("Table 'document_requests' created successfully.")
except Exception as e:
    print(f"Error creating table: {e}")
    conn.rollback()
finally:
    cur.close()
    conn.close()
