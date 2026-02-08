from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2 import sql
import bcrypt
import os
from dotenv import load_dotenv
import requests
from PIL import Image, ImageEnhance, ImageFilter
import io
import re
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db():
    return psycopg2.connect(
        host=os.getenv('DB_HOST', '127.0.0.1'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'bhcare'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD')
    )

OCR_API_KEY = os.getenv('OCR_API_KEY')

# ============= ADVANCED OCR PREPROCESSING =============
def preprocess_image(image_bytes):
    """Enhanced image preprocessing for better OCR accuracy"""
    img = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB if needed
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Resize if too large (max 2000px width)
    if img.width > 2000:
        ratio = 2000 / img.width
        img = img.resize((2000, int(img.height * ratio)), Image.Resampling.LANCZOS)
    
    # Enhance contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.5)
    
    # Enhance sharpness
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(2.0)
    
    # Convert to grayscale and apply threshold
    img = img.convert('L')
    
    # Save to bytes
    output = io.BytesIO()
    img.save(output, format='JPEG', quality=95)
    return output.getvalue()

# ============= FIELD VALIDATORS =============
class FieldValidator:
    @staticmethod
    def validate_name(text):
        """Validate and clean name fields"""
        if not text:
            return None, 0.0
        cleaned = re.sub(r'[^a-zA-Z\s\-]', '', text).strip()
        if not cleaned or len(cleaned) < 2:
            return None, 0.0
        confidence = 0.9 if len(cleaned) > 2 else 0.6
        return cleaned.title(), confidence
    
    @staticmethod
    def validate_date(text):
        """Validate and parse date fields"""
        if not text:
            return None, 0.0
        
        # Try multiple patterns
        patterns = [
            (r'(\d{4})[/-](\d{2})[/-](\d{2})', '%Y-%m-%d', 0.95),
            (r'(\d{2})[/-](\d{2})[/-](\d{4})', '%m/%d/%Y', 0.90),
            (r'(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[a-z]*\s+(\d{1,2})[\s,]+(\d{4})', 'text', 0.85)
        ]
        
        for pattern, fmt, conf in patterns:
            match = re.search(pattern, text, re.I)
            if match:
                try:
                    if fmt == 'text':
                        months = {'JAN':'01','FEB':'02','MAR':'03','APR':'04','MAY':'05','JUN':'06',
                                 'JUL':'07','AUG':'08','SEP':'09','OCT':'10','NOV':'11','DEC':'12'}
                        m = months[match.group(1)[:3].upper()]
                        d = match.group(2).zfill(2)
                        y = match.group(3)
                        return f"{y}-{m}-{d}", conf
                    elif fmt == '%m/%d/%Y':
                        date_str = f"{match.group(1)}/{match.group(2)}/{match.group(3)}"
                        dt = datetime.strptime(date_str, fmt)
                        return dt.strftime('%Y-%m-%d'), conf
                    else:
                        date_str = f"{match.group(1)}-{match.group(2)}-{match.group(3)}"
                        return date_str, conf
                except:
                    continue
        return None, 0.0
    
    @staticmethod
    def validate_gender(text):
        """Validate gender field"""
        if not text:
            return None, 0.0
        
        clean = text.upper()
        if 'FEMALE' in clean or clean == 'F':
            return 'Female', 0.95
        elif 'MALE' in clean or clean == 'M':
            return 'Male', 0.95
        return None, 0.0

# ============= ADVANCED OCR PARSER =============
class PHIDParser:
    def __init__(self):
        self.fields = {
            'first_name': None,
            'middle_name': None,
            'last_name': None,
            'dob': None,
            'gender': None,
            'phone': None,
            'contact': None, # Match registration form key
            'address': None,
            'city': None,
            'id_type': 'Government ID',
            'crn': None,
            'email': None,
            'region': None,
            'region_name': None,
            'province': None,
            'province_name': None,
            'city_code': None,
            'barangay': None,
            'barangay_code': None
        }
        self.confidence = {}
    
    def parse(self, text):
        """Parse OCR text with confidence scoring"""
        print("\n>>> INITIALIZING V4 PARSER (Address Precision Patch) <<<")
        lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 1]
        clean_text = text.replace('\n', ' ')
        
        # 0. Identify ID Type for better guidance
        self._identify_id_type(clean_text)
        
        # 1. Extract Names
        self._extract_names(lines)
        
        # 2. Extract DOB
        self._extract_dob(clean_text)
        
        # 3. Extract Gender
        self._extract_gender(text)
        
        # 4. Extract CRN/ID No.
        self._extract_crn(clean_text)
        
        # 5. Extract Phone Number
        self._extract_phone(text)
        
        # 5b. Extract Email
        self._extract_email(clean_text)

        # 6. Extract Address
        self._extract_address(lines, clean_text)
        
        return self.fields, self.confidence
    
    def _identify_id_type(self, text):
        """Detect the type of Philippine ID from OCR text"""
        ul = text.upper()
        if 'POSTAL' in ul: self.fields['id_type'] = 'Postal ID'
        elif any(k in ul for k in ['SOCIAL SECURITY', ' SSS ']): self.fields['id_type'] = 'SSS ID'
        elif 'UNIFIED MULTI-PURPOSE' in ul or 'UMID' in ul: self.fields['id_type'] = 'UMID ID'
        elif any(k in ul for k in ['PHILIPPINES IDENTIFICATION', 'NATIONAL ID', 'PHILID']): self.fields['id_type'] = 'National ID'
        elif 'PROFESSIONAL REGULATION' in ul or ' PRC ' in ul: self.fields['id_type'] = 'PRC ID'
        elif 'VOTER' in ul: self.fields['id_type'] = 'Voter\'s ID'
        elif 'PHILHEALTH' in ul: self.fields['id_type'] = 'PhilHealth ID'
        elif 'DRIVER' in ul and 'LICENSE' in ul: self.fields['id_type'] = 'Driver\'s License'
        print(f"[ID TYPE] Identified as: {self.fields['id_type']}")

    def _extract_crn(self, text):
        """Extract CRN or ID Number"""
        patterns = [
            r'CRN[:\s]*(\d{4}-\d{7}-\d)',  # UMID pattern: 0028-1215160-9
            r'ID\s*NO\.?[:\s]*([A-Z0-9-]{10,20})',
            r'SSS\s*NO\.?[:\s]*(\d{2}-\d{7}-\d)',
            r'PRC\s*NO\.?[:\s]*(\d{7})'
        ]
        
        # Strategy 1: Look for patterns in the whole text (same line)
        for p in patterns:
             match = re.search(p, text.upper())
             if match:
                 self.fields['crn'] = match.group(1)
                 self.confidence['crn'] = 0.95
                 print(f"[CRN] Found via same-line: {self.fields['crn']}")
                 return
        
        # Strategy 2: Look for ID Number labels and grab the next word/line
        crn_labels = ['ID NUMBER', 'ID NO', 'CRN', 'NATIONAL ID', 'PHILID']
        lines = text.split('\n')
        for i, line in enumerate(lines):
            if any(l in line.upper() for l in crn_labels):
                # Check next 2 lines for a potential ID number (alphanumeric, 6-20 chars)
                search_scope = " ".join(lines[i:min(i+3, len(lines))])
                # Remove the label itself to avoid matching it
                clean_scope = search_scope.replace(line, '').strip()
                match = re.search(r'\b([A-Z0-9-]{6,20})\b', clean_scope)
                if match:
                     self.fields['crn'] = match.group(1)
                     self.confidence['crn'] = 0.85
                     print(f"[CRN] Found via next-line search: {self.fields['crn']}")
                     return

    def _extract_email(self, text):
        """Extract email address from OCR text"""
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        match = re.search(email_pattern, text)
        if match:
            self.fields['email'] = match.group(0).lower()
            self.confidence['email'] = 0.95
            print(f"[EMAIL] Found: {self.fields['email']}")

    def _extract_names(self, lines):
        """Extract names with broader header and label detection for all PH IDs"""
        # Strategy 1: Combined header (e.g. UMID, SSS, PRC)
        header_idx = None
        for i, line in enumerate(lines):
            ul = line.upper()
            if 'LAST NAME' in ul and 'FIRST NAME' in ul:
                header_idx = i
                break
        
        if header_idx is not None and header_idx + 1 < len(lines):
            data_line = lines[header_idx + 1]
            if ',' in data_line:
                parts = [p.strip() for p in data_line.split(',', 1)]
                last, conf_l = FieldValidator.validate_name(parts[0])
                self.fields['last_name'] = last
                self.confidence['last_name'] = conf_l
                
                if len(parts) > 1:
                    rest = parts[1].strip().split()
                    if len(rest) >= 1:
                        first, conf_f = FieldValidator.validate_name(rest[0])
                        self.fields['first_name'] = first
                        self.confidence['first_name'] = conf_f
                    if len(rest) >= 2:
                        middle, conf_m = FieldValidator.validate_name(' '.join(rest[1:]))
                        self.fields['middle_name'] = middle
                        self.confidence['middle_name'] = conf_m
                return

        # Strategy 2: Individual labels (Generalized for all cards)
        for i, line in enumerate(lines):
            ul = line.upper()
            if i + 1 < len(lines):
                # Surname Labels
                if any(k in ul for k in ['LAST NAME', 'SURNAME', 'FAMILY NAME', ' SUR NAMES']):
                    # Check same line after colon first
                    if ':' in line:
                        potential = line.split(':', 1)[1].strip()
                        if len(potential) > 2:
                            val, conf = FieldValidator.validate_name(potential)
                            self.fields['last_name'] = val
                            self.confidence['last_name'] = conf
                            continue
                    # Check next line
                    val, conf = FieldValidator.validate_name(lines[i+1])
                    if val and not self.fields['last_name']:
                        self.fields['last_name'] = val
                        self.confidence['last_name'] = conf

                # First Name Labels
                elif any(k in ul for k in ['FIRST NAME', 'GIVEN NAME', 'GIVEN NAM ES']):
                    if ':' in line:
                        potential = line.split(':', 1)[1].strip()
                        if len(potential) > 2:
                            val, conf = FieldValidator.validate_name(potential)
                            self.fields['first_name'] = val
                            self.confidence['first_name'] = conf
                            continue
                    val, conf = FieldValidator.validate_name(lines[i+1])
                    if val and not self.fields['first_name']:
                        self.fields['first_name'] = val
                        self.confidence['first_name'] = conf

                # Middle Name Labels
                elif any(k in ul for k in ['MIDDLE NAME', 'MIDDLE INITIAL', 'M.I.']):
                    if ':' in line:
                        potential = line.split(':', 1)[1].strip()
                        if len(potential) > 1:
                            val, conf = FieldValidator.validate_name(potential)
                            self.fields['middle_name'] = val
                            self.confidence['middle_name'] = conf
                            continue
                    val, conf = FieldValidator.validate_name(lines[i+1])
                    if val and not self.fields['middle_name']:
                        self.fields['middle_name'] = val
                        self.confidence['middle_name'] = conf
    
    def _extract_dob(self, text):
        """Extract date of birth with smart filtering to avoid issuance/expiry dates"""
        # Look for birth date specific labels
        birth_keywords = [
            'DATE OF BIRTH', 'BIRTH DATE', 'DOB', 'D.O.B', 
            'BIRTHDAY', 'BORN', 'BIRTHDATE', 'DATE BIRTH'
        ]
        
        # Split into lines for label detection
        lines = text.split('\n')
        
        # Strategy 1: Look for labeled birth date
        for i, line in enumerate(lines):
            upper_line = line.upper()
            if any(keyword in upper_line for keyword in birth_keywords):
                # Search same line and next 2 lines
                search_text = ' '.join(lines[i:min(i+3, len(lines))])
                dob, conf = self._find_valid_birth_date(search_text)
                if dob:
                    self.fields['dob'] = dob
                    self.confidence['dob'] = conf
                    print(f"[DOB] Found via label: {dob}")
                    return
        
        # Strategy 2: Global search for any date that passes as a birth date
        all_dates = self._find_all_dates(text)
        for date_str, conf in all_dates:
            if self._is_valid_birth_date(date_str):
                # Check if it might be an issuance/expiry date (heuristic: close to today)
                dt = datetime.strptime(date_str, '%Y-%m-%d')
                age = (datetime.now() - dt).days / 365.25
                if 10 < age < 120:
                    self.fields['dob'] = date_str
                    self.confidence['dob'] = conf * 0.7 
                    print(f"[DOB] Found via age validation: {date_str}")
                    return
        
        print("[DOB] No valid birth date found")
    
    def _find_valid_birth_date(self, text):
        """Find a date in text and validate it's a reasonable birth date"""
        dob, conf = FieldValidator.validate_date(text)
        if dob and self._is_valid_birth_date(dob):
            return dob, conf
        return None, 0.0
    
    def _find_all_dates(self, text):
        """Find all dates in text"""
        dates = []
        patterns = [
            (r'(\d{4})[/-](\d{2})[/-](\d{2})', '%Y-%m-%d', 0.95),
            (r'(\d{2})[/-](\d{2})[/-](\d{4})', '%m/%d/%Y', 0.90),
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
                except:
                    continue
        return dates
    
    def _is_valid_birth_date(self, date_str):
        """Check if date is a reasonable birth date (at least 10 years ago, not in future)"""
        try:
            birth_date = datetime.strptime(date_str, '%Y-%m-%d')
            today = datetime.now()
            
            # Reject future dates
            if birth_date > today:
                print(f"[DOB] Rejected {date_str} (future date)")
                return False
            
            age_years = (today - birth_date).days / 365.25
            
            # Birth date should be between 10 and 120 years ago
            if 10 <= age_years <= 120:
                return True
            else:
                print(f"[DOB] Rejected {date_str} (age would be {age_years:.1f} years)")
                return False
        except:
            return False

    
    def _extract_gender(self, text):
        """Extract gender with improved label detection"""
        upper_text = text.upper()
        
        # Strategy 1: Look for "Sex:" or "Gender:" labels with flexible spacing
        # Handles: "Sex M", "Sex: M", "Sex    M" (multiple spaces/tabs)
        sex_patterns = [
            r'(?:SEX|GENDER|KASARIAN)[:\s]+([MF])(?:\s|$|\b)',  # "Sex: M" with word boundary
            r'(?:SEX|GENDER|KASARIAN)[:\s]+(MALE|FEMALE)',  # "Sex: MALE"
            r'\b(MALE|FEMALE)\s+(?:SEX|GENDER)',  # "MALE Sex" (reversed)
        ]
        
        for pattern in sex_patterns:
            match = re.search(pattern, upper_text)
            if match:
                value = match.group(1)
                gender, conf = FieldValidator.validate_gender(value)
                if gender:
                    self.fields['gender'] = gender
                    self.confidence['gender'] = conf
                    print(f"[GENDER] Found via label: {gender}")
                    return
        
        # Strategy 2: Table layout pattern (e.g. Sex indicator far from label)
        table_pattern = r'(?:SEX|GENDER|KASARIAN)(?:[\s\S]{0,50})\b([MF])\b(?![A-RT-Z])'
        match = re.search(table_pattern, upper_text)
        if match:
            gender, conf = FieldValidator.validate_gender(match.group(1))
            if gender:
                self.fields['gender'] = gender
                self.confidence['gender'] = 0.85
                print(f"[GENDER] Found in table layout: {gender}")
                return
        
        # Strategy 3: Fallback - look for MALE/FEMALE anywhere in text
        gender, conf = FieldValidator.validate_gender(text)
        if gender:
            self.fields['gender'] = gender
            self.confidence['gender'] = conf * 0.7  # Lower confidence without label
            print(f"[GENDER] Found without label: {gender}")
    
    def _extract_phone(self, text):
        """Extract phone number (mobile or landline)"""
        upper_text = text.upper()
        
        # Strategy 1: Look for labeled phone numbers (highest confidence)
        # Patterns: "Tel. No.:", "Mobile:", "Contact No:", "Phone:"
        phone_label_patterns = [
            r'(?:TEL\.?\s*NO\.?|TELEPHONE|MOBILE|CONTACT\s*NO\.?|PHONE)[:\s]*(\+?63|0)?[\s-]?([0-9]{3})[\s-]?([0-9]{3,4})[\s-]?([0-9]{3,4})',
            r'(?:TEL\.?\s*NO\.?|MOBILE)[:\s]*([0-9]{4})([0-9]{3})([0-9]{4})',  # 10-digit format
        ]
        
        for pattern in phone_label_patterns:
            match = re.search(pattern, upper_text)
            if match:
                # Reconstruct phone number from groups
                if len(match.groups()) == 4:
                    country = match.group(1) or ''
                    part1 = match.group(2)
                    part2 = match.group(3)
                    part3 = match.group(4)
                    phone = f"{country}{part1}{part2}{part3}".strip()
                elif len(match.groups()) == 3:
                    phone = f"{match.group(1)}{match.group(2)}{match.group(3)}"
                else:
                    phone = ''.join(g for g in match.groups() if g)
                
                # Clean and validate
                phone = re.sub(r'[\s-]+', '', phone)
                
                if 10 <= len(phone) <= 13:
                    self.fields['contact'] = phone
                    self.confidence['phone'] = 0.95
                    print(f"[PHONE] Found via label: {phone}")
                    return
        
        # Strategy 2: Mobile patterns
        mobile_patterns = [
            r'\b(09[0-9]{2})[\s-]?([0-9]{3})[\s-]?([0-9]{4})\b',
            r'\b(\+639[0-9]{2})[\s-]?([0-9]{3})[\s-]?([0-9]{4})\b',
        ]
        
        for pattern in mobile_patterns:
            match = re.search(pattern, text)
            if match:
                phone = ''.join(match.groups()).replace(' ', '').replace('-', '')
                self.fields['contact'] = phone
                self.confidence['phone'] = 0.85
                print(f"[PHONE] Found mobile: {phone}")
                return
        
        # Strategy 3: Look for landline patterns (02 XXXX XXXX or similar)
        landline_patterns = [
            r'\b(02|032|033|034|035|036|038|042|043|044|045|046|047|048|049|052|053|054|055|056|062|063|064|065|072|074|075|077|078|082|083|084|085|086|088)[\s-]?([0-9]{3,4})[\s-]?([0-9]{4})\b',
        ]
        
        for pattern in landline_patterns:
            match = re.search(pattern, text)
            if match:
                phone = ''.join(match.groups()).replace(' ', '').replace('-', '')
                self.fields['phone'] = phone
                self.confidence['phone'] = 0.75
                print(f"[PHONE] Found landline: {phone}")
                return
        
        print("[PHONE] Not found")
    
    def _extract_address(self, lines, text):
        """Extract address components with enhanced multi-line support and Caloocan detection"""
        upper_text = text.upper()
        
        caloocan_indicators = ['CALOOCAN', 'KALOOKAN', 'KALOOCAN']
        is_caloocan = any(indicator in upper_text for indicator in caloocan_indicators)
        
        if is_caloocan:
            self.fields['city'] = 'Caloocan City'
            self.confidence['city'] = 0.95
            self.fields['region'] = '130000000'
            self.fields['region_name'] = 'National Capital Region (NCR)'
            self.fields['province'] = '133900000' 
            self.fields['province_name'] = 'Metro Manila'
            self.fields['city_code'] = '137404000'
            self.confidence['region'] = 0.95
            self.confidence['region_name'] = 0.95
            self.confidence['province'] = 0.95
            self.confidence['province_name'] = 0.95
            self.confidence['city_code'] = 0.95
        
        # Barangay Extraction
        barangay_patterns = [
            r'BARANGAY\s+(\d+)',
            r'BRGY\.?\s*(\d+)',
            r'BRG?Y\s+(\d+)',
            r'\bBRGY\s+NO\.?\s*(\d+)',
        ]
        
        for pattern in barangay_patterns:
            match = re.search(pattern, upper_text)
            if match:
                brgy_num = match.group(1)
                self.fields['barangay'] = f'Barangay {brgy_num}'
                self.confidence['barangay'] = 0.95
                if brgy_num == '174':
                    self.fields['barangay_code'] = '137404174'
                break
        
        # Full Address Extraction (Multi-Line Focus)
        address_keywords = ['ADDRESS', 'RESIDENCE', 'HOME', 'STREET', 'CITY', 'PROVINCE']
        addr_line_idx = None
        for i, line in enumerate(lines):
            if any(kw in line.upper() for kw in address_keywords):
                addr_line_idx = i
                break
        
        if addr_line_idx is not None:
            # Merge up to 3 lines after label
            candidates = []
            for j in range(1, 4):
                if addr_line_idx + j < len(lines):
                    l = lines[addr_line_idx + j].strip()
                    if len(l) > 3 and not any(k in l.upper() for k in ['ID NO', 'DATE OF']):
                        candidates.append(l)
            
            if candidates:
                full_addr = " ".join(candidates)
                self.fields['full_address'] = full_addr
                self.confidence['full_address'] = 0.85
                self._parse_address_components(full_addr)
        
        # Fallback Strategy for unlabeled address (e.g. National ID, Voter's ID)
        if not self.fields.get('full_address'):
             # Look for city/location keywords and grab preceding lines
             for i, line in enumerate(lines):
                 ul = line.upper()
                 if any(ind in ul for ind in caloocan_indicators):
                    candidates = []
                    if i > 0: candidates.insert(0, lines[i-1])
                    if i > 1 and len(candidates[0]) < 10: candidates.insert(0, lines[i-2])
                    
                    if len(ul) > 20: # Use same line if long (e.g. Street City)
                        parts = re.split(r'\b(?:CALOOCAN|CITY|METRO|PHILS)\b', line, flags=re.I)
                        if len(parts) > 0 and len(parts[0].strip()) > 5:
                            candidates.append(parts[0].strip())
                    
                    candidate_text = " ".join(candidates).strip()
                    if len(candidate_text) > 10:
                        self.fields['full_address'] = candidate_text
                        self.confidence['full_address'] = 0.75
                        self._parse_address_components(candidate_text)
                        break

        # Always attempt parsing from full text if components still missing
        if not any(self.fields.get(f) for f in ['house_number', 'street_name', 'subdivision']):
             self._parse_address_components(text)
    
    def _parse_address_components(self, address_text):
        """Parse detailed address components from full address string"""
        upper_addr = address_text.upper()
        
        # Block Number
        block_patterns = [r'BLK\.?\s*#?\s*(\d+)', r'BLOCK\s+#?\s*(\d+)', r'\bB\.?\s*-?\s*(\d+)']
        for pattern in block_patterns:
            match = re.search(pattern, upper_addr)
            if match:
                self.fields['block_number'] = f"Block {match.group(1)}"
                self.confidence['block_number'] = 0.95
                print(f"[ADDRESS] Block No: {self.fields['block_number']}")
                break
        
        # Lot Number
        lot_patterns = [r'LOT\.?\s*#?\s*(\d+)', r'\bL\.?\s*-?\s*(\d+)']
        for pattern in lot_patterns:
            match = re.search(pattern, upper_addr)
            if match:
                self.fields['lot_number'] = f"Lot {match.group(1)}"
                self.confidence['lot_number'] = 0.95
                print(f"[ADDRESS] Lot No: {self.fields['lot_number']}")
                break
        
        # Street Name
        street_pattern = r'([A-Z0-9\s#]{3,30}?)\s+(?:ST\b|STREET|RD\b|ROAD|AVE\b|AVENUE|BLVD|DRIVE|LANE)'
        match = re.search(street_pattern, upper_addr)
        if match:
            raw_street = match.group(1).strip()
            # Clean up
            if 'BLK' not in raw_street and 'LOT' not in raw_street:
                 clean = re.sub(r'\b(Lts?|No\.)\s*[\d\-A-Z]+', '', raw_street).strip()
                 if len(clean) > 3:
                    self.fields['street_name'] = clean.title()
                    self.confidence['street_name'] = 0.95
                    print(f"[ADDRESS] Street: {self.fields['street_name']}")

        # Fallback Street (before Location)
        if not self.fields.get('street_name'):
             # More flexible pattern for area-based streets like "BAGUMBONG"
             fallback = re.search(r'(?:\d+\b)?\s*([A-Z\s]{3,25})[,\s]+(?:BRGY|BARANGAY|CALOOCAN)', upper_addr)
             if fallback:
                 cand = fallback.group(1).strip()
                 if not any(k in cand for k in ['LOT', 'BLK', 'BLOCK', 'NO.', 'ID ']):
                     self.fields['street_name'] = cand.title()
                     self.confidence['street_name'] = 0.85
                     print(f"[ADDRESS] Street (Fallback): {self.fields['street_name']}")
        # House Number
        house_patterns = [
            r'(?:HOUSE|H)[\.\s]*NO\.?[\s#]*([A-Z0-9\-]+)',
            r'^#\s*([A-Z0-9\-]+)',
            r'^\b(\d+[A-Z]?)\b\s+(?=[A-Z])'
        ]
        for pattern in house_patterns:
            match = re.search(pattern, upper_addr)
            if match:
                self.fields['house_number'] = match.group(1)
                self.confidence['house_number'] = 0.95
                print(f"[ADDRESS] House No: {self.fields['house_number']}")
                break

        # Contextual House No (before Street)
        if not self.fields.get('house_number') and self.fields.get('street_name'):
             street_upper = self.fields['street_name'].upper()
             try:
                 pre = upper_addr.split(street_upper)[0].strip()
                 num_match = re.search(r'#?(\d+[A-Z]?)$', pre)
                 if num_match:
                     self.fields['house_number'] = num_match.group(1)
                     self.confidence['house_number'] = 0.85
             except: pass

        # Subdivision/Village
        subdiv_patterns = [
            r'([A-Z0-9][A-Z0-9\s]+?)\s+(HOMES|VILLAGE|SUBDIVISION|VILLAS|HEIGHTS|ESTATES|RESIDENCES)',
            r'(NORTHVILLE\s*[A-Z0-9\s]*)' # National ID specific
        ]
        for pattern in subdiv_patterns:
            match = re.search(pattern, upper_addr)
            if match:
                val = match.group(1).split(',')[0].strip() # Stop at comma
                if len(val) > 3:
                    self.fields['subdivision'] = val.title()
                    self.confidence['subdivision'] = 0.95
                    print(f"[ADDRESS] Subdivision: {self.fields['subdivision']}")
                    break
        
        # ZIP Code
        zip_match = re.search(r'\b(1[0-9]{3})\b', upper_addr) # Philippine ZIP starts with 1 in NCR
        if zip_match:
            self.fields['zip_code'] = zip_match.group(1)
            self.confidence['zip_code'] = 0.95
            print(f"[ADDRESS] ZIP: {self.fields['zip_code']}")




# ============= DUAL OCR ENDPOINT =============
@app.route("/ocr-dual", methods=["POST"])
def ocr_dual():
    """Process front and back of ID"""
    try:
        files = request.files
        front = files.get('front')
        back = files.get('back')
        
        if not front:
            return jsonify({"error": "Front image required"}), 400
        
        # Process front
        print("=== PROCESSING FRONT ID ===")
        front_bytes = front.read()
        processed_front = preprocess_image(front_bytes)
        
        payload = {
            'apikey': OCR_API_KEY,
            'language': 'eng',
            'isOverlayRequired': 'false',
            'scale': 'true',
            'OCREngine': '2'
        }
        
        response = requests.post(
            'https://api.ocr.space/parse/image',
            files={'file': ('front.jpg', processed_front, 'image/jpeg')},
            data=payload,
            timeout=60
        )
        
        if response.status_code != 200:
            return jsonify({"error": f"OCR API error: {response.status_code}"}), 500
        
        result = response.json()
        if not result.get('ParsedResults'):
            return jsonify({"error": "No text detected"}), 400
        
        front_text = result['ParsedResults'][0].get('ParsedText', '')
        print(f"FRONT OCR:\n{front_text}\n")
        
        # Process back if provided
        back_text = ""
        if back:
            print("=== PROCESSING BACK ID ===")
            back_bytes = back.read()
            processed_back = preprocess_image(back_bytes)
            
            response = requests.post(
                'https://api.ocr.space/parse/image',
                files={'file': ('back.jpg', processed_back, 'image/jpeg')},
                data=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('ParsedResults'):
                    back_text = result['ParsedResults'][0].get('ParsedText', '')
                    print(f"BACK OCR:\n{back_text}\n")
        
        # Parse combined text
        combined_text = front_text + "\n" + back_text # Combine and Parse
        parser = PHIDParser()
        print(f"\n--- COMBINED OCR TEXT ---\n{combined_text}\n------------------------\n")
        fields, confidence = parser.parse(combined_text)
        
        print("=== EXTRACTED FIELDS ===")
        for key, val in fields.items():
            conf = confidence.get(key, 0.0)
            print(f"{key}: {val} (confidence: {conf:.2f})")
        
        return jsonify({
            "fields": fields,
            "confidence": confidence,
            "raw_front": front_text,
            "raw_back": back_text
        }), 200
        
    except Exception as e:
        print(f"OCR Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ============= LEGACY SINGLE OCR (keep for compatibility) =============
@app.route("/ocr", methods=["POST"])
def ocr():
    """Legacy single-image OCR"""
    try:
        file = request.files.get('image')
        if not file:
            return jsonify({"error": "No image"}), 400
        
        img_bytes = file.read()
        processed = preprocess_image(img_bytes)
        
        payload = {
            'apikey': OCR_API_KEY,
            'language': 'eng',
            'isOverlayRequired': 'false',
            'scale': 'true',
            'OCREngine': '2'
        }
        
        response = requests.post(
            'https://api.ocr.space/parse/image',
            files={'file': ('id.jpg', processed, 'image/jpeg')},
            data=payload,
            timeout=60
        )
        
        if response.status_code != 200:
            return jsonify({"error": "OCR failed"}), 500
        
        result = response.json()
        if not result.get('ParsedResults'):
            return jsonify({"error": "No text"}), 400
        
        text = result['ParsedResults'][0].get('ParsedText', '')
        print(f"OCR Text:\n{text}\n")
        
        return jsonify({"text": text}), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ============= EXISTING ROUTES =============
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Missing credentials"}), 400
    
    # Hardcoded Doctor/Admin Bypass for Testing
    if email == 'admin@bhcare.ph' and password == 'bhcare123':
        return jsonify({
            "user": {
                "id": 9998,
                "email": email,
                "first_name": "System",
                "last_name": "Administrator",
                "role": "admin"
            }
        }), 200
    
    if email == 'doctor@bhcare.ph' and password == 'bhcare123':
        return jsonify({
            "user": {
                "id": 9999,
                "email": email,
                "first_name": "Medical",
                "last_name": "Officer",
                "role": "doctor"
            }
        }), 200
    
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
        
        if not bcrypt.checkpw(password.encode('utf-8'), user[2].encode('utf-8')):
            return jsonify({"error": "Invalid credentials"}), 401
        
        return jsonify({
            "user": {
                "id": user[0],
                "email": user[1],
                "first_name": user[3],
                "last_name": user[4]
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.form
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        middle_name = data.get('middle_name', '')
        dob = data.get('dob')
        gender = data.get('gender')
        contact = data.get('contact')
        barangay = data.get('barangay')
        city = data.get('city')
        province = data.get('province')
        
        # New detailed address fields (optional)
        house_number = data.get('house_number', '')
        block_number = data.get('block_number', '')
        lot_number = data.get('lot_number', '')
        street_name = data.get('street_name', '')
        subdivision = data.get('subdivision', '')
        zip_code = data.get('zip_code', '')
        full_address = data.get('full_address', '')
        
        if not all([email, password, first_name, last_name, dob, gender, contact, barangay, city, province]):
            return jsonify({"error": "Missing required fields"}), 400
        
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO users (email, password_hash, first_name, middle_name, last_name, 
                              date_of_birth, gender, contact_number, barangay, city, province,
                              house_number, block_number, lot_number, street_name, subdivision, 
                              zip_code, full_address)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (email, hashed, first_name, middle_name, last_name, dob, gender, contact, barangay, city, province,
              house_number, block_number, lot_number, street_name, subdivision, zip_code, full_address))
        
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({"id": user_id, "message": "Registration successful"}), 201
        
    except psycopg2.IntegrityError:
        return jsonify({"error": "Email already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/chat", methods=["POST"])
def chat():
    """AI Chatbot endpoint for medical queries and health center information"""
    try:
        data = request.json
        user_message = data.get('message', '').lower().strip()
        
        if not user_message:
            return jsonify({"response": "Please ask me a question about the health center or your health concerns."}), 200
        
        # Health Center Information Responses
        if any(word in user_message for word in ['hours', 'open', 'time', 'schedule', 'available']):
            response = "The Brgy. 174 Health Center is open Monday through Friday, 8:00 AM to 5:00 PM. Weekend services are available for emergencies only."
        
        elif any(word in user_message for word in ['location', 'address', 'where', 'find']):
            response = "We're located at Barangay 174, Caloocan City. You can easily find us near the main barangay hall."
        
        elif any(word in user_message for word in ['appointment', 'book', 'schedule consultation','visit']):
            response = "You can book an appointment by clicking on the 'Appointments' tab in your dashboard. We offer general consultations, vaccinations, and prenatal care."
        
        elif any(word in user_message for word in ['services', 'offer', 'provide', 'treatment']):
            response = "We offer: General Consultations, Vaccinations (children & adults), Prenatal Care, Family Planning, Medicine Dispensing, and Basic Laboratory Services."
        
        elif any(word in user_message for word in ['covid', 'vaccine', 'vaccination']):
            response = "Yes, we provide COVID-19 vaccinations and booster shots. Please bring a valid ID and your vaccination card if you have one."
        
        elif any(word in user_message for word in ['prenatal', 'pregnancy', 'pregnant']):
            response = "Our prenatal care program includes regular check-ups, vitamins, and health education. Schedule an appointment through your dashboard for a consultation."
        
        elif any(word in user_message for word in ['medicine', 'prescription', 'drug']):
            response = "We dispense free basic medicines with a valid prescription from our doctors. Some medicines may have limited stock."
        
        elif any(word in user_message for word in ['emergency', 'urgent', 'critical']):
            response = "For medical emergencies, please call 911 or go to the nearest hospital. Our health center handles non-emergency consultations and preventive care."
        
        elif any(word in user_message for word in ['cost', 'fee', 'price', 'pay', 'free']):
            response = "Most of our services are FREE for registered barangay residents. Some specialized services may have minimal fees."
        
        # Health Tips & General Medical Advice
        elif any(word in user_message for word in ['fever', 'temperature', 'hot']):
            response = "For fever: Rest, drink plenty of fluids, and monitor your temperature. If fever persists beyond 3 days or exceeds 39°C, please visit us for consultation."
        
        elif any(word in user_message for word in ['cough', 'cold', 'flu']):
            response = "For cough and colds: Get adequate rest, stay hydrated, and avoid contact with others. If symptoms worsen or persist beyond a week, schedule a consultation."
        
        elif any(word in user_message for word in ['headache', 'migraine']):
            response = "For headaches: Rest in a quiet, dark room, stay hydrated, and apply a cold compress. If severe or persistent, please consult our doctors."
        
        elif any(word in user_message for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
            response = "Hello! I'm your BHCare AI Assistant. I can help you with information about our health center, services, appointments, and general health advice. How can I assist you today?"
        
        elif any(word in user_message for word in ['thank', 'thanks']):
            response = "You're welcome! Stay healthy and don't hesitate to reach out if you need more assistance. 🩺"
        
        # Default Response
        else:
            response = "I can help you with questions about:\n• Health center hours and location\n• Booking appointments\n• Available services\n• Vaccinations\n• General health advice\n\nHow may I assist you today?"
        
        return jsonify({"response": response}), 200
        
    except Exception as e:
        return jsonify({"response": "I apologize, but I'm having trouble processing your request. Please try again later."}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
