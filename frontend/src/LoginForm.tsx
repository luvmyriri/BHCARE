import { useState, FC, ReactNode, InputHTMLAttributes, SelectHTMLAttributes, FormEvent, ChangeEvent, useEffect } from 'react';
import { useLanguage } from './contexts/LanguageContext';

type Option = { code: string; name: string };
type ConfidenceMap = Record<string, number>;

const Input: FC<
  { label: string; icon: ReactNode; invalid?: boolean; confidence?: number } & InputHTMLAttributes<HTMLInputElement>
> = ({ label, icon, invalid, confidence, ...props }) => (
  <div style={{ marginBottom: '16px', position: 'relative' }}>
    <label style={{ fontSize: '12px', fontWeight: 700, color: '#4a5568', display: 'flex', alignItems: 'center', marginBottom: '6px', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label}
      {confidence !== undefined && confidence > 0 && (
        <span style={{
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '4px',
          background: '#c6f6d5',
          color: '#22543d',
          fontWeight: 700,
          textTransform: 'none',
          letterSpacing: '0'
        }}>
          ✓ Auto
        </span>
      )}
    </label>
    <div
      className={`auth-input${invalid ? ' invalid' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: confidence && confidence > 0 ? 'rgba(198,246,213,0.3)' : '#f7fafc',
        border: invalid ? '2px solid #e53e3e' : confidence && confidence > 0 ? '2px solid #48bb78' : '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '10px 14px',
        transition: 'all 0.2s ease',
        boxShadow: 'none'
      }}
    >
      <span style={{ fontSize: '16px', marginRight: '10px', opacity: 0.5 }}>{icon}</span>
      <input
        {...props}
        autoComplete="new-password"
        style={{
          border: 'none',
          background: 'transparent',
          outline: 'none',
          width: '100%',
          fontSize: '15px',
          color: '#1a202c',
          fontWeight: 500
        }}
      />
    </div>
  </div>
);

const Select: FC<
  { label: string; icon: ReactNode; options: Option[]; invalid?: boolean; placeholder?: string; confidence?: number } & SelectHTMLAttributes<HTMLSelectElement>
> = ({ label, icon, options, invalid, placeholder, confidence, ...props }) => {
  // Ensure options is always a valid array
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '12px', fontWeight: 700, color: '#4a5568', display: 'flex', alignItems: 'center', marginBottom: '6px', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
        {confidence !== undefined && confidence > 0 && (
          <span style={{
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: '#c6f6d5',
            color: '#22543d',
            fontWeight: 700,
            textTransform: 'none',
            letterSpacing: '0'
          }}>
            ✓ Auto
          </span>
        )}
      </label>
      <div
        className={`auth-input${invalid ? ' invalid' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: confidence && confidence > 0 ? 'rgba(198,246,213,0.3)' : '#f7fafc',
          border: invalid ? '2px solid #e53e3e' : confidence && confidence > 0 ? '2px solid #48bb78' : '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: 'none'
        }}
      >
        <span style={{ fontSize: '16px', marginRight: '10px', opacity: 0.5 }}>{icon}</span>
        <select
          {...props}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            width: '100%',
            fontSize: '14px',
            color: '#1a202c',
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

function LoginForm({ onLoginSuccess, initialMode = 'login' }: { onLoginSuccess?: (user: any) => void; initialMode?: 'login' | 'register' }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginPwVisible, setLoginPwVisible] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [contact, setContact] = useState('+63');
  const [philhealthId, setPhilhealthId] = useState('');
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
  const [passwordFocused, setPasswordFocused] = useState(false);


  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const [ocrProcessed, setOcrProcessed] = useState(false);
  const [detectedIDType, setDetectedIDType] = useState('');
  const [confidence, setConfidence] = useState<ConfidenceMap>({});

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [passwordCriteria, setPasswordCriteria] = useState({ length: false, upper: false, symbol: false });

  // Forgot Password Modal State
  const [forgotEmail, setForgotEmail] = useState('');

  // 3-Step Reset Password Flow State
  // Steps: 'email' -> 'verify' -> 'reset'
  const [resetStep, setResetStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [showResetModal, setShowResetModal] = useState(false);

  // Step 2: Verification
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Step 3: New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  // Reset Password UI State
  const [resetPwVisible, setResetPwVisible] = useState(false);
  const [resetConfirmPwVisible, setResetConfirmPwVisible] = useState(false);
  const [resetPwFocused, setResetPwFocused] = useState(false);
  const [resetPasswordCriteria, setResetPasswordCriteria] = useState({ length: false, upper: false, symbol: false });

  useEffect(() => {
    setResetPasswordCriteria({
      length: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      symbol: /[^a-zA-Z0-9\s]/.test(newPassword)
    });
  }, [newPassword]);

  // Timber Logic
  useEffect(() => {
    let interval: any;
    if (showResetModal && resetStep === 'verify' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [showResetModal, resetStep, timer]);

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetMessage('');

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send code');

      setResetStep('verify');
      setTimer(60);
      setCanResend(false);
      setResetMessage('Code sent successfully!');
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');

    const code = verificationCode.join('');
    if (code.length !== 6) {
      setResetError('Please enter the complete 6-digit code');
      setResetLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) throw new Error(data.error || 'Invalid code');

      setResetStep('reset');
      setResetMessage('');
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent pasting multiple chars (simple version)

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetMessage('');

    if (newPassword !== confirmNewPassword) {
      setResetError('Passwords do not match');
      setResetLoading(false);
      return;
    }

    const code = verificationCode.join('');

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code, password: newPassword }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setResetMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        closeResetModal();
      }, 2000);

    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetStep('email');
    setForgotEmail('');
    setVerificationCode(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmNewPassword('');
    setResetPwVisible(false);
    setResetConfirmPwVisible(false);
    setResetPwFocused(false);
    setResetMessage('');
    setResetError('');
  };

  useEffect(() => {
    setPasswordCriteria({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      symbol: /[^a-zA-Z0-9\s]/.test(password)
    });
  }, [password]);

  const scrollToError = () => {
    const errorEl = document.querySelector('.error-message-box');
    if (errorEl) errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const formatPHPhone = (input: string) => {
    // Remove all non-numeric characters except +
    let cleaned = input.replace(/[^\d+]/g, '');

    // Process common PH formats
    if (cleaned.startsWith('09') && cleaned.length === 11) {
      cleaned = '+63' + cleaned.substring(1);
    } else if (cleaned.startsWith('9') && cleaned.length === 10) {
      cleaned = '+63' + cleaned;
    } else if (cleaned.startsWith('639') && cleaned.length === 12) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  };


  // Removed: City and barangay loading (using text inputs instead of dropdowns)


  // Removed clearError as it is replaced by dynamic validation in handleInputChange

  const resetFormFields = () => {
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setDob('');
    setGender('');
    setContact('+63');
    setPhilhealthId('');
    setBarangay('');
    setCity('');
    setProvince('');
    setHouseNumber('');
    setBlockNumber('');
    setLotNumber('');
    setStreetName('');
    setSubdivision('');
    setZipCode('');
    setFullAddress('');
    setConfidence({});
    setDetectedIDType('');
    setError('');
    setOcrStatus('');
    // Note: ID images (idFront/idBack) and previews (frontPreview/backPreview)
    // are intentionally preserved here to avoid re-uploading on rescan.
    // Note: email and password are intentionally not reset here 
    // to allow users to keep their credentials if they swap modes,
    // but they can be added if the user specifically wants a total wipe.
    setConfirmPassword('');
  };

  const identifyIDType = (text: string) => {
    const clean = text.toUpperCase();
    if (clean.includes("DRIVER") || clean.includes("DRIVE ONLY")) return "Driver's License";
    if (clean.includes("POSTAL") || clean.includes("PHILPOST")) return "Postal ID";
    if (clean.includes("UNIFIED") || clean.includes("CRN") || clean.includes("SSS") || clean.includes("GSIS")) return "UMID / SSS / GSIS ID";
    if (clean.includes("PHILHEALTH")) return "PhilHealth ID";
    if (clean.includes("PASSPORT") || clean.includes("REPUBLIKA") || clean.includes("NATIONAL ID")) return "Passport / National ID";
    if (clean.includes("STUDENT")) return "Student ID";
    if (clean.includes("PRC") || clean.includes("PROFESSIONAL REGULATION")) return "PRC ID";
    if (clean.includes("VOTER") || clean.includes("KOMISYON SA HALALAN")) return "Voter's ID";
    if (clean.includes("SENIOR") || clean.includes("CITIZEN")) return "Senior Citizen ID";
    if (clean.includes("PWD") || clean.includes("PERSON WITH DISABILITY")) return "PWD ID";
    if (clean.includes("SOLO PARENT")) return "Solo Parent ID";
    if (clean.includes("TIN") || clean.includes("TAX IDENTIFICATION")) return "TIN ID";
    return "Government ID";
  };


  const formatName = (val: string) => {
    return val.replace(/[^a-zA-Z\s'-.]/g, '');
  };

  const formatPhilHealthId = (val: string) => {
    // Remove non-digits
    const cleaned = val.replace(/\D/g, '');

    // Format: XX-XXXXXXXXX-X (12 digits)
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.substring(0, 2) + '-' + cleaned.substring(2);
    }
    if (cleaned.length > 11) {
      formatted = formatted.substring(0, 12) + '-' + cleaned.substring(11, 12);
    }

    // Max 12 digits -> 14 chars with dashes
    if (formatted.length > 14) formatted = formatted.substring(0, 14);

    return formatted;
  };

  const validateField = (field: string, value: string) => {
    let isValid = true;

    // We update errors functionally to avoid closure staleness
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };

      // Common required check
      if (!value) {
        newErrors[field] = true;
        isValid = false;
      } else {
        delete newErrors[field];
      }

      // Specific checks
      if (field === 'email' && value) {
        const emailDomainRegex = /@((gmail\.com)|(yahoo\.com)|(hotmail\.com)|(.*\.gov(\.ph)?))$/i;
        const emailFormatRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailFormatRegex.test(value) || !emailDomainRegex.test(value)) {
          newErrors[field] = true;
          isValid = false;
        }
      }

      if (field === 'contact' && value) {
        if (value.length < 13) {
          newErrors[field] = true;
          isValid = false;
        }
      }

      if (field === 'password' && value) {
        // Require at least one non-alphanumeric character (excluding space), one uppercase, min 8 chars, no spaces.
        const passwordRegex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s])(?!.*[\s]).{8,}$/;
        if (!passwordRegex.test(value)) {
          newErrors[field] = true;
          isValid = false;
        }
      }

      if (field === 'confirmPassword' && value) {
        if (value !== password) {
          newErrors[field] = true;
          isValid = false;
        }
      }

      return newErrors;
    });

    return isValid;
  };

  const handleInputChange = (field: string, value: string, setter: (v: string) => void) => {
    let finalValue = value;
    if (field === 'contact') {
      finalValue = formatPHPhone(value);
    }
    setter(finalValue);
    // If the field is already invalid, validate immediately on change to clear error if fixed
    if (errors[field]) {
      validateField(field, finalValue);
    }
  };



  const handleLogin = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/api/login', {
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



  const handleFrontUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setIdFront(file); setFrontPreview(URL.createObjectURL(file));
  };

  const handleBackUpload = (e: ChangeEvent<HTMLInputElement>) => {
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
    resetFormFields(); // Clear previous data before new scan
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

      const res = await fetch('/api/ocr-dual', { method: 'POST', body: formData });
      console.log('[OCR] Response received, status:', res.status);

      let data;
      const text = await res.text();

      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('[OCR] Failed to parse JSON response:', text);
        throw new Error(`Server returned invalid response: ${text.substring(0, 100)}...`);
      }

      console.log('[OCR] Response data:', data);

      if (!res.ok) throw new Error(data.error || `OCR failed with status ${res.status}`);

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
      if (fields.contact) setContact(formatPHPhone(fields.contact));
      if (fields.phone) setContact(formatPHPhone(fields.phone));
      if (fields.email) setEmail(fields.email);
      if (fields.philhealth_id) setPhilhealthId(fields.philhealth_id);

      // Auto-populate address details
      if (fields.province_name) setProvince(fields.province_name);
      else if (fields.province) setProvince(fields.province);

      // Auto-populate address fields directly
      if (fields.province_name) setProvince(fields.province_name);
      if (fields.city) setCity(fields.city);

      if (fields.barangay) {
        console.log('[OCR] Queueing barangay:', fields.barangay);
        setBarangay(fields.barangay);
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

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    const newErrors: Record<string, boolean> = {};

    // Required Fields Check
    if (!firstName) newErrors.firstName = true;
    if (!lastName) newErrors.lastName = true;
    if (!email) newErrors.email = true;
    if (!password) newErrors.password = true;
    if (!confirmPassword) newErrors.confirmPassword = true;
    if (!dob) newErrors.dob = true;
    if (!contact) newErrors.contact = true;
    if (!barangay) newErrors.barangay = true;
    if (!city) newErrors.city = true;
    if (!province) newErrors.province = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError('Please fill in all required fields.');
      setTimeout(scrollToError, 100);
      return;
    }

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setErrors({ ...newErrors, password: true, confirmPassword: true });
      setTimeout(scrollToError, 100);
      return;
    }

    // Password Complexity Check
    // Require at least one non-alphanumeric character (excluding space), one uppercase, min 8 chars, no spaces.
    const passwordRegex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s])(?!.*[\s]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long, contain at least one uppercase letter, and one special character (symbol). No spaces allowed.');
      setErrors({ ...newErrors, password: true });
      setTimeout(scrollToError, 100);
      return;
    }

    // New Validations
    // PH Phone Validation (+639XXXXXXXXX)
    const phoneRegex = /^\+639\d{9}$/;
    if (!phoneRegex.test(contact)) {
      setError('Please enter a valid Philippine mobile number (+639XXXXXXXXX)');
      setErrors({ ...newErrors, contact: true });
      setTimeout(scrollToError, 100);
      return;
    }

    // Strict Email Validation
    // Allowed: gmail.com, yahoo.com, hotmail.com, *.gov.ph, *.gov
    const emailDomainRegex = /@((gmail\.com)|(yahoo\.com)|(hotmail\.com)|(.*\.gov(\.ph)?))$/i;
    const emailFormatRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailFormatRegex.test(email)) {
      setError('Please enter a valid email address format.');
      setErrors({ ...newErrors, email: true });
      setTimeout(scrollToError, 100);
      return;
    }

    if (!emailDomainRegex.test(email)) {
      setError('Only Gmail (@gmail.com), Yahoo, Hotmail, or Government email addresses are allowed.');
      setErrors({ ...newErrors, email: true });
      setTimeout(scrollToError, 100);
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
    formData.append('philhealth_id', philhealthId);
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
      const res = await fetch('/api/register', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      alert('Registration successful!');
      setMode('login');
      resetFormFields();
    } catch (err: any) {
      setError(err.message);
      // Attempt to highlight field based on error message if possible, strictly mostly likely email
      if (err.message.toLowerCase().includes('email')) {
        setErrors({ email: true });
      }
      setTimeout(scrollToError, 100);
    } finally {
      setLoading(false);
    }
  };

  // Unified Gradient Split-Screen Layout for All Modes
  return (
    <>
      <div className="auth-card">
        {/* LEFT SIDE - BRANDING (Persistent) */}
        <div style={{
          flex: '0 0 50%',
          background: 'linear-gradient(135deg, #38b2ac 0%, #ed8936 100%)',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '200px' // Added for mobile stack visibility
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: 'white',
              borderRadius: '50%',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              border: '4px solid rgba(255,255,255,0.3)',
              padding: '10px'
            }}>
              <img src="/images/Logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              Brgy.174 Health<br />Center
            </h1>
            <p style={{ fontSize: '16px', opacity: 0.9, lineHeight: 1.6, maxWidth: '300px', margin: '0 auto' }}>
              Access your medical records and book appointments securely.
            </p>
          </div>

          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: '12px',
            opacity: 0.7,
            zIndex: 2
          }}>
            © 2026 BHCARE Portal
          </div>
        </div>

        {/* RIGHT SIDE - DYNAMIC CONTENT */}
        <div className="form-scroll" style={{
          flex: '1',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          maxHeight: '100%'
        }}>
          {mode === 'login' ? (
            // LOGIN FORM
            <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '360px', margin: 'auto' }}>
              <h2 className="auth-title" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: '#1a202c' }}>
                Sign In
              </h2>
              <p className="auth-subtitle" style={{ fontSize: '14px', marginBottom: '32px', color: '#718096' }}>
                Sign in to your account
              </p>
              {/* ... rest of login form ... */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#4a5568', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  EMAIL ADDRESS
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f7fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  transition: 'all 0.2s'
                }}>
                  <span style={{ fontSize: '16px', marginRight: '12px', opacity: 0.5 }}>✉️</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="juan.delacruz@gmail.com"
                    required
                    autoComplete="email"
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#1a202c', fontWeight: 500 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#4a5568', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  PASSWORD
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f7fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  transition: 'all 0.2s'
                }}>
                  <span style={{ fontSize: '16px', marginRight: '12px', opacity: 0.5 }}>🔒</span>
                  <input
                    type={loginPwVisible ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#1a202c', fontWeight: 500 }}
                  />
                  <button type="button" onClick={() => setLoginPwVisible(v => !v)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#38b2ac', fontWeight: 700, textTransform: 'uppercase' }}>
                    {loginPwVisible ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    setShowResetModal(true);
                    setResetStep('email');
                  }}
                  style={{
                    fontSize: '13px',
                    color: '#38b2ac',
                    fontWeight: 600,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#ed8936')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#38b2ac')}
                >
                  Forgot Password?
                </a>
              </div>

              {error && <div style={{ background: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '24px', fontWeight: 600, border: '1px solid #fed7d7' }}>⚠️ {error}</div>}

              <button className="auth-button" style={{
                width: '100%',
                padding: '14px',
                background: '#38b2ac',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(56, 178, 172, 0.3)',
                transition: 'all 0.2s'
              }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <p style={{
                fontSize: '13px',
                marginTop: '24px',
                textAlign: 'center',
                color: '#4a5568'
              }}>
                New Patient?{' '}
                <span
                  onClick={() => { setMode('register'); resetFormFields(); }}
                  style={{
                    color: '#ed8936',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                >
                  Guide Registration
                </span>
              </p>
            </form>
          ) : (
            // REGISTER FORM
            <form onSubmit={handleRegister} autoComplete="off" style={{ width: '100%', maxWidth: '800px', margin: 'auto' }}>
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#718096',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                ← Back to Login
              </button>

              <h2 className="auth-title" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: '#1a202c' }}>
              </h2>
              {!ocrProcessed ? (
                // OCR UPLOAD SCREEN
                <div style={{ maxWidth: '420px', margin: '0 auto', width: '100%' }}>
                  <p className="auth-subtitle" style={{ fontSize: '14px', marginBottom: '32px', color: '#718096', textAlign: 'center' }}>
                    Upload your government ID to automatically fill all fields
                  </p>

                  <div style={{
                    border: '2px dashed #4299e1',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '20px',
                    background: 'rgba(235, 248, 255, 0.5)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                      <span style={{ fontSize: '20px' }}>🪪</span>
                      <h3 style={{ color: '#2d3748', fontSize: '15px', fontWeight: 700, margin: 0 }}>
                        Automated Registration
                      </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#4a5568', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Front Side</p>
                        <input type="file" id="front-upload" accept="image/*" onChange={handleFrontUpload} style={{ display: 'none' }} />
                        <div style={{
                          aspectRatio: '16/10',
                          width: '100%',
                          background: '#f7fafc',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: frontPreview ? '2px solid #48bb78' : '2px dashed #cbd5e0',
                          position: 'relative'
                        }}>
                          {!frontPreview ? (
                            <label htmlFor="front-upload" style={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              width: '100%',
                              height: '100%',
                              cursor: 'pointer',
                              fontSize: '11px',
                              color: '#718096',
                              fontWeight: 600,
                              textAlign: 'center',
                              transition: 'all 0.2s'
                            }}>
                              <span style={{ fontSize: '20px', display: 'block', marginBottom: '2px' }}>📷</span>
                              Upload
                            </label>
                          ) : (
                            <div style={{ width: '100%', height: '100%', position: 'relative', cursor: 'zoom-in', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setZoomedImage(frontPreview)}>
                              <img
                                src={frontPreview}
                                alt="Front"
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  objectFit: 'contain'
                                }}
                              />
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setIdFront(null); setFrontPreview(null); }}
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  background: '#e53e3e',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  cursor: 'pointer',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  zIndex: 5,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>×</button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#4a5568', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Back Side</p>
                        <input type="file" id="back-upload" accept="image/*" onChange={handleBackUpload} style={{ display: 'none' }} />
                        <div style={{
                          aspectRatio: '16/10',
                          width: '100%',
                          background: '#f7fafc',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: backPreview ? '2px solid #48bb78' : '2px dashed #cbd5e0',
                          position: 'relative'
                        }}>
                          {!backPreview ? (
                            <label htmlFor="back-upload" style={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              width: '100%',
                              height: '100%',
                              cursor: 'pointer',
                              fontSize: '11px',
                              color: '#a0aec0',
                              fontWeight: 600,
                              textAlign: 'center',
                              transition: 'all 0.2s'
                            }}>
                              <span style={{ fontSize: '20px', display: 'block', marginBottom: '2px' }}>📷</span>
                              Optional
                            </label>
                          ) : (
                            <div style={{ width: '100%', height: '100%', position: 'relative', cursor: 'zoom-in', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setZoomedImage(backPreview)}>
                              <img
                                src={backPreview}
                                alt="Back"
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  objectFit: 'contain'
                                }}
                              />
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setIdBack(null); setBackPreview(null); }}
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  background: '#e53e3e',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  cursor: 'pointer',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  zIndex: 5,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>×</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>


                    {ocrStatus && (
                      <div style={{
                        padding: '10px',
                        background: 'rgba(66, 153, 225, 0.15)',
                        borderRadius: '8px',
                        marginBottom: '16px',
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
                        background: idFront ? '#38b2ac' : '#cbd5e0',
                        color: idFront ? 'white' : '#a0aec0',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: 700,
                        cursor: idFront ? 'pointer' : 'not-allowed',
                        marginBottom: '16px',
                        boxShadow: idFront ? '0 4px 12px rgba(56, 178, 172, 0.3)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {loading ? 'Scanning...' : 'Start Automatic Scan'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setOcrProcessed(true); }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'transparent',
                        color: '#ed8936',
                        border: '1px solid #fed7d7',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Skip & Fill Manually →
                    </button>
                  </div >

                  {detectedIDType && (
                    <div style={{
                      padding: '10px',
                      background: '#f0fff4',
                      color: '#2f855a',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textAlign: 'center',
                      marginTop: '12px',
                      border: '1px solid #c6f6d5'
                    }}>
                      ✓ Detected: {detectedIDType}
                    </div>
                  )
                  }

                  {
                    error && (
                      <div style={{
                        padding: '10px',
                        background: '#fff5f5',
                        color: '#c53030',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        textAlign: 'center',
                        marginTop: '12px',
                        border: '1px solid #fed7d7'
                      }}>
                        ✗ {error}
                      </div>
                    )
                  }

                  <p style={{
                    fontSize: '12px',
                    textAlign: 'center',
                    color: '#4a5568',
                    marginTop: '24px'
                  }}>
                    Already have an account?{' '}
                    <span onClick={() => setMode('login')} style={{ color: '#3182ce', fontWeight: 700, cursor: 'pointer' }}>
                      Login here
                    </span>
                  </p>
                </div >
              ) : (
                // REGISTRATION FIELDS
                <div style={{ width: '100%' }}>
                  <h2 className="auth-title" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: '#1a202c' }}>
                    {t.createAccount}
                  </h2>
                  <p className="auth-subtitle" style={{ fontSize: '14px', marginBottom: '32px', color: '#718096' }}>
                    Review your information below
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#2d3748', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📝 Personal Details</h3>

                    <div className="auth-form-row">
                      <Input
                        label="First Name"
                        icon="👤"
                        placeholder="Juan"
                        value={firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value.replace(/[0-9]/g, ''), setFirstName)}
                        onBlur={() => validateField('firstName', firstName)}
                        confidence={confidence.first_name}
                        invalid={errors.firstName}
                        required
                      />
                      <Input
                        label="Last Name"
                        icon="👤"
                        placeholder="Dela Cruz"
                        value={lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value.replace(/[0-9]/g, ''), setLastName)}
                        onBlur={() => validateField('lastName', lastName)}
                        confidence={confidence.last_name}
                        invalid={errors.lastName}
                        required
                      />
                    </div>
                    <div className="auth-form-row">
                      <Input label={t.middleName} icon="👤" confidence={confidence.middle_name} value={middleName} onChange={(e) => setMiddleName(formatName(e.target.value.replace(/[0-9]/g, '')))} />
                      <Input
                        label={t.dob}
                        icon="📅"
                        type="date"
                        confidence={confidence.dob}
                        value={dob}
                        onChange={(e) => handleInputChange('dob', e.target.value, setDob)}
                        onBlur={() => validateField('dob', dob)}
                        invalid={errors.dob}
                        required
                      />
                    </div>

                    <div className="auth-form-row">
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
                      <Input
                        label="PhilHealth ID (Optional)"
                        icon="🆔"
                        value={philhealthId}
                        onChange={(e) => setPhilhealthId(formatPhilHealthId(e.target.value))}
                        placeholder="XX-XXXXXXXXX-X"
                      />
                    </div>

                    <div className="auth-form-row">
                      <Input label={t.contact} icon="📱" type="tel" inputMode="numeric" maxLength={11} placeholder="09XXXXXXXXX" value={contact} onChange={(e) => { const digits = e.target.value.replace(/\D/g, '').slice(0, 11); handleInputChange('contact', digits, setContact); }} onBlur={() => validateField('contact', contact)} confidence={confidence.phone} invalid={errors.contact} required />
                      <Input
                        label="Email Address"
                        icon="✉️"
                        type="email"
                        placeholder="juan.delacruz@gmail.com"
                        value={email}
                        onChange={(e) => handleInputChange('email', e.target.value, setEmail)}
                        onBlur={() => validateField('email', email)}
                        confidence={confidence.email}
                        invalid={errors.email}
                        required
                      />
                    </div>

                    <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#2d3748', marginBottom: '12px', marginTop: '24px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏠 Address Details</h3>
                    <div className="auth-form-row">
                      <Input label="Province" icon="📍" confidence={confidence.province} value={province} onChange={(e) => handleInputChange('province', e.target.value, setProvince)} onBlur={() => validateField('province', province)} invalid={errors.province} required />
                      <Input label="City" icon="🏙️" confidence={confidence.city} value={city} onChange={(e) => handleInputChange('city', e.target.value, setCity)} onBlur={() => validateField('city', city)} invalid={errors.city} required />
                    </div>

                    <div className="auth-form-row">
                      <Input label="Barangay" icon="🏡" confidence={confidence.barangay} value={barangay} onChange={(e) => handleInputChange('barangay', e.target.value, setBarangay)} onBlur={() => validateField('barangay', barangay)} invalid={errors.barangay} required />
                      <Input label="House No." icon="🏠" confidence={confidence.house_number} value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} />
                    </div>

                    <div className="auth-form-row">
                      <Input label="Block" icon="📍" confidence={confidence.block_number} value={blockNumber} onChange={(e) => setBlockNumber(e.target.value)} />
                      <Input label="Lot" icon="📍" confidence={confidence.lot_number} value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} />
                    </div>

                    <div className="auth-form-row">
                      <Input label="Street" icon="🛣️" confidence={confidence.street_name} value={streetName} onChange={(e) => setStreetName(e.target.value)} />
                      <Input label="Village / Subdivision" icon="🏘️" confidence={confidence.subdivision} value={subdivision} onChange={(e) => setSubdivision(e.target.value)} />
                    </div>

                    <div className="auth-form-row">
                      <Input label="ZIP Code" icon="📮" confidence={confidence.zip_code} value={zipCode} type="tel" maxLength={4} inputMode="numeric" pattern="[0-9]*" onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="1400" />

                    </div>

                    <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: '8px' }}>{t.createPw}</label>
                      <div className={`auth-input${errors.password ? ' invalid' : ''}`} style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#f7fafc',
                        border: errors.password ? '2px solid #e53e3e' : '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        marginBottom: '12px',
                        position: 'relative'
                      }}>
                        <span style={{ fontSize: '16px', marginRight: '8px' }}>🔒</span>
                        <input
                          type={registerPwVisible ? 'text' : 'password'}
                          value={password}
                          autoComplete="new-password"
                          onChange={(e) => handleInputChange('password', e.target.value, setPassword)}
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => { setPasswordFocused(false); validateField('password', password); }}
                          required
                          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '13px' }}
                        />
                        <button type="button" onClick={() => setRegisterPwVisible(v => !v)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '10px', color: '#4299e1', fontWeight: 700 }}>{registerPwVisible ? 'HIDE' : 'SHOW'}</button>

                        {passwordFocused && (
                          <div style={{
                            position: 'absolute',
                            left: 0,
                            top: '100%',
                            width: '100%',
                            marginTop: '8px',
                            background: '#2d3748',
                            color: 'white',
                            padding: '10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            zIndex: 100,
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }}>
                            <div style={{ marginBottom: '4px', fontWeight: 'bold', borderBottom: '1px solid #4a5568', paddingBottom: '4px' }}>Password Requirements:</div>
                            <ul style={{ paddingLeft: '16px', margin: 0, listStyleType: 'disc' }}>
                              <li style={{ marginBottom: '2px', color: passwordCriteria.length ? '#68d391' : 'white' }}>At least 8 characters</li>
                              <li style={{ marginBottom: '2px', color: passwordCriteria.upper ? '#68d391' : 'white' }}>At least one uppercase letter</li>
                              <li style={{ color: passwordCriteria.symbol ? '#68d391' : 'white' }}>At least one special character</li>
                            </ul>
                            <div style={{
                              position: 'absolute',
                              top: '-4px',
                              left: '20px',
                              width: '8px',
                              height: '8px',
                              background: '#2d3748',
                              transform: 'rotate(45deg)'
                            }}></div>
                          </div>
                        )}
                      </div>

                      {/* Password Criteria Checklist */}
                      <div style={{ fontSize: '11px', color: '#718096', marginTop: '-4px', marginBottom: '16px', paddingLeft: '4px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <span style={{ color: passwordCriteria.length ? '#38a169' : '#e53e3e', transition: 'color 0.2s', fontWeight: 600 }}>
                            {passwordCriteria.length ? '✓' : '○'} 8+ Chars
                          </span>
                          <span style={{ color: passwordCriteria.upper ? '#38a169' : '#e53e3e', transition: 'color 0.2s', fontWeight: 600 }}>
                            {passwordCriteria.upper ? '✓' : '○'} Upper (A-Z)
                          </span>
                          <span style={{ color: passwordCriteria.symbol ? '#38a169' : '#e53e3e', transition: 'color 0.2s', fontWeight: 600 }}>
                            {passwordCriteria.symbol ? '✓' : '○'} Symbol (-_+ =)
                          </span>
                        </div>
                      </div>

                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: '8px' }}>{t.confirmPw}</label>
                      <div className={`auth-input${errors.confirmPassword ? ' invalid' : ''}`} style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#f7fafc',
                        border: errors.confirmPassword ? '2px solid #e53e3e' : '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '10px 12px'
                      }}>
                        <span style={{ fontSize: '16px', marginRight: '8px' }}>🔒</span>
                        <input
                          type={confirmPwVisible ? 'text' : 'password'}
                          value={confirmPassword}
                          autoComplete="new-password"
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value, setConfirmPassword)}
                          onBlur={() => validateField('confirmPassword', confirmPassword)}
                          required
                          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '13px' }}
                        />
                        <span
                          onClick={() => setConfirmPwVisible(!confirmPwVisible)}
                          style={{ cursor: 'pointer', fontSize: '16px', marginLeft: '8px', userSelect: 'none' }}
                        >
                          {confirmPwVisible ? '👁️' : '🙈'}
                        </span>
                      </div>



                      {error && <div style={{ background: '#fff5f5', color: '#c53030', padding: '10px', borderRadius: '8px', fontSize: '12px', marginTop: '16px', fontWeight: 600, border: '1px solid #fed7d7' }}>{error}</div>}

                      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button type="button" onClick={() => { setOcrProcessed(false); resetFormFields(); }} style={{ flex: 1, padding: '12px', background: '#edf2f7', border: 'none', borderRadius: '12px', cursor: 'pointer', color: '#4a5568', fontWeight: 700, fontSize: '13px' }}>
                          ← Back
                        </button>
                        <button className="auth-button" style={{ margin: 0, flex: 2, height: '44px', fontSize: '14px', background: '#38b2ac', boxShadow: '0 4px 12px rgba(56, 178, 172, 0.3)' }} disabled={loading}>
                          {loading ? 'Submitting...' : t.submit}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Image Zoom Overlay */}
      {
        zoomedImage && (
          <div
            onClick={() => setZoomedImage(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              cursor: 'zoom-out',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
              <img
                src={zoomedImage}
                alt="Zoomed ID"
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  borderRadius: '12px',
                  boxShadow: '0 0 40px rgba(0,0,0,0.5)',
                  border: '4px solid white'
                }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}
                style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'white',
                  border: 'none',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2d3748'
                }}
              >
                ×
              </button>
            </div>
          </div>
        )
      }

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .form-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .form-scroll::-webkit-scrollbar-track {
          background: #f7fafc;
        }
        .form-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
        }
      `}</style>

      {/* FORGOT PASSWORD MODAL */}


      {/* MULTI-STEP RESET PASSWORD MODAL */}
      {showResetModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '40px',
              maxWidth: '480px',
              width: '90%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            {!resetLoading && (
              <button
                onClick={closeResetModal}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#A0AEC0',
                  transition: 'color 0.2s'
                }}
              >
                ×
              </button>
            )}

            {/* Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              background: '#E6FFFA',
              borderRadius: '50%',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              color: '#38B2AC'
            }}>
              {resetStep === 'email' ? '🔒' : resetStep === 'verify' ? '🛡️' : '🔑'}
            </div>

            {/* --- STEP 1: EMAIL --- */}
            {resetStep === 'email' && (
              <form onSubmit={handleSendCode}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: '#2D3748' }}>
                  Forgot Password?
                </h2>
                <p style={{ fontSize: '15px', color: '#718096', marginBottom: '32px' }}>
                  Enter your email and we'll send you a verification code.
                </p>

                <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#4A5568', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #E2E8F0',
                      fontSize: '16px',
                      color: '#1A202C',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#38B2AC'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                  />
                </div>

                {resetError && (
                  <div style={{ background: '#FFF5F5', color: '#C53030', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '24px', fontWeight: 600 }}>
                    ⚠️ {resetError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetLoading}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#38B2AC',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: resetLoading ? 'not-allowed' : 'pointer',
                    opacity: resetLoading ? 0.7 : 1,
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 6px rgba(56, 178, 172, 0.3)'
                  }}
                >
                  {resetLoading ? 'Sending Code...' : 'Send Code'}
                </button>
              </form>
            )}

            {/* --- STEP 2: VERIFICATION CODE --- */}
            {resetStep === 'verify' && (
              <form onSubmit={handleVerifyCode}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: '#2D3748' }}>
                  Verify Your Code
                </h2>
                <p style={{ fontSize: '15px', color: '#718096', marginBottom: '8px' }}>
                  We have sent a code to your email
                </p>
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#38B2AC', marginBottom: '32px' }}>
                  {forgotEmail}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
                  {verificationCode.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`code-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(idx, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
                        if (pastedData.length > 0) {
                          const newCode = [...verificationCode];
                          pastedData.forEach((char, i) => {
                            if (idx + i < 6) newCode[idx + i] = char;
                          });
                          setVerificationCode(newCode);
                          const nextIndex = Math.min(idx + pastedData.length, 5);
                          document.getElementById(`code-${nextIndex}`)?.focus();
                        }
                      }}
                      style={{
                        width: '48px',
                        height: '56px',
                        borderRadius: '8px',
                        border: '2px solid #E2E8F0',
                        fontSize: '24px',
                        fontWeight: 700,
                        textAlign: 'center',
                        color: '#2D3748',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#38B2AC'}
                      onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                    />
                  ))}
                </div>

                {resetError && (
                  <div style={{ background: '#FFF5F5', color: '#C53030', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '24px', fontWeight: 600 }}>
                    ⚠️ {resetError}
                  </div>
                )}
                {resetMessage && (
                  <div style={{ background: '#F0FFF4', color: '#276749', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '24px', fontWeight: 600 }}>
                    ✅ {resetMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetLoading}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#38B2AC',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: resetLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 6px rgba(56, 178, 172, 0.3)',
                    marginBottom: '24px'
                  }}
                >
                  {resetLoading ? 'Verifying...' : 'Verify'}
                </button>

                <div style={{ fontSize: '14px', color: '#718096' }}>
                  Didn't receive code?{' '}
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleSendCode}
                      style={{ background: 'none', border: 'none', color: '#3182CE', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      Resend
                    </button>
                  ) : (
                    <span style={{ color: '#A0AEC0' }}>Resend in {timer}s</span>
                  )}
                </div>
              </form>
            )}

            {/* --- STEP 3: NEW PASSWORD --- */}
            {resetStep === 'reset' && (
              <form onSubmit={handleResetPassword}>
                <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: '#2D3748' }}>
                  Reset Password
                </h2>
                <p style={{ fontSize: '15px', color: '#718096', marginBottom: '32px' }}>
                  Create a new strong password for your account.
                </p>

                <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: '8px' }}>
                    NEW PASSWORD
                  </label>
                  <div className={`auth-input${resetError && resetError.includes('Password') ? ' invalid' : ''}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f7fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    marginBottom: '12px',
                    position: 'relative'
                  }}>
                    <span style={{ fontSize: '16px', marginRight: '8px' }}>🔒</span>
                    <input
                      type={resetPwVisible ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => setResetPwFocused(true)}
                      onBlur={() => setResetPwFocused(false)}
                      placeholder="Enter new password"
                      required
                      style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '13px' }}
                    />
                    <button type="button" onClick={() => setResetPwVisible(v => !v)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '10px', color: '#4299e1', fontWeight: 700 }}>{resetPwVisible ? 'HIDE' : 'SHOW'}</button>

                    {resetPwFocused && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: '100%',
                        width: '100%',
                        marginTop: '8px',
                        background: '#2d3748',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        zIndex: 100,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ marginBottom: '4px', fontWeight: 'bold', borderBottom: '1px solid #4a5568', paddingBottom: '4px' }}>Password Requirements:</div>
                        <ul style={{ paddingLeft: '16px', margin: 0, listStyleType: 'disc' }}>
                          <li style={{ marginBottom: '2px', color: resetPasswordCriteria.length ? '#68d391' : 'white' }}>At least 8 characters</li>
                          <li style={{ marginBottom: '2px', color: resetPasswordCriteria.upper ? '#68d391' : 'white' }}>At least one uppercase letter</li>
                          <li style={{ color: resetPasswordCriteria.symbol ? '#68d391' : 'white' }}>At least one special character</li>
                        </ul>
                        <div style={{
                          position: 'absolute',
                          top: '-4px',
                          left: '20px',
                          width: '8px',
                          height: '8px',
                          background: '#2d3748',
                          transform: 'rotate(45deg)'
                        }}></div>
                      </div>
                    )}
                  </div>

                  {/* Password Criteria Checklist */}
                  <div style={{ fontSize: '11px', color: '#718096', marginBottom: '20px', paddingLeft: '4px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ color: resetPasswordCriteria.length ? '#38a169' : '#e53e3e', transition: 'color 0.2s', fontWeight: 600 }}>
                        {resetPasswordCriteria.length ? '✓' : '○'} 8+ Chars
                      </span>
                      <span style={{ color: resetPasswordCriteria.upper ? '#38a169' : '#e53e3e', transition: 'color 0.2s', fontWeight: 600 }}>
                        {resetPasswordCriteria.upper ? '✓' : '○'} Upper (A-Z)
                      </span>
                      <span style={{ color: resetPasswordCriteria.symbol ? '#38a169' : '#e53e3e', transition: 'color 0.2s', fontWeight: 600 }}>
                        {resetPasswordCriteria.symbol ? '✓' : '○'} Symbol (-_+ =)
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: '8px' }}>
                    CONFIRM PASSWORD
                  </label>
                  <div className="auth-input" style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f7fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '10px 12px'
                  }}>
                    <span style={{ fontSize: '16px', marginRight: '8px' }}>🔒</span>
                    <input
                      type={resetConfirmPwVisible ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '13px' }}
                    />
                    <span
                      onClick={() => setResetConfirmPwVisible(!resetConfirmPwVisible)}
                      style={{ cursor: 'pointer', fontSize: '16px', marginLeft: '8px', userSelect: 'none' }}
                    >
                      {resetConfirmPwVisible ? '👁️' : '🙈'}
                    </span>
                  </div>
                </div>

                {resetError && (
                  <div style={{ background: '#FFF5F5', color: '#C53030', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '24px', fontWeight: 600 }}>
                    ⚠️ {resetError}
                  </div>
                )}
                {resetMessage && (
                  <div style={{ background: '#F0FFF4', color: '#276749', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '24px', fontWeight: 600 }}>
                    ✅ {resetMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetLoading}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#38B2AC',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: resetLoading ? 'not-allowed' : 'pointer',
                    opacity: resetLoading ? 0.7 : 1,
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 6px rgba(56, 178, 172, 0.3)'
                  }}
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </>
  );
}

export default LoginForm;
