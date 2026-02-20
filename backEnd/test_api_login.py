import urllib.request
import json

url = "http://127.0.0.1:5000/api/login"
payload = json.dumps({"email": "genetabios13@gmail.com", "password": "BHCare2026!"}).encode('utf-8')

log = open('api_test.log', 'w', encoding='utf-8')

try:
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode('utf-8')
        log.write("STATUS: " + str(resp.status) + "\n")
        log.write("BODY: " + body + "\n")
        log.write("LOGIN: SUCCESS\n")
except urllib.error.HTTPError as e:
    body = e.read().decode('utf-8')
    log.write("HTTP ERROR: " + str(e.code) + "\n")
    log.write("BODY: " + body + "\n")
    log.write("LOGIN: FAILED\n")
except Exception as ex:
    log.write("EXCEPTION: " + str(ex) + "\n")

log.close()
print("Done - check api_test.log")
