
import requests
import json

def test_login():
    url = "http://127.0.0.1:5000/login"
    # Try lowercase email
    data = {
        "email": "testcase@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful with lowercase email!")
        else:
            print("❌ Login failed.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
