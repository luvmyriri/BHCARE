import sys
import os

backend_dir = r"c:\xampp\htdocs\BHCARE\backend"
sys.path.append(backend_dir)

from app import PHIDParser

def test_tin_id():
    dummy_text = """EXPECTED ID TYPE: TIN ID
REPUBLIC OF THE PHILIPPINES
DEPARTMENT OF FINANCE
B BUREAU OF INTERNAL REVENUE
Dela Cruz, Mia
TIN: 123-456-789-000
28 Payapa St. Bagong Diwa
Sto. Cristobal, Caloocan City
DATE OF BIRTH: 09/04/1994
DATE OF ISSUE: 10/02/2017
SIONATURE
"""
    
    with open("test_out_tin.txt", "w", encoding="utf-8") as f:
        f.write("\n--- Testing TIN ID Parser ---\n")
        parser = PHIDParser(expected_id_type="TIN ID")
        fields, confs = parser.parse(dummy_text)
        f.write("Extracted Fields:\n")
        for key in ['first_name', 'middle_name', 'last_name', 'dob', 'full_address', 'house_number', 'block_number', 'lot_number', 'street_name', 'subdivision', 'barangay', 'city', 'province', 'zip_code', 'region']:
            f.write(f"{key}: {fields.get(key)}\n")

if __name__ == "__main__":
    test_tin_id()
