
import requests
import json
from datetime import datetime, timedelta

def test_booking():
    url = "http://127.0.0.1:5000/api/appointments"
    
    # Calculate a valid future date (e.g., tomorrow)
    tomorrow = datetime.now() + timedelta(days=1)
    # Ensure it's not a weekend if your logic forbids it, but let's try
    date_str = tomorrow.strftime('%Y-%m-%d')
    
    payload = {
        "user_id": 1,
        "service_type": "Dental Care",
        "appointment_date": date_str,
        "appointment_time": "09:00",
        "reason": "Test booking"
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"Sending booking request for {date_str}...")
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_booking()
