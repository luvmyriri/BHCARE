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


# NOTE: Table creation is now handled by Alembic migrations
# Run: python -m alembic upgrade head
# See MIGRATIONS.md for more information

if __name__ == '__main__':
    # Test database connection
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT version();')
        db_version = cursor.fetchone()
        print(f"✅ Database connection successful!")
        print(f"PostgreSQL version: {db_version[0]}")
        cursor.close()
        conn.close()
        print("\n💡 To create/update tables, run: python -m alembic upgrade head")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

