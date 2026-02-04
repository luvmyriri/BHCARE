import React, { useState, useEffect } from 'react';
import { useLanguage } from './contexts/LanguageContext';

type Option = { code: string; name: string };
type ConfidenceMap = Record<string, number>;

const Input: React.FC<
  { label: string; icon: React.ReactNode; invalid?: boolean; confidence?: number } & React.InputHTMLAttributes<HTMLInputElement>
> = ({ label, icon, invalid, confidence, ...props }) => (
  <div style={{ marginBottom: '12px', position: 'relative' }}>
    <label style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', display: 'flex', alignItems: 'center', marginBottom: '4px', gap: '6px' }}>
      {label}
      {confidence !== undefined && (
        <span style={{
          fontSize: '9px',
          padding: '2px 6px',
          borderRadius: '4px',
          background: confidence > 0.8 ? '#c6f6d5' : confidence > 0.5 ? '#fef3c7' : '#fed7d7',
          color: confidence > 0.8 ? '#22543d' : confidence > 0.5 ? '#744210' : '#742a2a',
          fontWeight: 700
        }}>
          {confidence > 0.8 ? '✓ Auto' : confidence > 0.5 ? '~ Low' : '✗ Manual'}
        </span>
      )}
    </label>
    <div
      className={`auth-input${invalid ? ' invalid' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: confidence && confidence > 0.8 ? 'rgba(198,246,213,0.3)' : 'rgba(255,255,255,0.8)',
        border: invalid ? '1px solid #e53e3e' : confidence && confidence > 0.8 ? '1px solid #48bb78' : '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '8px 12px',
        transition: 'all 0.2s ease',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
      }}
    >
      <span style={{ fontSize: '14px', marginRight: '8px', opacity: 0.7 }}>{icon}</span>
      <input
        {...props}
        style={{
          border: 'none',
          background: 'transparent',
          outline: 'none',
          width: '100%',
          fontSize: '13px',
          color: '#2d3748',
          fontWeight: 500
        }}
      />
    </div>
  </div>
);

const Select: React.FC<
  { label: string; icon: React.ReactNode; options: Option[]; invalid?: boolean; placeholder?: string; confidence?: number } & React.SelectHTMLAttributes<HTMLSelectElement>
> = ({ label, icon, options, invalid, placeholder, confidence, ...props }) => {
  // Ensure options is always a valid array
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', display: 'flex', alignItems: 'center', marginBottom: '4px', gap: '6px' }}>
        {label}
        {confidence !== undefined && (
          <span style={{
            fontSize: '9px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: confidence > 0.8 ? '#c6f6d5' : '#fed7d7',
            color: confidence > 0.8 ? '#22543d' : '#742a2a',
            fontWeight: 700
          }}>
            {confidence > 0.8 ? '✓ Auto' : '✗ Manual'}
          </span>
        )}
      </label>
      <div
        className={`auth-input${invalid ? ' invalid' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: confidence && confidence > 0.8 ? 'rgba(198,246,213,0.3)' : 'rgba(255,255,255,0.8)',
          border: invalid ? '1px solid #e53e3e' : confidence && confidence > 0.8 ? '1px solid #48bb78' : '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '8px 12px',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
        }}
      >
        <span style={{ fontSize: '14px', marginRight: '8px', opacity: 0.7 }}>{icon}</span>
        <select
          {...props}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            width: '100%',
            fontSize: '13px',
            color: '#2d3748',
            fontWeight: 500
          }}
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {safeOptions.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

function LoginForm({ onLoginSuccess }: { onLoginSuccess?: (user: any) => void }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginPwVisible, setLoginPwVisible] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [contact, setContact] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');

  // Detailed street address fields
  const [houseNumber, setHouseNumber] = useState('');
  const [blockNumber, setBlockNumber] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [subdivision, setSubdivision] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerPwVisible, setRegisterPwVisible] = useState(false);
  const [confirmPwVisible, setConfirmPwVisible] = useState(false);

  const [provinces, setProvinces] = useState<Option[]>([]);

  const [regionCode, setRegionCode] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [cityCode, setCityCode] = useState('');

  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const [ocrProcessed, setOcrProcessed] = useState(false);
  const [detectedIDType, setDetectedIDType] = useState('');
  const [confidence, setConfidence] = useState<ConfidenceMap>({});

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Load regions data (OCR will populate address directly via text inputs)
  useEffect(() => {
    // No need to fetch regions since we use text inputs, not dropdowns
  }, [mode]);

  // Load provinces when region is set by OCR (for cascade validation)
  useEffect(() => {
    if (regionCode) {
      fetch(`https://psgc.cloud/api/regions/${regionCode}/provinces`)
        .then(res => res.json())
        .then(data => {
          setProvinces(data);
          // If NCR (no provinces), province field shows Metro Manila directly
        });
    } else {
      setProvinces([]);
    }
  }, [regionCode]);

  // Removed: City and barangay loading (using text inputs instead of dropdowns)


  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const identifyIDType = (text: string) => {
    const clean = text.toUpperCase();
    if (clean.includes("DRIVER") || clean.includes("DRIVE ONLY")) return "Driver's License";
    if (clean.includes("POSTAL") || clean.includes("PHILPOST")) return "Postal ID";
    if (clean.includes("UNIFIED") || clean.includes("CRN")) return "UMID / SSS ID";
    if (clean.includes("PHILHEALTH")) return "PhilHealth ID";
    if (clean.includes("PASSPORT") || clean.includes("REPUBLIKA") || clean.includes("NATIONAL ID")) return "Passport / National ID";
    if (clean.includes("STUDENT")) return "Student ID";
    if (clean.includes("SENIOR") || clean.includes("CITIZEN")) return "Senior Citizen ID";
    return "Government ID";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Invalid email or password');
      const data = await res.json();
      if (data.user) {
        localStorage.setItem('bh_user', JSON.stringify(data.user));
        if (typeof onLoginSuccess === 'function') onLoginSuccess(data.user);
      }
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setIdFront(file); setFrontPreview(URL.createObjectURL(file));
  };

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setIdBack(file); setBackPreview(URL.createObjectURL(file));
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Compression failed'));
          }, 'image/jpeg', 0.85);
        };
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const handleDualOCR = async () => {
    if (!idFront) return;

    console.log('[OCR] Starting scan process...');
    setLoading(true);
    setError('');
    setOcrStatus('Preprocessing images...');

    try {
      const formData = new FormData();

      console.log('[OCR] Compressing front image...');
      setOcrStatus('Compressing front image...');
      const compressedFront = await compressImage(idFront);
      formData.append('front', compressedFront, 'front.jpg');
      console.log('[OCR] Front image compressed:', compressedFront.size, 'bytes');

      if (idBack) {
        console.log('[OCR] Compressing back image...');
        setOcrStatus('Compressing back image...');
        const compressedBack = await compressImage(idBack);
        formData.append('back', compressedBack, 'back.jpg');
        console.log('[OCR] Back image compressed:', compressedBack.size, 'bytes');
      }

      console.log('[OCR] Sending to /ocr-dual endpoint...');
      setOcrStatus('Scanning ID (this may take 10-20 seconds)...');
      const res = await fetch('/ocr-dual', { method: 'POST', body: formData });
      console.log('[OCR] Response received, status:', res.status);

      const data = await res.json();
      console.log('[OCR] Response data:', data);

      if (!res.ok) throw new Error(data.error || 'OCR failed');

      setOcrStatus('Processing extracted data...');


      // Auto-fill fields with confidence tracking
      const { fields, confidence: conf } = data;
      console.log('[OCR] Extracted fields:', fields);
      console.log('[OCR] Confidence scores:', conf);

      if (fields.first_name) setFirstName(fields.first_name);
      if (fields.middle_name) setMiddleName(fields.middle_name);
      if (fields.last_name) setLastName(fields.last_name);
      if (fields.dob) setDob(fields.dob);
      if (fields.gender) setGender(fields.gender);

      // Auto-populate address cascade
      if (fields.region) {
        console.log('[OCR] Setting region:', fields.region);
        setRegionCode(fields.region);
        // Province will auto-load via useEffect
      }

      // Queue province/city/barangay setting after region loads
      if (fields.province) {
        console.log('[OCR] Queueing province:', fields.province);
        setTimeout(() => {
          setProvinceCode(fields.province);
          setProvince(fields.province_name || '');
        }, 500);
      }

      if (fields.city_code) {
        console.log('[OCR] Queueing city:', fields.city_code);
        setTimeout(() => {
          setCityCode(fields.city_code);
          setCity(fields.city || '');
        }, 1000);
      }

      if (fields.barangay) {
        console.log('[OCR] Queueing barangay:', fields.barangay);
        setTimeout(() => {
          setBarangay(fields.barangay);
        }, 1500);
      }

      // Auto-populate detailed street address fields
      if (fields.house_number) setHouseNumber(fields.house_number);
      if (fields.block_number) setBlockNumber(fields.block_number);
      if (fields.lot_number) setLotNumber(fields.lot_number);
      if (fields.street_name) setStreetName(fields.street_name);
      if (fields.subdivision) setSubdivision(fields.subdivision);
      if (fields.zip_code) setZipCode(fields.zip_code);
      if (fields.full_address) setFullAddress(fields.full_address);

      setConfidence(conf || {});
      setDetectedIDType(identifyIDType(data.raw_front || ''));
      setOcrProcessed(true);
      setOcrStatus('');
      console.log('[OCR] Scan complete!');

    } catch (err: any) {
      console.error('[OCR] Error:', err);
      setError(err.message || 'OCR failed. Please try again with a clearer photo.');
      setOcrStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('first_name', firstName);
    formData.append('middle_name', middleName);
    formData.append('last_name', lastName);
    formData.append('dob', dob);
    formData.append('gender', gender);
    formData.append('contact', contact);
    formData.append('barangay', barangay);
    formData.append('city', city);
    formData.append('province', province);

    // Detailed street address fields
    formData.append('house_number', houseNumber);
    formData.append('block_number', blockNumber);
    formData.append('lot_number', lotNumber);
    formData.append('street_name', streetName);
    formData.append('subdivision', subdivision);
    formData.append('zip_code', zipCode);
    formData.append('full_address', fullAddress);


    setLoading(true);
    try {
      const res = await fetch('/register', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      alert('Registration successful!');
      setMode('login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card" style={{
      maxWidth: mode === 'login' ? '360px' : '440px',
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.90)',
      backdropFilter: 'blur(16px)',
      position: 'relative',
      borderRadius: '24px',
      padding: '2px',
      backgroundClip: 'content-box, border-box',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      zIndex: 10
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(247,250,252,0.9))',
        borderRadius: '22px',
        padding: '30px',
        height: '100%',
        width: '100%'
      }}>

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <h2 className="auth-title" style={{ fontSize: '24px', marginBottom: '4px', background: 'linear-gradient(to right, #38b2ac, #ed8936)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>{t.welcome}</h2>
            <p className="auth-subtitle" style={{ fontSize: '13px', marginBottom: '24px', opacity: 0.7 }}>{t.signInSub}</p>

            <Input
              label={t.email}
              icon="📧"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: '4px' }}>{t.password}</label>
              <div className="auth-input" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px' }}>
                <span style={{ fontSize: '14px', marginRight: '8px' }}>🔒</span>
                <input
                  type={loginPwVisible ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={() => setLoginPwVisible((v) => !v)}
                  style={{ marginLeft: '8px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', color: '#3182ce' }}
                >
                  {loginPwVisible ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && <div className="auth-error" style={{ fontSize: '12px', padding: '8px', background: '#fed7d7', color: '#742a2a', borderRadius: '8px', marginBottom: '10px' }}>{error}</div>}

            <button className="auth-button" disabled={loading} style={{ marginTop: '10px', height: '44px', borderRadius: '12px', fontSize: '14px' }}>
              {loading ? t.login + '...' : t.login}
            </button>

            <p className="auth-footer" style={{ fontSize: '12px', marginTop: '20px', textAlign: 'center' }}>
              {t.noAcc}{' '}
              <span onClick={() => { setMode('register'); }} style={{ color: '#ed8936', fontWeight: 700, cursor: 'pointer' }}>
                {t.register}
              </span>
            </p>
          </form>
        ) : !ocrProcessed ? (
          // STEP 1: OCR UPLOAD SCREEN (Show FIRST)
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h2 className="auth-title" style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>📸 Scan Your ID First</h2>
            <p className="auth-subtitle" style={{ fontSize: '11px', marginBottom: '20px', color: '#718096', textAlign: 'center' }}>
              Upload your government ID to automatically fill all fields
            </p>

            <div style={{
              border: '2px dashed #4fd1c5',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '16px',
              background: 'linear-gradient(135deg, rgba(230, 255, 250, 0.6), rgba(207, 250, 254, 0.4))'
            }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px', textAlign: 'center' }}>🪪</span>
              <h3 style={{ color: '#2d3748', marginBottom: '6px', fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>
                Automated Registration
              </h3>
              <p style={{ color: '#718096', fontSize: '11px', marginBottom: '20px', textAlign: 'center' }}>
                Our system will extract your name, birthdate, gender, and address
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 600, color: '#4a5568', marginBottom: '6px', textAlign: 'center' }}>Front Side</p>
                  <input type="file" id="front-upload" accept="image/*" onChange={handleFrontUpload} style={{ display: 'none' }} />
                  {!frontPreview ? (
                    <label htmlFor="front-upload" style={{
                      display: 'block',
                      padding: '40px 10px',
                      background: 'rgba(255,255,255,0.8)',
                      border: '2px dashed #cbd5e0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      color: '#718096',
                      fontWeight: 600,
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}>
                      📷<br />Upload Front
                    </label>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <img src={frontPreview} alt="Front" style={{ width: '100%', borderRadius: '12px', border: '3px solid #48bb78' }} />
                      <button
                        type="button"
                        onClick={() => { setIdFront(null); setFrontPreview(null); }}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: '#e53e3e',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>×</button>
                      <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '4px',
                        background: '#48bb78',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 'bold'
                      }}>✓ Ready</div>
                    </div>
                  )}
                </div>

                <div>
                  <p style={{ fontSize: '10px', fontWeight: 600, color: '#4a5568', marginBottom: '6px', textAlign: 'center' }}>Back Side</p>
                  <input type="file" id="back-upload" accept="image/*" onChange={handleBackUpload} style={{ display: 'none' }} />
                  {!backPreview ? (
                    <label htmlFor="back-upload" style={{
                      display: 'block',
                      padding: '40px 10px',
                      background: 'rgba(255,255,255,0.6)',
                      border: '2px dashed #cbd5e0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      color: '#a0aec0',
                      fontWeight: 600,
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}>
                      📷<br />Upload Back<br />(Optional)
                    </label>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <img src={backPreview} alt="Back" style={{ width: '100%', borderRadius: '12px', border: '3px solid #48bb78' }} />
                      <button
                        type="button"
                        onClick={() => { setIdBack(null); setBackPreview(null); }}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: '#e53e3e',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>×</button>
                      <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '4px',
                        background: '#48bb78',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 'bold'
                      }}>✓ Ready</div>
                    </div>
                  )}
                </div>
              </div>

              {ocrStatus && (
                <div style={{
                  padding: '12px',
                  background: 'rgba(66, 153, 225, 0.15)',
                  borderRadius: '10px',
                  marginBottom: '12px',
                  fontSize: '12px',
                  color: '#2c5282',
                  fontWeight: 600,
                  textAlign: 'center'
                }}>
                  ⏳ {ocrStatus}
                </div>
              )}

              <button
                type="button"
                onClick={handleDualOCR}
                disabled={!idFront || loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: idFront ? 'linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)' : '#cbd5e0',
                  color: idFront ? 'white' : '#a0aec0',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: idFront ? 'pointer' : 'not-allowed',
                  marginBottom: '10px',
                  boxShadow: idFront ? '0 4px 12px rgba(79, 209, 197, 0.4)' : 'none',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? '⏳ Scanning ID...' : '🔍 Start Automatic Scan'}
              </button>

              <button
                type="button"
                onClick={() => { setOcrProcessed(true); }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  color: '#718096',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Skip & Fill Manually →
              </button>
            </div>

            {detectedIDType && (
              <div style={{
                padding: '10px',
                background: '#c6f6d5',
                color: '#22543d',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                textAlign: 'center',
                marginTop: '12px'
              }}>
                ✓ Detected: {detectedIDType}
              </div>
            )}

            {error && (
              <div style={{
                padding: '10px',
                background: '#fed7d7',
                color: '#742a2a',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                textAlign: 'center',
                marginTop: '12px'
              }}>
                ✗ {error}
              </div>
            )}

            <p style={{ fontSize: '10px', color: '#a0aec0', textAlign: 'center', marginTop: '16px' }}>
              Already have an account?{' '}
              <span onClick={() => setMode('login')} style={{ color: '#ed8936', fontWeight: 700, cursor: 'pointer' }}>
                Login here
              </span>
            </p>
          </div>
        ) : (
          // STEP 2: PRE-FILLED REGISTRATION FORM (Show AFTER OCR)
          <form onSubmit={handleRegister} className="form-scroll" style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '5px' }}>
            <h2 className="auth-title" style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>
              {t.createAccount}
            </h2>
            <p className="auth-subtitle" style={{ fontSize: '11px', marginBottom: '6px', color: '#718096' }}>
              Review your auto-filled information below
            </p>

            {detectedIDType && (
              <div style={{
                padding: '8px 12px',
                background: '#c6f6d5',
                color: '#22543d',
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: 600,
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>✓ Scanned: {detectedIDType}</span>
                <button
                  type="button"
                  onClick={() => setOcrProcessed(false)}
                  style={{
                    background: 'rgba(34, 84, 61, 0.1)',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#22543d'
                  }}
                >
                  🔄 Rescan
                </button>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#2d3748', marginBottom: '8px' }}>📝 Personal Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Input label={t.firstName} icon="👤" confidence={confidence.first_name} value={firstName} onChange={(e) => { setFirstName(e.target.value); clearError('firstName'); }} required />
                <Input label={t.lastName} icon="👤" confidence={confidence.last_name} value={lastName} onChange={(e) => { setLastName(e.target.value); clearError('lastName'); }} required />
              </div>

              <Input label={t.middleName} icon="👤" confidence={confidence.middle_name} value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
              <Input label={t.dob} icon="📅" type="date" confidence={confidence.dob} value={dob} onChange={(e) => setDob(e.target.value)} required />

              <Select
                label={t.gender}
                icon="⚧"
                confidence={confidence.gender}
                options={[
                  { code: 'Male', name: t.male },
                  { code: 'Female', name: t.female },
                  { code: 'Other', name: t.other }
                ]}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              />

              <Input label={t.contact} icon="📱" type="tel" value={contact} onChange={(e) => setContact(e.target.value)} required />
              <Input label={t.email} icon="📧" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#2d3748', marginBottom: '8px', marginTop: '16px' }}>🏠 Address (Auto-filled via OCR)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Input
                  label="Region"
                  icon="📍"
                  confidence={confidence.region}
                  value={province ? "National Capital Region (NCR)" : ""}
                  onChange={(e) => { }}
                  required
                  disabled
                />
                <Input
                  label="Province"
                  icon="📍"
                  confidence={confidence.province}
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                  placeholder="Metro Manila"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Input
                  label="City"
                  icon="🏙️"
                  confidence={confidence.city}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder="Caloocan City"
                />
                <Input
                  label="Barangay"
                  icon="🏡"
                  confidence={confidence.barangay}
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  required
                  placeholder="Barangay 174"
                />
              </div>

              {/* Detailed Street Address */}
              <h4 style={{ fontSize: '11px', fontWeight: 600, color: '#718096', marginTop: '12px', marginBottom: '6px' }}>📍 Street Address Details (Optional)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <Input
                  label="Block"
                  icon="🔢"
                  confidence={confidence.block_number}
                  value={blockNumber}
                  onChange={(e) => setBlockNumber(e.target.value)}
                  placeholder="Block 9"
                />
                <Input
                  label="Lot"
                  icon="🔢"
                  confidence={confidence.lot_number}
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  placeholder="Lot 30"
                />
                <Input
                  label="House #"
                  icon="🏠"
                  confidence={confidence.house_number}
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="123"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Input
                  label="Street Name"
                  icon="🛣️"
                  confidence={confidence.street_name}
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  placeholder="Ruby St"
                />
                <Input
                  label="ZIP Code"
                  icon="📮"
                  confidence={confidence.zip_code}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="1421"
                />
              </div>
              <Input
                label="Subdivision/Village"
                icon="🏘️"
                confidence={confidence.subdivision}
                value={subdivision}
                onChange={(e) => setSubdivision(e.target.value)}
                placeholder="Celina Homes 3"
              />


              <div style={{ marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: '4px' }}>{t.createPw}</label>
                  <div className="auth-input" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px' }}>
                    <span style={{ fontSize: '14px', marginRight: '8px' }}>🔒</span>
                    <input
                      type={registerPwVisible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '13px' }}
                    />
                    <button type="button" onClick={() => setRegisterPwVisible(v => !v)} style={{ marginLeft: '8px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '10px', color: '#3182ce', fontWeight: 600 }}>{registerPwVisible ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: '4px' }}>{t.confirmPw}</label>
                  <div className="auth-input" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px' }}>
                    <span style={{ fontSize: '14px', marginRight: '8px' }}>🔒</span>
                    <input
                      type={confirmPwVisible ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '13px' }}
                    />
                    <button type="button" onClick={() => setConfirmPwVisible(v => !v)} style={{ marginLeft: '8px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '10px', color: '#3182ce', fontWeight: 600 }}>{confirmPwVisible ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
              </div>

              {error && <div style={{ background: '#fed7d7', color: '#742a2a', padding: '8px', borderRadius: '8px', fontSize: '11px', marginBottom: '10px', fontWeight: 600 }}>{error}</div>}

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button type="button" onClick={() => setOcrProcessed(false)} style={{ flex: 1, padding: '8px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#4a5568', fontWeight: 600, fontSize: '11px' }}>
                  ← Rescan
                </button>
                <button className="auth-button" style={{ margin: 0, flex: 2, height: '36px', fontSize: '12px' }} disabled={loading}>
                  {loading ? 'Submitting...' : t.submit}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginForm;
