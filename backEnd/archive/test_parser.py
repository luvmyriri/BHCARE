import sys
import os

# Put backend dir in path so imports work
backend_dir = r"c:\xampp\htdocs\BHCARE\backend"
sys.path.append(backend_dir)

from app import PHIDParser

def test_driver_license():
    dummy_text = """
    REPUBLIC OF THE PHILIPPINES
    DEPARTMENT OF TRANSPORTATION
    LAND TRANSPORTATION OFFICE
    DRIVER'S LICENSE
    Last Name, First Name, Middle Name
    SALVACION, LANCE ALDRIC CUREG
    Nationality
    PHL
    Sex
    M
    Date of Birth
    2004/07/30
    Address
    B11 L18 TAAL ST, MT VIEW SUBD, MUZON,
    CITY OF SAN JOSE DEL MONTE, BULACAN, 3023
    """
    
    print("\n--- Testing Driver's License Parser ---")
    parser = PHIDParser(expected_id_type="Driver's License")
    fields, confs = parser.parse(dummy_text)
    print("Extracted Names:")
    print(f"First: {fields.get('first_name')}")
    print(f"Middle: {fields.get('middle_name')}")
    print(f"Last: {fields.get('last_name')}")
    
def test_national_id():
    dummy_text = """
    REPUBLIKA NG PILIPINAS
    National ID
    DELA CRUZ
    JUAN
    AGUSTIN
    Sex
    MALE
    Date of Birth
    1990/01/01
    Address
    123 RIZAL ST, BRGY 1,
    CALOOCAN CITY, 1400
    """
    
    print("\n--- Testing National ID Parser ---")
    parser = PHIDParser(expected_id_type="National ID")
    fields, confs = parser.parse(dummy_text)
    print("Extracted Names:")
    print(f"First: {fields.get('first_name')}")
    print(f"Middle: {fields.get('middle_name')}")
    print(f"Last: {fields.get('last_name')}")

if __name__ == "__main__":
    test_driver_license()
    test_national_id()
