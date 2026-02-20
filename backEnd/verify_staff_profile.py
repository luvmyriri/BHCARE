import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_doctor_profile():
    print("--- Testing Doctor Profile Fetch ---")
    
    # 1. Login
    login_payload = {
        "email": "dr.strange@bhcare.ph",
        "password": "password123"
    }
    
    try:
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/login", json=login_payload)
        
        if response.status_code == 200:
            user = response.json().get('user')
            user_id = user['id']
            print(f"Logged in as: {user['first_name']} {user['last_name']} (ID: {user_id})")
            
            # 2. Fetch User Profile
            profile_res = session.get(f"{BASE_URL}/user/{user_id}")
            if profile_res.status_code == 200:
                profile = profile_res.json()
                print("Profile Fetched successfully.")
                print(f" - Clinic Room: {profile.get('clinic_room')}")
                print(f" - Schedule: {profile.get('schedule')}")
                
                if profile.get('clinic_room') and profile.get('schedule'):
                    print("✅ Specialized details present!")
                else:
                    print("❌ Specialized details MISSING!")
            else:
                print(f"Failed to fetch profile: {profile_res.text}")
        else:
            print(f"Login failed: {response.text}")
            
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    test_doctor_profile()
