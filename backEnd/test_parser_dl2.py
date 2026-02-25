import sys
import os

backend_dir = r"c:\xampp\htdocs\BHCARE\backend"
sys.path.append(backend_dir)

from app import PHIDParser

def test_driver_license_multiline():
    dummy_text = """EXPECTED ID TYPE: Driver's License
2023/01/16
REPUBLIC OF THE PHILIPPINES
DEPARTMENT OF TRANSPORTATION
LAND TRANSPORTATION OFFICE
DRIVER'S LICENSE
Last Name. First Name. Middle Name
SALVACION, LANCE ALDRIC CUREG
Nationality
PHL
Sex
Date of Birth
M
2004/07/30
Weight (kg) Height(m)
64
1.69
Address
B11 LtB TAAL ST, MT VIEW SUBD, MUZON,
CITY OF SAN JOSE DEL MONTE, BULACAN, 3023
License No.
N23-23-001471
Expiration Date
2027/07/30
"""
    
    with open("test_out_dl2.txt", "w", encoding="utf-8") as f:
        f.write("\n--- Testing DL Address Parser (Multiline) ---\n")
        parser = PHIDParser(expected_id_type="Driver's License")
        fields, confs = parser.parse(dummy_text)
        f.write("Extracted Fields:\n")
        for key in ['full_address', 'house_number', 'block_number', 'lot_number', 'street_name', 'subdivision', 'barangay', 'city', 'province', 'zip_code', 'region']:
            f.write(f"{key}: {fields.get(key)}\n")

if __name__ == "__main__":
    test_driver_license_multiline()
