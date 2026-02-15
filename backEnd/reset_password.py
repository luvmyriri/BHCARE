
import bcrypt
from database import get_db_connection

def reset_security_password():
    email = "security1741@bhcare.ph"
    password = "bhcare174"
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if user exists first
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        
        if user:
            print(f"🔄 Updating password for existing user: {email}")
            cur.execute("UPDATE users SET password_hash = %s WHERE email = %s", (hashed, email))
        else:
            print(f"➕ Creating new user: {email}")
            first_name = "Security"
            last_name = "Department"
            dob = "1990-01-01"
            gender = "N/A"
            contact = "+639000000000"
            barangay = "174"
            city = "Caloocan"
            province = "Metro Manila"
            
            cur.execute("""
                INSERT INTO users (email, password_hash, first_name, last_name, date_of_birth, gender, contact_number, barangay, city, province)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (email, hashed, first_name, last_name, dob, gender, contact, barangay, city, province))
            
        conn.commit()
        print(f"✅ Password for {email} reset successfully to '{password}'")
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error resetting password: {e}")

if __name__ == "__main__":
    reset_security_password()
