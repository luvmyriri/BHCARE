import urllib.request
import json

url = 'http://127.0.0.1:5000/api/forgot-password'
data = {'email': 'greg.reyes.727@gmail.com'}
params = json.dumps(data).encode('utf8')
req = urllib.request.Request(url, data=params, headers={'Content-Type': 'application/json'})

try:
    print(f"Sending POST to {url}")
    with urllib.request.urlopen(req, timeout=5) as response:
        print(f"Status: {response.status}")
        print(response.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
