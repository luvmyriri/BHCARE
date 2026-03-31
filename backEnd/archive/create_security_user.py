import bcrypt
from database import get_db_connection

def create_security_user():
    email = "security1741@bhcare.ph"
    password = "bhcare174"
    first_name = "Security"
    last_name = "Department"
    dob = "1990-01-01"
    gender = "N/A"
    contact = "+639000000000"
    barangay = "174"
    city = "Caloocan"
    province = "Metro Manila"

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if exists
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            print("User already exists.")
            return

        cur.execute("""
            INSERT INTO users (email, password_hash, first_name, last_name, date_of_birth, gender, contact_number, barangay, city, province)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (email, hashed, first_name, last_name, dob, gender, contact, barangay, city, province))
        
        conn.commit()
        print(f"User {email} created successfully.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_security_user()
