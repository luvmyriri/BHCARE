import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app import PHIDParser

text = """LAST NAME
ESTIOKO
FIRST NAME
GREGORY
MIDDLE NAME
REYES JR.
"""

parser = PHIDParser()
fields, confidence = parser.parse(text)

print(f"Fields: {fields}")
print(f"Confidence: {confidence}")
