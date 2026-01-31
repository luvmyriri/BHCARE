import React, { useState, useEffect } from 'react';

type Option = { code: string; name: string };

const Input: React.FC<
  { label: string; icon: React.ReactNode; invalid?: boolean } & React.InputHTMLAttributes<HTMLInputElement>
> = ({ label, icon, invalid, ...props }) => (
  <>
    <label>{label}</label>
    <div className={`auth-input${invalid ? ' invalid' : ''}`}>
      <span>{icon}</span>
      <input {...props} />
    </div>
  </>
);

const Select: React.FC<
  { label: string; icon: React.ReactNode; options: Option[]; invalid?: boolean } & React.SelectHTMLAttributes<HTMLSelectElement>
> = ({ label, icon, options, invalid, ...props }) => (
  <>
    <label>{label}</label>
    <div className={`auth-input${invalid ? ' invalid' : ''}`}>
      <span>{icon}</span>
      <select {...props}>
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  </>
);

function LoginForm({ onLoginSuccess }: { onLoginSuccess?: (user: any) => void }) {
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerPwVisible, setRegisterPwVisible] = useState(false);
  const [confirmPwVisible, setConfirmPwVisible] = useState(false);

  const [regions, setRegions] = useState<Option[]>([]);
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [barangays, setBarangays] = useState<Option[]>([]);

  const [regionCode, setRegionCode] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [cityCode, setCityCode] = useState('');

  useEffect(() => {
    fetch('https://psgc.cloud/api/regions')
      .then(res => res.json())
      .then(data => setRegions(data))
      .catch(err => console.error('Failed to fetch regions:', err));
  }, []);

  useEffect(() => {
    if (regionCode) {
      fetch(`https://psgc.cloud/api/regions/${regionCode}/provinces`)
        .then(res => res.json())
        .then(data => {
          if (data.length === 0) {
            setProvinces([]);
            fetch(`https://psgc.cloud/api/regions/${regionCode}/cities-municipalities`)
              .then(res => res.json())
              .then(cityData => setCities(cityData))
              .catch(err => console.error('Failed to fetch cities from region:', err));
          } else {
            setProvinces(data);
            setCities([]);
          }
        })
        .catch(err => console.error('Failed to fetch provinces:', err));
    } else {
      setProvinces([]);
      setCities([]);
    }
    setProvinceCode('');
    setProvince('');
    setCityCode('');
    setBarangays([]);
  }, [regionCode]);

  useEffect(() => {
    if (provinceCode) {
      fetch(`https://psgc.cloud/api/provinces/${provinceCode}/cities-municipalities`)
        .then(res => res.json())
        .then(data => setCities(data))
        .catch(err => console.error('Failed to fetch cities:', err));
    } else if (provinces.length > 0) {
      setCities([]);
    }
    setCityCode('');
    setBarangays([]);
  }, [provinceCode]);

  useEffect(() => {
    if (cityCode) {
      fetch(`https://psgc.cloud/api/cities-municipalities/${cityCode}/barangays`)
        .then(res => res.json())
        .then(data => setBarangays(data))
        .catch(err => console.error('Failed to fetch barangays:', err));
    } else {
      setBarangays([]);
    }
    setBarangay('');
  }, [cityCode]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setRegionCode(code);
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setProvinceCode(code);
    const name = provinces.find(p => p.code === code)?.name || '';
    setProvince(name);
    clearError('province');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setCityCode(code);
    const name = cities.find(c => c.code === code)?.name || '';
    setCity(name);
    clearError('city');
  };

  const handleBarangayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const name = barangays.find(b => b.code === code)?.name || '';
    setBarangay(name);
    clearError('barangay');
  };
  const [idImage, setIdImage] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateName = (name: string) => {
    return !/\d/.test(name);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const checkPasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: '' };
    if (pass.length < 6) return { label: 'Weak', color: 'red' };
    if (pass.length < 10 || !/\d/.test(pass) || !/[a-zA-Z]/.test(pass)) return { label: 'Medium', color: 'orange' };
    return { label: 'Strong', color: 'green' };
  };

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setDob('');
    setGender('');
    setContact('');
    setBarangay('');
    setCity('');
    setProvince('');
    setConfirmPassword('');
    setIdImage(null);
    setIdPreview(null);
    setOcrText('');
    setError('');
    setErrors({});
    setRegionCode('');
    setProvinceCode('');
    setCityCode('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('Invalid email or password');
      const data = await res.json();
      const user = data.user;
      if (user) {
        localStorage.setItem('bh_user', JSON.stringify(user));
        if (typeof onLoginSuccess === 'function') onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setIdImage(file);
    setIdPreview(URL.createObjectURL(file));
  };

  const compressImage = (file: File) => {
    return new Promise<File>((resolve) => {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const maxW = 1600;
            const scale = Math.min(1, maxW / img.width);
            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(img.width * scale);
            canvas.height = Math.floor(img.height * scale);
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(file);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
              (blob) => {
                if (!blob) return resolve(file);
                const newFile = new File([blob], (file.name || 'image').replace(/\.\w+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(newFile);
              },
              'image/jpeg',
              0.8
            );
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      } catch {
        resolve(file);
      }
    });
  };

  const parseOCRAndFill = (text: string) => {
    if (!text) return;

    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const clean = (s: string) => s.replace(/[^A-Za-z\s,.-]/g, '').replace(/\s+/g, ' ').trim();
    const extractAfterLabel = (patterns: RegExp[]) => {
      for (const p of patterns) {
        const i = lines.findIndex(l => p.test(l));
        if (i !== -1) {
          const m = lines[i].match(p);
          if (m && m[1]) {
            const v = clean(m[1]);
            if (v) return v;
          }
          const next = lines[i + 1] ? clean(lines[i + 1]) : '';
          if (next) return next;
        }
      }
      return '';
    };
    const splitName = (full: string) => {
      if (!full) return { f: '', m: '', l: '' };
      const s = clean(full);
      if (!s) return { f: '', m: '', l: '' };
      if (s.includes(',')) {
        const parts = s.split(',').map(x => x.trim());
        const l = parts[0] || '';
        const rest = (parts[1] || '').split(/\s+/);
        const m = rest.length > 1 ? rest[rest.length - 1] : '';
        const f = rest.length > 1 ? rest.slice(0, -1).join(' ') : (parts[1] || '');
        return { f, m, l };
      }
      const tokens = s.split(/\s+/);
      if (tokens.length >= 3) {
        const l = tokens[tokens.length - 1];
        const f = tokens[0];
        const m = tokens.slice(1, -1).join(' ');
        return { f, m, l };
      }
      if (tokens.length === 2) {
        return { f: tokens[0], m: '', l: tokens[1] };
      }
      return { f: s, m: '', l: '' };
    };

    const dlHeaderIndex = lines.findIndex(line => 
      /Last Name[\.,\s]+First Name[\.,\s]+Middle Name/i.test(line)
    );

    if (dlHeaderIndex !== -1 && lines[dlHeaderIndex + 1]) {
      const nameLine = lines[dlHeaderIndex + 1];
      const parts = nameLine.split(',');
      
      if (parts.length >= 2) {
        const lastName = parts[0].trim();
        const rest = parts[1].trim();
        
        const nameParts = rest.split(/\s+/);
        let middleName = '';
        let firstName = rest;

        if (nameParts.length > 1) {
          middleName = nameParts[nameParts.length - 1];
          firstName = nameParts.slice(0, -1).join(' ');
        }

        setLastName(lastName);
        setFirstName(firstName);
        setMiddleName(middleName);
      }
    } else {
      const last = extractAfterLabel([
        /(?:Surname|Last Name)\s*[:\-]?\s*([A-Za-z\s]+)/i
      ]);
      const first = extractAfterLabel([
        /(?:Given Name|First Name)\s*[:\-]?\s*([A-Za-z\s]+)/i
      ]);
      const middle = extractAfterLabel([
        /(?:Middle Name)\s*[:\-]?\s*([A-Za-z\s]+)/i
      ]);
      const full = extractAfterLabel([
        /(?:Full Name|Student Name|Name)\s*[:\-]?\s*([A-Za-z\s,\.]+)/i
      ]);
      if (full && (!first || !last)) {
        const n = splitName(full);
        if (n.l) setLastName(n.l);
        if (n.f) setFirstName(n.f);
        if (n.m) setMiddleName(n.m);
      } else {
        if (last) setLastName(last);
        if (first) setFirstName(first);
        if (middle) setMiddleName(middle);
      }
    }

    const dateRegex = /\b(\d{4})[\/\-\.](\d{2})[\/\-\.](\d{2})\b|\b(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})\b/;
    const dateMatch = text.match(dateRegex);
    
    if (dateMatch) {
      if (dateMatch[1]) {
        setDob(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
      } else if (dateMatch[4]) {
        setDob(`${dateMatch[6]}-${dateMatch[4]}-${dateMatch[5]}`);
      }
    }
    
    const sexIndex = lines.findIndex(l => /Sex|Gender/i.test(l));
    if (sexIndex !== -1) {
      const sexContext = (lines[sexIndex] + " " + (lines[sexIndex+1] || "")).toUpperCase();
      if (/\bM\b/.test(sexContext) || /MALE/.test(sexContext)) setGender('Male');
      else if (/\bF\b/.test(sexContext) || /FEMALE/.test(sexContext)) setGender('Female');
    }
  };

  const handleOCR = async () => {
    if (!idImage) {
      setError('Please upload an ID image first');
      return;
    }

    const formData = new FormData();
    const imgForUpload = await compressImage(idImage);
    formData.append('image', imgForUpload);

    setLoading(true);
    try {
      const res = await fetch('/ocr', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data && (data as any).error ? (data as any).error : 'OCR failed';
        throw new Error(msg as string);
      }
      setOcrText((data as any).text || '');
      parseOCRAndFill((data as any).text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const reqErrors: Record<string, boolean> = {};
    if (!firstName) reqErrors.firstName = true;
    if (!lastName) reqErrors.lastName = true;
    if (!dob) reqErrors.dob = true;
    if (!gender) reqErrors.gender = true;
    if (!contact) reqErrors.contact = true;
    if (!email) reqErrors.email = true;
    if (provinces.length > 0 && !province) reqErrors.province = true;
    if (!city) reqErrors.city = true;
    if (!barangay) reqErrors.barangay = true;
    if (!password) reqErrors.password = true;
    if (!confirmPassword) reqErrors.confirmPassword = true;
    if (Object.keys(reqErrors).length > 0) {
      setErrors(reqErrors);
      setError('Please complete the required fields');
      return;
    }
    if (!validateName(firstName)) {
      setError('First Name should not contain numbers');
      return;
    }
    if (middleName && !validateName(middleName)) {
      setError('Middle Name should not contain numbers');
      return;
    }
    if (!validateName(lastName)) {
      setError('Last Name should not contain numbers');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('middle_name', middleName);
    formData.append('last_name', lastName);
    formData.append('date_of_birth', dob);
    formData.append('gender', gender);
    formData.append('contact_number', contact);
    formData.append('email', email);
    formData.append('barangay', barangay);
    formData.append('city', city);
    formData.append('province', province);
    formData.append('password', password);
    if (idImage) formData.append('id_image', idImage);
    formData.append('ocr_text', ocrText);

    setLoading(true);

    try {
      const res = await fetch('/register', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (data as any) && (data as any).error ? (data as any).error : 'Registration failed';
        throw new Error(msg as string);
      }
      alert('Registration successful!');
      setMode('login');
      resetFields();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: mode === 'login' ? 420 : '100%', margin: '0 auto', boxShadow: 'none' }}>
      {mode === 'login' ? (
        <form onSubmit={handleLogin}>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your account</p>

          <Input
            label="Email Address"
            icon="📧"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <>
            <label>Password</label>
            <div className="auth-input">
              <span>🔒</span>
              <input
                type={loginPwVisible ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setLoginPwVisible((v) => !v)}
                style={{ marginLeft: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                aria-label={loginPwVisible ? 'Hide password' : 'Show password'}
              >
                {loginPwVisible ? 'Hide' : 'Show'}
              </button>
            </div>
          </>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="auth-footer">
            Don’t have an account{' '}
            <span onClick={() => { setMode('register'); resetFields(); }}>
              Sign up
            </span>
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="form-scroll">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Complete all required details</p>

          <label>Upload Valid ID</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} required />
          {idPreview && <img src={idPreview} alt="ID Preview" style={{ width: '100%', marginTop: 10 }} />}

          <button type="button" className="auth-button" onClick={handleOCR}>
            {loading ? 'Scanning...' : 'Scan ID'}
          </button>

          <Input label="First Name" icon="👤" invalid={!!errors.firstName} value={firstName} onChange={(e) => { setFirstName(e.target.value); clearError('firstName'); }} required />
          <Input label="Middle Name" icon="👤" value={middleName} onChange={(e) => { setMiddleName(e.target.value); clearError('middleName'); }} />
          <Input label="Last Name" icon="👤" invalid={!!errors.lastName} value={lastName} onChange={(e) => { setLastName(e.target.value); clearError('lastName'); }} required />
          <Input label="Date of Birth" icon="📅" type="date" invalid={!!errors.dob} value={dob} onChange={(e) => { setDob(e.target.value); clearError('dob'); }} required />

          <label>Gender</label>
          <div className={`auth-input${errors.gender ? ' invalid' : ''}`}>
            <span>⚧️</span>
            <select
              value={gender}
              onChange={(e) => { setGender(e.target.value); clearError('gender'); }}
              required
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <Input label="Contact Number" icon="📞" invalid={!!errors.contact} value={contact} onChange={(e) => { setContact(e.target.value); clearError('contact'); }} required />
          <Input label="Email Address" icon="📧" type="email" invalid={!!errors.email} value={email} onChange={(e) => { setEmail(e.target.value); clearError('email'); }} required />
          
          <Select 
            label="Region" 
            icon="🗺️" 
            options={regions} 
            value={regionCode} 
            onChange={handleRegionChange} 
            required 
          />
          
          {provinces.length > 0 && (
            <Select 
              label="Province" 
              icon="🗺️" 
              options={provinces} 
              value={provinceCode} 
              onChange={handleProvinceChange} 
              disabled={!regionCode}
              invalid={!!errors.province}
            />
          )}

          <Select 
            label="City/Municipality" 
            icon="🏙️" 
            options={cities} 
            value={cityCode} 
            onChange={handleCityChange} 
            disabled={!regionCode}
            invalid={!!errors.city}
            required 
          />
          
          <Select 
            label="Barangay" 
            icon="🏘️" 
            options={barangays} 
            value={barangay} 
            onChange={handleBarangayChange} 
            disabled={!cityCode}
            invalid={!!errors.barangay}
            required 
          />

          <Input label="Province" icon="🗺️" value={province} onChange={(e) => setProvince(e.target.value)} disabled={provinces.length > 0} />

          <div className="password-group">
            <>
              <label>Password</label>
              <div className={`auth-input${errors.password ? ' invalid' : ''}`}>
                <span>🔒</span>
                <input
                  type={registerPwVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setRegisterPwVisible((v) => !v)}
                  style={{ marginLeft: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  aria-label={registerPwVisible ? 'Hide password' : 'Show password'}
                >
                  {registerPwVisible ? 'Hide' : 'Show'}
                </button>
              </div>
            </>
            <div className="password-strength">
              {(() => {
                const s = checkPasswordStrength(password);
                return <span style={{ color: s.color }}>{s.label}</span>;
              })()}
            </div>
          </div>

          <>
            <label>Confirm Password</label>
            <div className={`auth-input${errors.confirmPassword ? ' invalid' : ''}`}>
              <span>🔒</span>
              <input
                type={confirmPwVisible ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setConfirmPwVisible((v) => !v)}
                style={{ marginLeft: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                aria-label={confirmPwVisible ? 'Hide password' : 'Show password'}
              >
                {confirmPwVisible ? 'Hide' : 'Show'}
              </button>
            </div>
          </>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
      )}
    </div>
  );
}

export default LoginForm;
