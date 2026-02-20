import requests
import json

BASE_URL = "http://127.0.0.1:5000/api/admin/medical-staff"

def test_get_medical_staff():
    print(f"--- Testing GET {BASE_URL} ---")
    try:
        response = requests.get(BASE_URL)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            staff = response.json()
            print(f"Found {len(staff)} staff members.")
            for s in staff:
                details = f" - {s['first_name']} {s['last_name']} ({s['role']})"
                if s.get('specialization'):
                    details += f" - {s['specialization']}"
                if s.get('schedule'):
                    details += f" [{s['schedule']}]"
                print(details)
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")
    print("\n")

def test_create_medical_staff():
    print(f"--- Testing POST {BASE_URL} ---")
    new_staff = {
        "email": "dr.strange@bhcare.ph",
        "password": "password123",
        "first_name": "Stephen",
        "last_name": "Strange",
        "role": "Doctor",
        "contact_number": "09123456789",
        "prc_license_number": "PRC-123456",
        "specialization": "Neurosurgeon",
        "schedule": "Mon-Wed-Fri 10am-2pm",
        "clinic_room": "Room 303"
    }
    
    try:
        response = requests.post(BASE_URL, json=new_staff)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")
    print("\n")

if __name__ == "__main__":
    # test_get_medical_staff()
    test_create_medical_staff() # Uncomment to test creation
    test_get_medical_staff()
