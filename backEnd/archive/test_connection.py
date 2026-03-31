"""
Quick PostgreSQL Connection Test
Run this to verify your database is set up correctly
"""
from database import get_db_connection
import sys

def test_connection():
    print("🔍 Testing PostgreSQL Connection...")
    print("-" * 50)
    
    try:
        # Test 1: Connect to database
        print("1️⃣ Connecting to database...")
        conn = get_db_connection()
        cursor = conn.cursor()
        print("   ✅ Connection successful!")
        
        # Test 2: Check if users table exists
        print("\n2️⃣ Checking if 'users' table exists...")
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        """)
        exists = cursor.fetchone()[0]
        
        if exists:
            print("   ✅ 'users' table exists!")
        else:
            print("   ❌ 'users' table does NOT exist!")
            print("   💡 Run: python database.py")
            cursor.close()
            conn.close()
            return False
        
        # Test 3: Count users
        print("\n3️⃣ Counting users in database...")
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]
        print(f"   📊 Total users: {count}")
        
        # Test 4: Check table structure
        print("\n4️⃣ Checking table structure...")
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        """)
        columns = cursor.fetchall()
        print(f"   📋 Table has {len(columns)} columns:")
        for col_name, col_type in columns:
            print(f"      - {col_name}: {col_type}")
        
        # Test 5: Sample query
        print("\n5️⃣ Testing sample query...")
        cursor.execute("SELECT email, first_name, last_name FROM users LIMIT 5")
        users = cursor.fetchall()
        if users:
            print(f"   📝 Sample users ({len(users)}):")
            for email, first, last in users:
                print(f"      - {first} {last} ({email})")
        else:
            print("   ℹ️  No users in database yet")
        
        cursor.close()
        conn.close()
        
        print("\n" + "=" * 50)
        print("✅ ALL TESTS PASSED!")
        print("=" * 50)
        print("\n💡 Your PostgreSQL database is ready to use!")
        print("   Start the backend: python app.py")
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("\n🔧 Troubleshooting:")
        print("   1. Make sure PostgreSQL is running")
        print("   2. Check your .env file has correct password")
        print("   3. Make sure 'bhcare' database exists")
        print("   4. Run: python database.py")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
