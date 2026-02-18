
import requests
import json

try:
    response = requests.get('http://127.0.0.1:5000/api/doctor/patients')
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Count: {len(data)}")
        print(json.dumps(data, indent=2))
    else:
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
