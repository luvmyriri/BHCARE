
import requests
import json

def test_endpoint(url, name):
    print(f"--- Testing {name} ({url}) ---")
    data = {
        "email": "genetabios13@gmail.com",
        "password": "tempPC123!" 
    }
    
    try:
        response = requests.post(url, json=data, timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Content: {response.text[:100]}...")
    except Exception as e:
        print(f"Error: {e}")
    print("\n")

if __name__ == "__main__":
    # 1. Direct Backend
    test_endpoint("http://127.0.0.1:5000/api/login", "Direct Backend")
    
    # 2. Via Frontend Proxy (assuming Vite is on 3000)
    test_endpoint("http://127.0.0.1:3000/api/login", "Frontend Proxy")
