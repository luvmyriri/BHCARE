import { useState } from 'react';
import './App.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send reset email');
            }

            setMessage(data.message);
            setEmail('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card">
            {/* LEFT SIDE - BRANDING */}
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
                minHeight: '200px'
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
                        Password<br />Recovery
                    </h1>
                    <p style={{ fontSize: '16px', opacity: 0.9, lineHeight: 1.6, maxWidth: '300px', margin: '0 auto' }}>
                        Enter your email to receive a password reset link.
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

            {/* RIGHT SIDE - FORM */}
            <div className="form-scroll" style={{
                flex: '1',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                maxHeight: '100%'
            }}>
                <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '360px', margin: 'auto' }}>
                    <h2 className="auth-title" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: '#1a202c' }}>
                        Forgot Password?
                    </h2>
                    <p className="auth-subtitle" style={{ fontSize: '14px', marginBottom: '32px', color: '#718096' }}>
                        No worries! Enter your email and we'll send you reset instructions.
                    </p>

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
                                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#1a202c', fontWeight: 500 }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ background: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '24px', fontWeight: 600, border: '1px solid #fed7d7' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {message && (
                        <div style={{ background: '#f0fdf4', color: '#166534', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '24px', fontWeight: 600, border: '1px solid #bbf7d0' }}>
                            ✅ {message}
                        </div>
                    )}

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
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <p style={{
                        fontSize: '13px',
                        marginTop: '24px',
                        textAlign: 'center',
                        color: '#4a5568'
                    }}>
                        Remember your password?{' '}
                        <a
                            href="/"
                            style={{
                                color: '#ed8936',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textDecoration: 'none'
                            }}
                        >
                            Sign In
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}
