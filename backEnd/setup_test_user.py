
from database import get_db_connection
from flask_bcrypt import Bcrypt
from flask import Flask

app = Flask(__name__)
bcrypt = Bcrypt(app)

def setup():
    conn = get_db_connection()
    cur = conn.cursor()
    
    email = "TestCase@Example.com"
    password = "password123"
    hashed = bcrypt.generate_password_hash(password).decode('utf-8')
    
    # Check if exists and delete
    cur.execute("DELETE FROM users WHERE email = %s", (email,))
    
    # Insert
    cur.execute("""
        INSERT INTO users (email, password_hash, first_name, last_name, date_of_birth, gender, contact_number, barangay, city, province)
        VALUES (%s, %s, 'Test', 'Case', '1990-01-01', 'Male', '09123456789', 'Test Brgy', 'Test City', 'Test Prov')
    """, (email, hashed))
    
    conn.commit()
    cur.close()
    conn.close()
    print("Test user created: TestCase@Example.com / password123")

if __name__ == "__main__":
    setup()
