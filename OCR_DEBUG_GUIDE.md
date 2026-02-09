# 🔍 OCR Testing & Debugging Guide

## ✅ Current Status
- ✅ Backend running on http://127.0.0.1:5000
- ✅ Frontend running (npm start active)
- ✅ All dependencies installed
- ✅ Debug logging enabled

---

## 🧪 How to Test the OCR Scan

### Step 1: Open Browser Console
1. Open your app in the browser (localhost:3000)
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. Keep it open while testing

### Step 2: Try Scanning an ID
1. Click "Register Your Account"
2. Upload **front** of your ID
3. (Optional) Upload **back** of your ID
4. Click **"🔍 Scan & Auto-Fill"**

### Step 3: Watch the Logs

#### In Browser Console (Frontend)
You'll see messages like:
```
[OCR] Starting scan process...
[OCR] Compressing front image...
[OCR] Front image compressed: 125487 bytes
[OCR] Sending to /ocr-dual endpoint...
[OCR] Response received, status: 200
[OCR] Response data: { fields: {...}, confidence: {...} }
[OCR] Extracted fields: { first_name: "Gene", ... }
[OCR] Confidence scores: { first_name: 0.9, ... }
[OCR] Scan complete!
```

#### In Backend Terminal
You'll see messages like:
```
=== PROCESSING FRONT ID ===
FRONT OCR:
REPUBLIC OF THE PHILIPPINES
...

=== EXTRACTED FIELDS ===
first_name: Gene (confidence: 0.90)
last_name: Tabios (confidence: 0.90)
...
```

---

## 🐛 Troubleshooting "Does Not Proceed" Issue

### Common Problems & Solutions

#### 1. **Stuck at "Preprocessing images..."**
**Symptom**: Status stays on this message
**Cause**: Frontend compression function issue
**Solution**: 
- Check browser console for errors
- Verify image file is valid (try smaller image)

#### 2. **Stuck at "Scanning ID..."**
**Symptom**: Status shows this for >30 seconds
**Cause**: Backend OCR API timeout
**Solutions**:
- Check OCR API key is valid in `.env`
- Check internet connection
- Backend terminal may show error

#### 3. **Error: "OCR failed"**
**Symptom**: Red error message appears
**Cause**: Multiple possible causes
**Solutions**:
- Check backend terminal for detailed error
- Verify image is not corrupted
- Check API key limit not exceeded

#### 4. **Network Error / 404**
**Symptom**: Console shows "Failed to fetch" or "404 Not Found"
**Cause**: Proxy not configured
**Solution**: Check `package.json` has proxy:
```json
{
  "proxy": "http://localhost:5000"
}
```

#### 5. **Nothing Happens**
**Symptom**: Button click does nothing
**Cause**: Frontend not loading or JavaScript error
**Solutions**:
- Check browser console for errors
- Refresh page (Ctrl+F5)
- Clear browser cache

---

## 📊 Expected Behavior

### Successful Scan Timeline:
```
0s   → "Preprocessing images..."
1s   → "Compressing front image..."
2s   → "Compressing back image..." (if uploaded)
3s   → "Scanning ID (this may take 10-20 seconds)..."
15s  → "Processing extracted data..."
16s  → Form auto-filled with green/yellow/red badges
```

### If It Takes Longer:
- **15-25 seconds is normal** for OCR.space API
- **>30 seconds** = likely timeout/error

---

## 🔧 Quick Fixes

### Fix 1: Restart Backend
```bash
# In terminal running python app.py
Ctrl+C
python app.py
```

### Fix 2: Clear Frontend Cache
```bash
# In browser
Ctrl+Shift+Delete → Clear cache
Refresh page (Ctrl+F5)
```

### Fix 3: Check API Key
```bash
# In backEnd/.env
OCR_API_KEY=K88909934388957  # Should have a valid key here
```

---

## 📝 Specific Error Messages

### "No module named 'bcrypt'"
**Fix**: `python -m pip install bcrypt`

### "OCR API error: 401"
**Fix**: Invalid API key. Get new key from ocr.space

### "OCR API error: 400"
**Fix**: Image too large or corrupt. Backend preprocessing should handle this.

### "Front image required"
**Fix**: Make sure image is uploaded before clicking scan

---

## ✅ Verification Checklist

Before reporting issues, verify:
- [ ] Backend is running (see "Running on http://127.0.0.1:5000")
- [ ] Frontend is running (npm start)
- [ ] Browser console is open
- [ ] Image is uploaded successfully (preview appears)
- [ ] Clicked "Scan & Auto-Fill" button
- [ ] Waited at least 30 seconds
- [ ] Checked both browser console AND backend terminal for errors

---

## 🎯 Next Steps After Successful Scan

1. **Review auto-filled fields** (look for badges)
2. **Manually correct** any yellow/red badged fields
3. **Fill remaining required fields** (contact, email, passwords)
4. **Submit registration**

---

## 📞 If Still Not Working

Share these details:
1. **Browser Console error** (copy full error message)
2. **Backend Terminal error** (copy full traceback)
3. **What step it gets stuck on** (exact status message)
4. **Screenshot of the UI** when it stops progressing

---

**Last Updated**: February 4, 2026, 6:40 AM
