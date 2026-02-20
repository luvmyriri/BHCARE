import requests
import json
import time

BASE_URL = "http://127.0.0.1:5000"

def test_medical_history_endpoints():
    print("--- Testing Medical History Endpoints ---")
    
    # Wait for server to be ready
    for i in range(5):
        try:
            requests.get(BASE_URL)
            break
        except:
            print(f"Waiting for server... ({i+1}/5)")
            time.sleep(2)
    
    # 1. Login as Doctor
    login_payload = {
        "email": "dr.strange@bhcare.ph",
        "password": "password123"
    }
    
    try:
        session = requests.Session()
        print(f"Logging in as {login_payload['email']}...")
        response = session.post(f"{BASE_URL}/api/login", json=login_payload)
        
        if response.status_code == 200:
            user = response.json().get('user')
            print(f"Logged in as: {user['first_name']} {user['last_name']}")
            
            # 2. Add a dummy SOAP note to ensure there is data
            # First, get a patient ID (assuming ID 1 exists and is a patient, or we can use the one from previous tests)
            # Let's try to get patients first
            patients_res = session.get(f"{BASE_URL}/api/doctor/patients")
            if patients_res.status_code == 200:
                patients = patients_res.json()
                if len(patients) > 0:
                    patient_id = patients[0]['id']
                    
                    # Create a note
                    note_payload = {
                        "patient_id": patient_id,
                        "doctor_id": user['id'],
                        "subjective": "Patient complains of headache",
                        "objective": "BP 120/80",
                        "assessment": "Migraine",
                        "plan": "Rest and painkillers"
                    }
                    print("Creating dummy SOAP note...")
                    # Note: The SOAP note create endpoint might need update or we check if it works as is
                    # based on soap_notes.py analysis, it expects json
                    create_res = session.post(f"{BASE_URL}/api/soap-notes", json=note_payload)
                    if create_res.status_code == 201:
                        print("✅ SOAP note created.")
                    else:
                        print(f"⚠️ Failed to create note: {create_res.text}")

                    # 3. Test Get Patient History
                    print(f"Fetching history for Patient {patient_id}...")
                    history_res = session.get(f"{BASE_URL}/api/patients/{patient_id}/history")
                    if history_res.status_code == 200:
                        history = history_res.json()
                        print(f"✅ Patient history fetched. Found {len(history)} records.")
                        if len(history) > 0:
                            print(f"   - Latest Diagnosis: {history[0].get('assessment')}")
                    else:
                         print(f"❌ Failed to fetch patient history: {history_res.text}")

                    # 4. Test Get All Medical Records
                    print("Fetching all medical records...")
                    all_res = session.get(f"{BASE_URL}/api/doctor/medical-records")
                    if all_res.status_code == 200:
                         records = all_res.json()
                         print(f"✅ All records fetched. Found {len(records)} records.")
                    else:
                        print(f"❌ Failed to fetch all records: {all_res.text}")
                        
                else:
                    print("No patients found to test with.")
            else:
                 print(f"Failed to fetch patients: {patients_res.text}")
                 
        else:
            print(f"Login failed: {response.text}")
            
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    test_medical_history_endpoints()
