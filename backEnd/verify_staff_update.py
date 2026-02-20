import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_update_staff():
    print("--- Testing Medical Staff Update ---")

    # 1. Login as Admin
    session = requests.Session()
    login_payload = {"email": "genetabios13@gmail.com", "password": "password123"} 
    # Note: Assuming this admin exists from previous context or I should check verify_backend_endpoint.py
    # Actually, let's use the one from the dashboard: genetabios13@gmail.com
    
    print("Logging in as Admin...")
    res = session.post(f"{BASE_URL}/api/login", json=login_payload)
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        return

    # 2. Get a staff member to update (e.g., Stephen Strange or create one)
    # Let's fetch the list first
    print("Fetching medical staff...")
    res = session.get(f"{BASE_URL}/api/admin/medical-staff")
    if res.status_code != 200:
        print(f"Failed to fetch staff: {res.text}")
        return
    
    staff_list = res.json()
    if not staff_list:
        print("No staff to update.")
        return

    target_staff = staff_list[0]
    print(f"Target Staff: {target_staff['first_name']} {target_staff['last_name']} (ID: {target_staff['id']})")

    # 3. Update their details
    update_payload = {
        "first_name": target_staff['first_name'],
        "last_name": target_staff['last_name'],
        "email": target_staff['email'],
        "contact_number": target_staff['contact_number'],
        "role": target_staff['role'],
        "specialization": "Updated Specialization",
        "schedule": "Mon-Wed-Fri 9am-4pm",
        "clinic_room": "Room 505",
        "status": "Active"
    }

    print("Updating staff details...")
    res = session.put(f"{BASE_URL}/user/{target_staff['id']}", json=update_payload)
    
    if res.status_code == 200:
        print("✅ Update successful.")
    else:
        print(f"❌ Update failed: {res.text}")
        return

    # 4. Verify the update
    print("Verifying update...")
    res = session.get(f"{BASE_URL}/api/admin/medical-staff")
    updated_list = res.json()
    updated_staff = next((s for s in updated_list if s['id'] == target_staff['id']), None)

    if updated_staff:
        print(f"Updated Schedule: {updated_staff['schedule']}")
        print(f"Updated Room: {updated_staff['clinic_room']}")
        
        if updated_staff['schedule'] == "Mon-Wed-Fri 9am-4pm" and updated_staff['clinic_room'] == "Room 505":
            print("✅ Verification Passed!")
        else:
            print("❌ Verification Failed: Data mismatch.")
    else:
        print("❌ Could not find staff after update.")

if __name__ == "__main__":
    test_update_staff()
