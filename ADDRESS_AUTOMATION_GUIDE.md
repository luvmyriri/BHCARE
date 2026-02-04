# 🏠 Address Auto-Population System for Barangay 174, Caloocan

## ✅ What Was Enhanced

### **Smart Caloocan Detection**
- ✅ Detects variations: "CALOOCAN", "KALOOKAN", "KALOOCAN"
- ✅ Auto-populates complete address cascade
- ✅ Extracts barangay numbers from ID

### **Address Cascade Auto-Fill**
When **Caloocan City** is detected, the system automatically sets:

```
Region: National Capital Region (NCR)
  ↓
Province: Metro Manila
  ↓
City: Caloocan City
  ↓
Barangay: [Extracted from ID]
```

### **Barangay Extraction**
Detects multiple formats:
- "Barangay 174"
- "Brgy 174"
- "Brgy. 174"
- "BRGY NO. 174"

---

## 🎯 How It Works

### **Step 1: OCR Scans ID**
Backend searches the ID text for:
1. **City**: "CALOOCAN" keyword
2. **Barangay**: "BRGY 174" pattern
3. **Street Address**: Lines after "ADDRESS" label

### **Step 2: Auto-Populate Cascade**
```javascript
// Detected: CALOOCAN
→ Region: 130000000 (NCR)
→ Province: 133900000 (Metro Manila)
→ City: 137404000 (Caloocan City)
→ Barangay: Extracts "#174" and sets "Barangay 174"
```

### **Step 3: Frontend Updates**
- Region dropdown auto-selects **NCR**
- Province dropdown auto-loads and selects **Metro Manila**
- City dropdown auto-loads and selects **Caloocan City**
- Barangay dropdown auto-loads and selects **Barangay 174**

---

## 📋 Expected Behavior After Scan

### ✅ **Successful Extraction**
```
✓ Auto | Region: National Capital Region
✓ Auto | Province: Metro Manila  
✓ Auto | City: Caloocan City
✓ Auto | Barangay: Barangay 174
~ Low  | Full Address: [Street details if visible]
```

### ~ **Partial Extraction** (Barangay not detected)
```
✓ Auto | Region: National Capital Region
✓ Auto | Province: Metro Manila
✓ Auto | City: Caloocan City
✗ Manual | Barangay: ________ (user selects from dropdown)
```

---

## 🔍 Debug Logs to Watch

### **Browser Console** (during scan):
```
[OCR] Extracted fields: {
  region: "130000000",
  region_name: "National Capital Region (NCR)",
  province: "133900000",
  province_name: "Metro Manila",
  city: "Caloocan City",
  city_code: "137404000",
  barangay: "Barangay 174",
  barangay_code: "137404174"
}

[OCR] Setting region: 130000000
[OCR] Queueing province: 133900000
[OCR] Queueing city: 137404000
[OCR] Queueing barangay: Barangay 174
```

### **Backend Terminal** (after scan):
```
=== EXTRACTED FIELDS ===
city: Caloocan City (confidence: 0.95)
region: 130000000 (confidence: 0.95)
province: 133900000 (confidence: 0.95)
barangay: Barangay 174 (confidence: 0.90)
full_address: [street details] (confidence: 0.70)
```

---

## 🎨 UI Confidence Indicators

| Field | Confidence | Badge | Color |
|-------|-----------|-------|-------|
| Region | 95% | ✓ Auto | Green |
| Province | 95% | ✓ Auto | Green |
| City | 95% | ✓ Auto | Green |
| Barangay | 90% | ✓ Auto | Green |
| Full Address | 70% | ~ Low | Yellow |

---

## 🔧 Configuration for Barangay 174

### **PSGC Codes Used:**
```python
Region: 130000000      # NCR
Province: 133900000    # Metro Manila
City: 137404000        # Caloocan City
Barangay: 137404174    # Barangay 174 (auto-generated)
```

### **Detection Patterns:**
```python
# City Detection
['CALOOCAN', 'KALOOKAN', 'KALOOCAN']

# Barangay Detection
r'BARANGAY\s+(\d+)'      # "BARANGAY 174"
r'BRGY\.?\s*(\d+)'       # "BRGY 174" or "BRGY. 174"
r'BRG?Y\s+(\d+)'         # "BRY 174" (OCR typo)
r'\bBRGY\s+NO\.?\s*(\d+)' # "BRGY NO 174"
```

---

## ✅ Testing Checklist

1. **Upload Driver's License** (front + back)
2. **Click "Scan & Auto-Fill"**
3. **Verify Green Badges appear on:**
   - ✅ Region
   - ✅ Province
   - ✅ City
   - ✅ Barangay (if visible on ID)

4. **Check Browser Console** for:
   ```
   [OCR] Setting region: 130000000
   [OCR] Queueing province: 133900000
   [OCR] Queueing city: 137404000
   [OCR] Queueing barangay: Barangay 174
   ```

5. **Verify Dropdowns Auto-Select:**
   - Region: "National Capital Region (NCR)"
   - Province: "Metro Manila"
   - City: "Caloocan City"
   - Barangay: "Barangay 174"

---

## 🐛 Troubleshooting

### **Address Fields Still Empty**

#### Problem 1: "Caloocan" not detected
**Check**: Backend logs for `city: Caloocan City`
**Fix**: Verify ID clearly shows "CALOOCAN"

#### Problem 2: Dropdowns not loading
**Check**: Browser console for errors
**Fix**: Ensure `psgc.cloud` API is accessible

#### Problem 3: Cascade timing issues
**Check**: Console for "Queueing" messages
**Fix**: Increase setTimeout delays in `LoginForm.tsx` (currently 500ms, 1000ms, 1500ms)

#### Problem 4: Barangay not extracted
**Check**: Backend logs for barangay field
**Fix**: 
- Verify ID shows "Brgy 174" or similar
- If not on ID, user must select manually from dropdown

---

## 📊 Automation Rate for Caloocan IDs

| Scenario | Automation | Manual Entry |
|----------|-----------|---------------|
| **Perfect Quality ID with Brgy** | 100% | 0 fields |
| **ID without Barangay visible** | 75% | 1 field (Brgy) |
| **Poor quality ID** | 50% | 2-3 fields |

---

## 🎯 Next Steps

1. **Restart backend** to load new address logic
2. **Test with actual Caloocan ID**
3. **Verify cascading dropdowns populate**
4. **Check console logs** for address extraction
5. **Submit test registration** to verify database storage

---

## 💡 Future Enhancements

1. **Default to Brgy 174** if extraction fails (since app is for this barangay)
2. **Street address parsing** for Block/Lot/Street extraction
3. **Fuzzy matching** for barangay names
4. **Manual override** option for auto-selected addresses

---

**Last Updated**: February 4, 2026, 6:50 AM
**Status**: ✅ Ready for Testing with Caloocan Address Auto-Fill
