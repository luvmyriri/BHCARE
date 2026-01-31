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
    contact_number: '',
    barangay: '',
    city: '',
    province: '',
    email: '',
  });

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
          contact_number: data.contact_number || '',
          barangay: data.barangay || '',
          city: data.city || '',
          province: data.province || '',
          email: data.email || '',
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  const updateField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!user?.id) return;
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
          barangay: form.barangay,
          city: form.city,
          province: form.province,
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

  return (
    <div className="auth-card" style={{ maxWidth: 600, margin: '0 auto', boxShadow: 'none' }}>
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
