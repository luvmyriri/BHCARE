"""
Simple script to view all users in the database
"""
from database import get_db_connection

def view_all_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get all users
    cursor.execute("""
        SELECT id, email, first_name, last_name, 
               date_of_birth, gender, city, created_at
        FROM users
        ORDER BY created_at DESC
    """)
    
    users = cursor.fetchall()
    
    print("=" * 80)
    print(f"📊 Total Users: {len(users)}")
    print("=" * 80)
    
    if users:
        print("\n{:<5} {:<25} {:<15} {:<15} {:<12} {:<10}".format(
            "ID", "Email", "First Name", "Last Name", "Gender", "City"
        ))
        print("-" * 80)
        
        for user in users:
            user_id, email, first_name, last_name, dob, gender, city, created = user
            print("{:<5} {:<25} {:<15} {:<15} {:<12} {:<10}".format(
                user_id, 
                email[:24] if email else "", 
                first_name[:14] if first_name else "",
                last_name[:14] if last_name else "",
                gender[:11] if gender else "",
                city[:9] if city else ""
            ))
    else:
        print("\n⚠️  No users in database yet!")
        print("💡 Register a user from your frontend to see data here.")
    
    print("=" * 80)
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    try:
        view_all_users()
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Make sure PostgreSQL is running and database exists.")
