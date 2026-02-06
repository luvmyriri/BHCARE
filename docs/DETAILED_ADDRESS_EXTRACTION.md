# 🏠 Detailed Street Address Extraction via OCR

**Status**: ✅ **IMPLEMENTED** (February 4, 2026, 1:50 PM)  
**Feature**: Automatic extraction of granular street address components

---

## 🎯 **Overview**

Your OCR system now extracts **detailed street address components** from government IDs, including:

- 🏠 **House Number** (e.g., "123")
- 📦 **Block Number** (e.g., "Block 9") 
- 📍 **Lot Number** (e.g., "Lot 30")
- 🛣️ **Street Name** (e.g., "Ruby St")
- 🏘️ **Subdivision/Village** (e.g., "Celina Homes 3")
- 📮 **ZIP Code** (e.g., "1421")
- 📝 **Full Address** (complete address string)

---

## 📋 **Example: Driver's License Address**

### **OCR Input**:
```
Address:
BLK 9 LOT 30, RUBY ST CELINA HOMES 3 BAGUMBONG,
BARANGAY 171, CALOOCAN CITY, NCR, THIRD DISTRICT, 1421
```

### **Extracted Components**:
```javascript
{
  house_number: "",              // Not detected (not present)
  block_number: "Block 9",       // ✅ Extracted
  lot_number: "Lot 30",          // ✅ Extracted
  street_name: "Ruby St",        // ✅ Extracted
  subdivision: "Celina Homes 3", // ✅ Extracted
  barangay: "Barangay 171",      // ✅ Extracted
  city: "Caloocan City",         // ✅ Extracted
  province: "Metro Manila",      // ✅ Auto-set (NCR)
  zip_code: "1421"               // ✅ Extracted
}
```

---

## 🔍 **How It Works**

### **1. Full Address Detection**
- Looks for labels: "ADDRESS", "RESIDENCE", "HOME", "STREET"
- Extracts the line immediately after the label
- Example: `"BLK 9 LOT 30, RUBY ST CELINA HOMES 3..."`

### **2. Component Parsing**
Once full address is found, the system uses **regex patterns** to extract:

#### **Block Number**:
- Pattern: `BLK 9`, `BLOCK 9`, `BLK. 9`
- Returns: `"Block 9"`

#### **Lot Number**:
- Pattern: `LOT 30`, `LOT. 30`, `L 30`
- Returns: `"Lot 30"`

#### **House Number**:
- Pattern: Standalone number at start (e.g., `"123 Main St"`)
- Returns: `"123"`

#### **Street Name**:
- Patterns: 
  - `"RUBY ST"`, `"MAIN STREET"`, `"SAMPAGUITA RD"`
  - `"[Name] + [ST|STREET|RD|ROAD|AVE|BLVD|DRIVE|LANE]"`
- Returns: `"Ruby St"` (title-cased)

#### **Subdivision/Village**:
- Patterns:
  - `"CELINA HOMES 3"`, `"VILLA VERDE  SUBDIVISION"`, `"GREENFIELD HEIGHTS"`
  - `"[Name] + [HOMES|VILLAGE|SUBDIVISION|VILLAS|HEIGHTS|ESTATES|HILLS|GARDENS|PARK|RESIDENCES] + [Optional Number]"`
- Returns: `"Celina Homes 3"` (title-cased)

#### **ZIP Code**:
- Pattern: 4-digit number between 1000-9999
- Returns: `"1421"`

---

## 📊 **Database Schema**

### **New Columns Added** to `users` table:
```sql
house_number    VARCHAR(20)   -- House/building number
block_number    VARCHAR(20)   -- Block number  
lot_number      VARCHAR(20)   -- Lot number
street_name     VARCHAR(100)  -- Street name
subdivision     VARCHAR(100)  -- Subdivision/village name
zip_code        VARCHAR(10)   -- Philippine ZIP code
full_address    VARCHAR(500)  -- Complete address string
```

All fields are **optional** (nullable) - filled only if OCR detects them.

---

## 🎨 **UI Implementation**

### **Registration Form Layout**:

```
🏠 Address (Auto-filled via OCR)
┌──────────────┬──────────────┐
│ Region (NCR) │ Province     │
├──────────────┼──────────────┤
│ City         │ Barangay     │
└──────────────┴──────────────┘

📍 Street Address Details (Optional)
┌──────┬──────┬──────────┐
│ Block│ Lot  │ House #  │
├──────────┬──────────┤
│ Street   │ ZIP Code │
└──────────┴──────────┘
┌─────────────────────────┐
│ Subdivision/Village     │
└─────────────────────────┘
```

### **Visual Features**:
- Green checkmarks (✓) show OCR confidence
- Fields are **editable** - users can verify/correct
- Placeholders guide users if OCR fails
- Compact 3-column and 2-column grids

---

## 🧪 **Testing Examples**

