import React, { useEffect, useState } from 'react';

type FieldProps = {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
};

function Field({ label, icon, value, onChange, type = 'text' }: FieldProps) {
  return (
    <>
      <label>{label}</label>
      <div className="auth-input">
        <span>{icon}</span>
        <input type={type} value={value} onChange={onChange} />
      </div>
    </>
  );
}

export default function Profile({ user, onClose, onUpdated }: { user: any; onClose: () => void; onUpdated: (u: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    contact_number: '+63',
    philhealth_id: '',
    barangay: '',
    city: '',
    province: '',
    email: '',
  });
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/user/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          first_name: data.first_name || '',
          middle_name: data.middle_name || '',
          last_name: data.last_name || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          contact_number: data.contact_number || '+63',
          philhealth_id: data.philhealth_id || '',
          barangay: data.barangay || '',
          city: data.city || '',
          province: data.province || '',
          email: data.email || '',
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  const updateField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;
    if (k === 'contact_number') {
      let cleaned = value.replace(/[^0-9+]/g, '');
      if (cleaned.startsWith('09')) cleaned = '+63' + cleaned.substring(1);
      else if (cleaned.startsWith('63') && !cleaned.startsWith('+63')) cleaned = '+' + cleaned;
      else if (cleaned.startsWith('9')) cleaned = '+63' + cleaned;

      if (!cleaned.startsWith('+63')) {
        const digits = cleaned.replace(/\D/g, '');
        cleaned = '+63' + digits;
      }
      if (cleaned.length > 13) cleaned = cleaned.substring(0, 13);
      value = cleaned;
    } else if (k === 'philhealth_id') {
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      if (cleaned.length > 2) formatted = cleaned.substring(0, 2) + '-' + cleaned.substring(2);
      if (cleaned.length > 11) formatted = formatted.substring(0, 12) + '-' + cleaned.substring(11, 12);
      if (formatted.length > 14) formatted = formatted.substring(0, 14);
      value = formatted;
    } else if (['first_name', 'middle_name', 'last_name'].includes(k)) {
      value = value.replace(/[^a-zA-Z\s'-.]/g, '');
    }
    setForm((f) => ({ ...f, [k]: value }));
  };

  const save = async () => {
    if (!user?.id) return;

    // Validation
    if (!form.first_name || !form.last_name) {
      setError('First and Last names are required.');
      return;
    }
    if (form.contact_number && form.contact_number.length < 13) {
      setError('Contact number must be valid or empty (+63...)');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.first_name,
          middle_name: form.middle_name,
          last_name: form.last_name,
          date_of_birth: form.date_of_birth,
          gender: form.gender,
          contact_number: form.contact_number,
          philhealth_id: form.philhealth_id,
          barangay: form.barangay,
          city: form.city,
          province: form.province,
          email: form.email,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = { ...user, first_name: form.first_name, last_name: form.last_name };
      localStorage.setItem('bh_user', JSON.stringify(updated));
      if (typeof onUpdated === 'function') onUpdated(updated);
      alert('Profile updated');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    if (!form.philhealth_id || form.philhealth_id.length < 12) {
      alert("Please enter a valid PhilHealth ID first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/check-philhealth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ philhealth_id: form.philhealth_id })
      });
      const data = await res.json();
      if (data.success) {
        setEligibilityResult(data.data);
      } else {
        alert(data.message || "Eligibility check failed");
      }
    } catch (e) {
      alert("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: 600, margin: '20px auto' }}>
      <h2 className="auth-title">My Profile</h2>
      <p className="auth-subtitle">Update your information</p>
      <Field label="First Name" icon="👤" value={form.first_name} onChange={updateField('first_name')} />
      <Field label="Middle Name" icon="👤" value={form.middle_name} onChange={updateField('middle_name')} />
      <Field label="Last Name" icon="👤" value={form.last_name} onChange={updateField('last_name')} />
      <Field label="Date of Birth" icon="📅" type="date" value={form.date_of_birth} onChange={updateField('date_of_birth')} />
      <label>Gender</label>
      <div className="auth-input">
        <span>⚧️</span>
        <select value={form.gender} onChange={updateField('gender')}>
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </div>
      <Field label="Contact Number" icon="📞" value={form.contact_number} onChange={updateField('contact_number')} />
      <label>PhilHealth ID (Konsulta Package)</label>
      <div className="auth-input" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🆔</span>
        <input
          value={form.philhealth_id}
          onChange={updateField('philhealth_id')}
          placeholder="XX-XXXXXXXXX-X"
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={checkEligibility}
          className="secondary-btn"
          style={{ fontSize: '0.8rem', padding: '8px 12px' }}
        >
          Check Status
        </button>
      </div>
      {eligibilityResult && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '8px',
          marginBottom: '16px',
          fontSize: '0.9rem'
        }}>
          <div style={{ color: '#047857', fontWeight: 'bold', marginBottom: '4px' }}>
            ✅ PhilHealth Member: {eligibilityResult.status}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#065f46' }}>
            <div><strong>Category:</strong> {eligibilityResult.category}</div>
            <div><strong>Expiry:</strong> {eligibilityResult.expiry}</div>
          </div>
          <div style={{ marginTop: '8px', color: '#065f46' }}>
            <strong>Benefits:</strong>
            <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
              {eligibilityResult.benefits.map((b: string, i: number) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        </div>
      )}
      <Field label="Email" icon="📧" value={form.email} onChange={updateField('email')} />
      <Field label="Barangay" icon="🏘️" value={form.barangay} onChange={updateField('barangay')} />
      <Field label="City/Municipality" icon="🏙️" value={form.city} onChange={updateField('city')} />
      <Field label="Province" icon="🗺️" value={form.province} onChange={updateField('province')} />

      {error && <div className="auth-error">{error}</div>}

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="auth-button" onClick={save} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button className="secondary-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
