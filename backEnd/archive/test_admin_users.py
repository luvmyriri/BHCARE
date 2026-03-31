import requests
import json
from pprint import pprint

BASE_URL = "http://localhost:5000"

def test_get_all_users():
    print(f"Testing GET {BASE_URL}/api/admin/users...")
    try:
        response = requests.get(f"{BASE_URL}/api/admin/users")
        
        if response.status_code == 200:
            users = response.json()
            print(f"✅ Success! Retrieved {len(users)} users.")
            
            if users:
                print("\nSample User Data:")
                pprint(users[0])
                
                # Verify required fields
                required_fields = ['id', 'first_name', 'last_name', 'email', 'role']
                missing = [f for f in required_fields if f not in users[0]]
                
                if not missing:
                    print("\n✅ All required fields present in sample.")
                else:
                    print(f"\n❌ Missing fields in sample: {missing}")
            else:
                print("\n⚠️ No users found in database.")
        else:
            print(f"❌ Failed. Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_get_all_users()
