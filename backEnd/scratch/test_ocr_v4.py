import re
from datetime import datetime

class FieldValidator:
    @staticmethod
    def validate_name(text):
        if not text: return None, 0.0
        cleaned = re.sub(r'[^a-zA-Z\s\-]', '', text).strip()
        if not cleaned or len(cleaned) < 2: return None, 0.0
        return cleaned.title(), 0.95

class PHIDParser:
    def __init__(self, expected_id_type=None):
        self.expected_id_type = expected_id_type
        self.fields = {
            'first_name': None, 'middle_name': None, 'last_name': None, 
            'barangay': None, 'barangay_code': None, 'street_name': None,
            'house_number': None, 'subdivision': None, 'city': None,
            'zip_code': None, 'dob': None
        }
        self.confidence = {}

    def _is_noise(self, text):
        if not text: return True
        ul = text.upper()
        noise_keywords = [
            'REPUBLIC OF', 'DEPARTMENT OF', 'LAND TRANSPORTATION', 'OFFICE', 
            'DRIVERS LICENSE', 'LICENSE NO', 'EXPIRATION', 'AGENCY CODE',
            'SOCIAL SECURITY', 'SSS NO', 'PHILIPPINE IDENTIFICATION', 
            'DATE OF BIRTH', 'SEX', 'HEIGHT', 'WEIGHT', 'SERIAL NUMBER'
        ]
        if any(k in ul for k in noise_keywords):
            return True
        if re.match(r'^[\d\s\-\.\/#]+$', text) and len(text) < 4:
            return True
        return False

    def _is_valid_birth_date(self, date_str):
        try:
            birth_date = datetime.strptime(date_str, '%Y-%m-%d')
            today = datetime.now()
            if birth_date > today: return False
            age_years = (today - birth_date).days / 365.25
            if 0 <= age_years <= 130: return True
            return False
        except: return False

    def _find_all_dates(self, text):
        dates = []
        patterns = [
            (r'(\d{4})[/-](\d{2})[/-](\d{2})', '%Y-%m-%d', 0.95),
            (r'(\d{2})[/-](\d{2})[/-](\d{4})', '%m/%d/%Y', 0.90),
            (r'(\d{4})\s(\d{2})\s(\d{2})', '%Y-%m-%d', 0.88),
        ]
        for pattern, fmt, conf in patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                try:
                    if fmt == '%m/%d/%Y':
                        date_str = f"{match.group(1)}/{match.group(2)}/{match.group(3)}"
                        dt = datetime.strptime(date_str, fmt)
                        dates.append((dt.strftime('%Y-%m-%d'), conf))
                    else:
                        date_str = f"{match.group(1)}-{match.group(2)}-{match.group(3)}"
                        dates.append((date_str, conf))
                except: continue
        return dates

    def parse(self, text):
        upper_text = text.upper()
        
        # DOB
        all_dates = self._find_all_dates(text)
        for date_str, conf in all_dates:
            if self._is_valid_birth_date(date_str):
                dt = datetime.strptime(date_str, '%Y-%m-%d')
                age = (datetime.now() - dt).days / 365.25
                if 0 < age < 130:
                    self.fields['dob'] = date_str
                    break

        # Barangay
        barangay_patterns = [
            r'BARANGAY\s*([\d\s]{1,6})(?=\b)',
            r'BRG?Y\.?\s*([\d\s]{1,6})(?=\b)',
            r'BARANGAY\s*([A-Z0-9\s]{1,6})(?=[,\.\n]|\s+CALOOCAN|\s+CITY)',
            r'BARANGAY\s+([A-Z0-9\s]{3,30}?)(?=[,\.\n]|$|CALOOCAN|CITY)',
            r'BRG?Y\.?\s*([A-Z0-9\s]{3,30}?)(?=[,\.\n]|$|CALOOCAN|CITY)'
        ]
        print(f"[DEBUG] Searching Barangay in: {upper_text}")
        for pattern in barangay_patterns:
            match = re.search(pattern, upper_text)
            if match:
                raw_brgy = match.group(1).strip(' ,.')
                print(f"[DEBUG] Found raw_brgy: '{raw_brgy}' with pattern: {pattern}")
                ocr_normalized = raw_brgy
                # Case-insensitive normalization
                ocr_normalized = re.sub(r'\bf\b', '1', ocr_normalized, flags=re.I)
                ocr_normalized = re.sub(r'(?<![A-Z])F(?=\s*\d)', '1', ocr_normalized, flags=re.I)
                ocr_normalized = re.sub(r'(?<=\d)\s*F(?![A-Z])', '1', ocr_normalized, flags=re.I)
                ocr_normalized = re.sub(r'\bI\b(?=\s*\d)', '1', ocr_normalized, flags=re.I)
                ocr_normalized = re.sub(r'\bl\b(?=\s*\d)', '1', ocr_normalized, flags=re.I)
                
                print(f"[DEBUG] Normalized brgy: '{ocr_normalized}'")
                digits_only = re.sub(r'[^\d]', '', ocr_normalized)
                if digits_only and not re.sub(r'[\d\s]', '', ocr_normalized):
                    brgy_num = digits_only
                    if 1 <= len(brgy_num) <= 3:
                        self.fields['barangay'] = f'Barangay {int(brgy_num)}'
                        self.fields['barangay_code'] = f'137404{brgy_num.zfill(3)}'
                        break
                else:
                    if len(raw_brgy) > 3:
                        self.fields['barangay'] = raw_brgy.title()
                        if 'BAGONG SILANG' in raw_brgy.upper():
                            self.fields['barangay_code'] = '137404176'
                        elif 'TALA' in raw_brgy.upper():
                            self.fields['barangay_code'] = '137404188'
                        break
        
        # Address components
        # In production, we often strip "Address" label before calling this
        if 'ADDRESS ' in upper_text:
            upper_addr = upper_text.split('ADDRESS ', 1)[1]
        else:
            upper_addr = upper_text
            
        print(f"[DEBUG] Searching components in: {upper_addr}")
        
        # Fallback Street
        fallback = re.search(r'(?:\d+[,\s]+)?\s*([A-Z][A-Z\s]{2,24})[,\.\s]+(?:BRGY|BARANGAY|CALOOCAN)', upper_addr)
        if fallback:
            cand = fallback.group(1).strip()
            if not any(k in cand for k in ['LOT', 'BLK', 'BLOCK', 'NO.', 'ID ']) and not self._is_noise(cand):
                self.fields['street_name'] = cand.title()
        
        # House Number
        house_patterns = [
            r'\b(?:HOUSE|HS)[\.\s]*NO\.?[\s#]*([0-9A-Z\-]+)\b',
            r'\bNO\.?\s*([0-9]+[A-Z\-]*)\b',
            r'^#\s*([0-9A-Z\-]+)',
            r'^([0-9]{1,5}[A-Z]?)[,\s]+(?=[A-Z])',
            r'\b([0-9]{1,5}[A-Z]?)[,\s]+(?=[A-Z])' # No anchor for middle of text
        ]
        for pattern in house_patterns:
            match = re.search(pattern, upper_addr)
            if match:
                val = match.group(1).strip()
                if len(val) <= 6:
                    self.fields['house_number'] = val
                    break

        # ZIP (Mocking the post-process)
        self.fields['city'] = 'Caloocan City'
        if self.fields.get('city') == 'Caloocan City':
            zip_search = re.findall(r'\b(1[34][0-9]{2})\b', upper_text)
            found_zip = next((z for z in zip_search if 1400 <= int(z) <= 1428), None)
            if found_zip:
                self.fields['zip_code'] = found_zip
            elif self.fields.get('barangay') == 'Barangay 174':
                self.fields['zip_code'] = '1423'
            else:
                self.fields['zip_code'] = '1400'

        return self.fields

