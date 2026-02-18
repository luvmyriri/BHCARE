import requests
import json

url = 'http://localhost:5000/api/forgot-password'
headers = {'Content-Type': 'application/json'}
data = {'email': 'bhcarehealthcenter@gmail.com'} # Use a known email or dummy

print(f"Sending POST to {url} with data: {data}")
try:
    response = requests.post(url, json=data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
