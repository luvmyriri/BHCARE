
import requests
import json

def test_login():
    url = "http://127.0.0.1:5000/login"
    payload = {
        "email": "security1741@bhcare.ph",
        "password": "bhcare174"
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
