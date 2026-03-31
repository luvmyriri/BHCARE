import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def create_table():
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'bhcare'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD')
        )
        cur = conn.cursor()
        
        print("Creating medical_staff_details table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS medical_staff_details (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                prc_license_number VARCHAR(50),
                specialization VARCHAR(100),
                schedule VARCHAR(100),
                clinic_room VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        conn.commit()
        print("✅ Table medical_staff_details created successfully.")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error creating table: {e}")

if __name__ == "__main__":
    create_table()