### **Test Case 1: Complete Address**
**Input**:
```
BLK 5 LOT 12, SAMPAGUITA ST SAN JOSE VILLAGE, 
BARANGAY 174, CALOOCAN CITY, 1420
```

**Expected Output**:
```
block_number: "Block 5"
lot_number: "Lot 12"
street_name: "Sampaguita St"
subdivision: "San Jose Village"
barangay: "Barangay 174"
city: "Caloocan City"
zip_code: "1420"
```

### **Test Case 2: Minimal Address**
**Input**:
```
BARANGAY 174, CALOOCAN CITY, NCR
```

**Expected Output**:
```
barangay: "Barangay 174"
city: "Caloocan City"
province: "Metro Manila"
(Other fields remain empty - user can fill manually if needed)
```

### **Test Case 3: House Number**
**Input**:
```
123 MABINI STREET, BARANGAY 174, CALOOCAN
```

**Expected Output**:
```
house_number: "123"
street_name: "Mabini Street"
barangay: "Barangay 174"
city: "Caloocan City"
```

---

## ✅ **Benefits**

| Benefit | Description |
|---------|-------------|
| **Granular Data** | Store detailed address components, not just city/barangay |
| **Better Search** | Search by street, subdivision, or block |
| **Validation Ready** | Validate specific components (e.g., ZIP code format) |
| **User Verification** | Users can edit individual fields easily |
| **Google Maps Integration** | Can reconstruct full address for mapping |

---

## 🔧 **Backend Processing**

### **File**: `backEnd/app.py`

#### **Method**: `_parse_address_components()`
```python
def _parse_address_components(self, address_text):
    """Parse detailed address components from full address string"""
    
    # Extract Block: "BLK 9" → "Block 9"
    block_match = re.search(r'BLK\.?\s*(\d+)|BLOCK\s+(\d+)', upper_addr)
    
    # Extract Lot: "LOT 30" → "Lot 30"
    lot_match = re.search(r'LOT\.?\s*(\d+)', upper_addr)
    
    # Extract Street: "RUBY ST" → "Ruby St"
    street_match = re.search(r'([A-Z\s]+?)\s+(ST|STREET|RD|ROAD)', upper_addr)
    
    # Extract Subdivision: "CELINA HOMES 3" → "Celina Homes 3"
    subdiv_match = re.search(r'([A-Z\s]+?)\s+(HOMES|VILLAGE|SUBDIVISION)', upper_addr)
    
    # Extract ZIP: "1421" → "1421" (validate 1000-9999)
    zip_match = re.search(r'\b(\d{4})\b', upper_addr)
```

### **Debug Logs**:
```
[ADDRESS] Block: 9
[ADDRESS] Lot: 30
[ADDRESS] Street: Ruby St
[ADDRESS] Subdivision: Celina Homes 3
[ADDRESS] ZIP: 1421
```

---

## 📝 **Frontend Integration**

### **State Variables** (LoginForm.tsx):
```typescript
const [houseNumber, setHouseNumber] = useState('');
const [blockNumber, setBlockNumber] = useState('');
const [lotNumber, setLotNumber] = useState('');
const [streetName, setStreetName] = useState('');
const [subdivision, setSubdivision] = useState('');
const [zipCode, setZipCode] = useState('');
const [fullAddress, setFullAddress] = useState('');
```

### **OCR Auto-Population**:
```typescript
// After OCR scan completes
if (fields.house_number) setHouseNumber(fields.house_number);
if (fields.block_number) setBlockNumber(fields.block_number);
if (fields.lot_number) setLotNumber(fields.lot_number);
if (fields.street_name) setStreetName(fields.street_name);
if (fields.subdivision) setSubdivision(fields.subdivision);
if (fields.zip_code) setZipCode(fields.zip_code);
```

### **Form Submission**:
```typescript
formData.append('house_number', houseNumber);
formData.append('block_number', blockNumber);
formData.append('lot_number', lotNumber);
formData.append('street_name', streetName);
formData.append('subdivision', subdivision);
formData.append('zip_code', zipCode);
formData.append('full_address', fullAddress);
```

---

## 🚀 **Deployment**

✅ **Database Migration**: Applied (new columns added)
✅ **Backend**: Updated with parsing logic
✅ **Frontend**: Added input fields and state management
✅ **Servers**: Both restarted and ready

**Test Now**: Upload a driver's license with detailed address!

---

## 💡 **Future Enhancements**

1. **Smart Defaults**: If no house number, suggest using block/lot combo
2. **Address Validation**: Validate against Philippine postal codes database
3. **Google Maps Integration**: Auto-complete address suggestions
4. **Geolocation**: Pin exact coordinates from detailed address
5. **Export Format**: Generate formatted mailing labels

---

**Last Updated**: February 4, 2026, 1:50 PM  
**Status**: ✅ Production Ready  
**Impact**: Major (Granular address data capture)
