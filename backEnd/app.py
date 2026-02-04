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

DB_CONFIG = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT')
}

OCR_API_KEY = os.getenv('OCR_API_KEY')

def get_db():
    return psycopg2.connect(**DB_CONFIG)

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
            'address': None,
            'city': None,
        }
        self.confidence = {}
    
    def parse(self, text):
        """Parse OCR text with confidence scoring"""
        lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 1]
        clean_text = text.replace('\n', ' ')
        
        # 1. Extract Names
        self._extract_names(lines)
        
        # 2. Extract DOB
        self._extract_dob(clean_text)
        
        # 3. Extract Gender
        self._extract_gender(clean_text)
        
        # 4. Extract Address
        self._extract_address(lines, clean_text)
        
        return self.fields, self.confidence
    
    def _extract_names(self, lines):
        """Extract names with header detection"""
        # Look for combined header
        header_idx = None
        for i, line in enumerate(lines):
            ul = line.upper()
            if 'LAST NAME' in ul and 'FIRST NAME' in ul:
                header_idx = i
                break
        
        if header_idx is not None and header_idx + 1 < len(lines):
            data_line = lines[header_idx + 1]
            if ',' in data_line:
                parts = data_line.split(',', 1)
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
        else:
            # Fallback: individual labels
            for i, line in enumerate(lines):
                ul = line.upper()
                if i + 1 < len(lines):
                    if 'LAST NAME' in ul or 'SURNAME' in ul:
                        val, conf = FieldValidator.validate_name(lines[i+1])
                        if val:
                            self.fields['last_name'] = val
                            self.confidence['last_name'] = conf
                    elif 'FIRST NAME' in ul or 'GIVEN NAME' in ul:
                        val, conf = FieldValidator.validate_name(lines[i+1])
                        if val:
                            self.fields['first_name'] = val
                            self.confidence['first_name'] = conf
                    elif 'MIDDLE NAME' in ul:
                        val, conf = FieldValidator.validate_name(lines[i+1])
                        if val:
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
            # Check if this line contains a birth date label
            if any(keyword in upper_line for keyword in birth_keywords):
                # Check this line and the next few lines for a date
                search_text = ' '.join(lines[i:min(i+3, len(lines))])
                dob, conf = self._find_valid_birth_date(search_text)
                if dob:
                    self.fields['dob'] = dob
                    self.confidence['dob'] = conf
                    print(f"[DOB] Found via label: {dob}")
                    return
        
        # Strategy 2: Find all dates and filter by age validation
        # (Only dates that would make person 10+ years old)
        all_dates = self._find_all_dates(text)
        for date_str, conf in all_dates:
            if self._is_valid_birth_date(date_str):
                self.fields['dob'] = date_str
                self.confidence['dob'] = conf * 0.8  # Lower confidence since no label
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
        """Extract gender"""
        gender, conf = FieldValidator.validate_gender(text)
        if gender:
            self.fields['gender'] = gender
            self.confidence['gender'] = conf
    
    def _extract_address(self, lines, text):
        """Extract address components with enhanced Caloocan detection"""
        upper_text = text.upper()
        
        # Enhanced Caloocan detection
        caloocan_indicators = ['CALOOCAN', 'KALOOKAN', 'KALOOCAN']
        is_caloocan = any(indicator in upper_text for indicator in caloocan_indicators)
        
        if is_caloocan:
            self.fields['city'] = 'Caloocan City'
            self.confidence['city'] = 0.95
            
            # Auto-populate address cascade for Caloocan
            self.fields['region'] = '130000000'  # NCR code
            self.fields['region_name'] = 'National Capital Region (NCR)'
            self.fields['province'] = '133900000'  # Metro Manila code
            self.fields['province_name'] = 'Metro Manila'
            self.fields['city_code'] = '137404000'  # Caloocan City code
            self.confidence['region'] = 0.95
            self.confidence['province'] = 0.95
        
        # Extract Barangay number (e.g., "Barangay 174", "Brgy 174", "Brgy. 174")
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
                self.confidence['barangay'] = 0.90
                
                # If it's Barangay 174, use specific code
                if brgy_num == '174':
                    self.fields['barangay_code'] = '137404174'  # Specific code for Brgy 174
                break
        
        # Extract full street address
        address_keywords = ['ADDRESS', 'RESIDENCE', 'HOME', 'STREET']
        for i, line in enumerate(lines):
            ul = line.upper()
            if any(kw in ul for kw in address_keywords):
                if i + 1 < len(lines):
                    addr_line = lines[i + 1].strip()
                    # Clean up common OCR artifacts
                    addr_line = re.sub(r'[|\\]', '', addr_line)
                    if len(addr_line) > 10:  # Reasonable address length
                        self.fields['full_address'] = addr_line
                        self.confidence['full_address'] = 0.70
                        
                        # Try to extract street/block/lot info
                        if 'BLK' in addr_line.upper() or 'LOT' in addr_line.upper():
                            self.confidence['full_address'] = 0.80
                break
        
        # Fallback: Look for any line with "Caloocan" and surrounding text
        if is_caloocan and not self.fields.get('full_address'):
            for i, line in enumerate(lines):
                if any(ind in line.upper() for ind in caloocan_indicators):
                    # Check previous and next lines for address components
                    addr_parts = []
                    if i > 0:
                        addr_parts.append(lines[i - 1].strip())
                    addr_parts.append(line.strip())
                    if i + 1 < len(lines):
                        addr_parts.append(lines[i + 1].strip())
                    
                    full = ' '.join(addr_parts)
                    if len(full) > 15:
                        self.fields['full_address'] = full
                        self.confidence['full_address'] = 0.60
                    break

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
        combined = front_text + "\n" + back_text
        parser = PHIDParser()
        fields, confidence = parser.parse(combined)
        
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
        
        if not all([email, password, first_name, last_name, dob, gender, contact, barangay, city, province]):
            return jsonify({"error": "Missing required fields"}), 400
        
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO users (email, password_hash, first_name, middle_name, last_name, 
                              date_of_birth, gender, contact_number, barangay, city, province)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (email, hashed, first_name, middle_name, last_name, dob, gender, contact, barangay, city, province))
        
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({"id": user_id, "message": "Registration successful"}), 201
        
    except psycopg2.IntegrityError:
        return jsonify({"error": "Email already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
