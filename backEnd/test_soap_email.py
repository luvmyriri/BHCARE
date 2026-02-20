import urllib.request
import json

url = "http://127.0.0.1:5000/api/soap-notes"
payload = json.dumps({
    "patient_id": 2,
    "doctor_email": "dr.strange@bhcare.ph",
    "subjective": "backend test",
    "objective": "backend test",
    "assessment": "backend test",
    "plan": "backend test"
}).encode('utf-8')

log = open('soap_test.log', 'w', encoding='utf-8')
try:
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode('utf-8')
        log.write("STATUS: " + str(resp.status) + "\n")
        log.write("BODY: " + body + "\n")
except urllib.error.HTTPError as e:
    log.write("HTTP ERROR: " + str(e.code) + "\n")
    log.write("BODY: " + e.read().decode('utf-8') + "\n")
except Exception as ex:
    log.write("EXCEPTION: " + str(ex) + "\n")
log.close()
print("Done")
