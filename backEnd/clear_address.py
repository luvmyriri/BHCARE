import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST', '127.0.0.1'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'bhcare'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD')
    )
    cur = conn.cursor()
    
    # Update fields to empty string
    cur.execute("""
        UPDATE users 
        SET house_number = '', 
            block_number = '', 
            lot_number = '', 
            street_name = '', 
            subdivision = '',
            zip_code = ''
        WHERE id = 1
    """)
    conn.commit()
    print(f"Address fields cleared for user 1. Rows affected: {cur.rowcount}")
    
    # Verify
    cur.execute("""
        SELECT house_number, street_name FROM users WHERE id = 1
    """)
    row = cur.fetchone()
    print(f"Current values: {row}")
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")
