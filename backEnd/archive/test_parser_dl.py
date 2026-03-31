import sys
import os

backend_dir = r"c:\xampp\htdocs\BHCARE\backend"
sys.path.append(backend_dir)

from app import PHIDParser

def test_driver_license():
    dummy_text = """EXPECTED ID TYPE: Driver's License
202410
REPUBLIC OF THE PHILIPPINES
DEPARTMENT OF TRANSPORTATION
LAND TRANSPORTATION OFFICE
DRIVER'S LICENSE
at or nand
Last Name. First Name. Middle Name
ESTIOKO, GREGORY JR REYES
Nationality
Sex
Date of Birth
PHL
M
2002/07/23
Weight (kg)
62
Address
Height(m)
1.75
2680, MAGNOLIA, BARANGAY 174, CALOOCAN
CITY, NCR. THIRD DISTRICT, 1423
see No.
C53-24-003279
Expiration Date
2028/07/23
Agency Code
C53
Bodd
ype
Eyes Color
BLACK
Conditions
NONE
Signature of Licensee
ATTY NIGORO. MENDOZA II
Assistant Secretary
"""
    
    with open("test_out_dl.txt", "w", encoding="utf-8") as f:
        f.write("\n--- Testing DL Address Parser ---\n")
        parser = PHIDParser(expected_id_type="Driver's License")
        fields, confs = parser.parse(dummy_text)
        f.write("Extracted Fields:\n")
        for key in ['full_address', 'house_number', 'street_name', 'subdivision', 'barangay', 'city', 'province', 'zip_code', 'region']:
            f.write(f"{key}: {fields.get(key)}\n")

if __name__ == "__main__":
    test_driver_license()