# Test Case from Screenshot
raw_dl_text = """REPUBLIC OF THE PHILIPPINES
DEPARTMENT OF TRANSPORTATION
LAND TRANSPORTATION OFFICE
DRIVERS LICENSE
ESTIOKO, GREGORY JR REYES
Nationality PHL Sex M Date of Birth 2002 07 23 Weight (kg) 62 Height(m) 1.75
Address 2680, MAGNOLIA. BARANGAY f 74, CALOOCAN CITY, NCR. THIRD DISTRICT, 1423"""

parser = PHIDParser()
result = parser.parse(raw_dl_text)

print(f"--- PARSING RESULTS ---")
print(f"DOB: {result['dob']}")
print(f"Barangay: {result['barangay']} (Code: {result.get('barangay_code')})")
print(f"House No: {result['house_number']}")
print(f"Street: {result['street_name']}")
print(f"ZIP: {result['zip_code']}")

expected = {
    'dob': '2002-07-23',
    'barangay': 'Barangay 174',
    'house_number': '2680',
    'street_name': 'Magnolia',
    'zip_code': '1423'
}

print("\n--- VALIDATION ---")
for key, val in expected.items():
    if result[key] == val:
        print(f"[PASS] {key}: {result[key]}")
    else:
        print(f"[FAIL] {key}: Expected {val}, got {result[key]}")
