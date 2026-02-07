import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'bhcare'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD')
    )
    return conn


def init_db():
    """Initialize database tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            middle_name VARCHAR(100),
            last_name VARCHAR(100) NOT NULL,
            date_of_birth DATE NOT NULL,
            gender VARCHAR(20) NOT NULL,
            contact_number VARCHAR(20) NOT NULL,
            barangay VARCHAR(100) NOT NULL,
            city VARCHAR(100) NOT NULL,
            province VARCHAR(100) NOT NULL,
            house_number VARCHAR(50),
            block_number VARCHAR(50),
            lot_number VARCHAR(50),
            street_name VARCHAR(100),
            subdivision VARCHAR(100),
            zip_code VARCHAR(10),
            full_address TEXT,
            id_image_path VARCHAR(255),
            id_image BYTEA,
            ocr_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Ensure all columns exist for existing tables
    columns_to_add = [
        ('house_number', 'VARCHAR(50)'),
        ('block_number', 'VARCHAR(50)'),
        ('lot_number', 'VARCHAR(50)'),
        ('street_name', 'VARCHAR(100)'),
        ('subdivision', 'VARCHAR(100)'),
        ('zip_code', 'VARCHAR(10)'),
        ('full_address', 'TEXT'),
        ('id_image', 'BYTEA')
    ]
    
    for col_name, col_type in columns_to_add:
        cursor.execute(f'ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type};')
    
    conn.commit()
    cursor.close()
    conn.close()
    print("Database tables created successfully!")

if __name__ == '__main__':
    init_db()
