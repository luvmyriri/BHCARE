import sys
import os

backend_dir = r"c:\xampp\htdocs\BHCARE\backend"
sys.path.append(backend_dir)

from app import PHIDParser

def test_philhealth():
    dummy_text = """EXPECTED ID TYPE: PhilHealth ID
REPUBLIC OF THE PHILIPPINES
Philippine Health Insurance Corporation
PhilHealth
Dinar Parter in He
14-025329602-6
GABONADA, CHRISTIAN LIMBAGO
JANUARY 22, 2002 - MALE
VETTALEA HIGHLAND HOMES LOT 1 PHASE 3 BLOCK 6
BULATOK PAGADIAN CITY, ZAMBOANGA DEL SUR - 7016
140253296026
C.
S
CamScanner
"""
    
    with open("test_out_ph.txt", "w", encoding="utf-8") as f:
        f.write("\n--- Testing PhilHealth Address Parser ---\n")
        parser = PHIDParser(expected_id_type="PhilHealth ID")
        fields, confs = parser.parse(dummy_text)
        f.write("Extracted Address Info:\n")
        for key in ['full_address', 'street_name', 'subdivision', 'barangay', 'city', 'province', 'zip_code']:
            f.write(f"{key}: {fields.get(key)}\n")

if __name__ == "__main__":
    test_philhealth()
