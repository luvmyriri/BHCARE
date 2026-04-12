import React from 'react';
import LoginForm from './LoginForm';
import FloatingParticles from './components/FloatingParticles';
import FloatingImages from './components/FloatingImages';

interface DedicatedLoginProps {
    role: string;
    onLoginSuccess: (user: any) => void;
    initialMode?: 'login' | 'register';
    setLoginMode?: (m: 'login' | 'register') => void;
}

const DedicatedLogin: React.FC<DedicatedLoginProps> = ({ role, onLoginSuccess, initialMode = 'login', setLoginMode }) => {
    const expectedType = role.toLowerCase() === 'admin' ? 'admin' : role.toLowerCase() === 'employee' ? 'employee' : 'patient';
    const isPatient = role === 'Patient';

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            width: '100%',
            background: 'transparent',
            padding: window.innerWidth < 900 ? '20px 10px' : '40px 20px',
            position: 'relative',
            boxSizing: 'border-box'
        }}>
            <FloatingImages />
            <FloatingParticles />

            {/* Inject CSS to strip the native LoginForm card styling so it embeds seamlessly into our white Facebook-style card */}
            <style>{`
                ::web-kit-scrollbar { width: 6px; }
                ::web-kit-scrollbar-thumb { background: #cbd5e0; border-radius: 4px; }
                .auth-card { 
                    box-shadow: none !important; 
                    background: transparent !important; 
                    min-height: auto !important; 
                    max-height: none !important;
                    overflow: visible !important;
                    margin: 0 !important; 
                    width: 100% !important; 
                    border-radius: 0 !important;
                }
                .auth-hero-branding { display: none !important; }
                .auth-form-container { padding: 0 !important; }
                .form-scroll { 
                    max-height: calc(100vh - 160px) !important; 
                    overflow-y: auto !important; 
                    padding-right: 8px !important;
                }
                /* Custom scrollbar for the form */
                .form-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .form-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .form-scroll::-webkit-scrollbar-thumb {
                    background-color: #cbd5e0;
                    border-radius: 10px;
                }
            `}</style>
            
            <div style={{
                display: 'flex',
                width: '100%',
                maxWidth: '1050px',
                margin: 'auto', /* Restored flexbox horizontal+vertical centering */
                flexDirection: window.innerWidth < 900 ? 'column' : 'row',
                alignItems: 'center', /* Vertically aligns left and right blocks */
                gap: window.innerWidth < 900 ? '30px' : '60px',
                position: 'relative',
                zIndex: 10
            }}>
                {/* ── LEFT CONCEPT BRANDING ── */}
                <div style={{
                    flex: '1 1 50%',
                    paddingRight: window.innerWidth < 900 ? '0' : '20px',
                    textAlign: window.innerWidth < 900 ? 'center' : 'left',
                    marginTop: window.innerWidth < 900 ? '40px' : '-40px'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        marginBottom: '16px',
                        justifyContent: window.innerWidth < 900 ? 'center' : 'flex-start'
                    }}>
                        <img 
                            src="/images/Logo.png" 
                            alt="Brgy 174 seal" 
                            style={{ 
                                width: '60px', 
                                height: '60px', 
                                objectFit: 'contain',
                                background: 'white',
                                borderRadius: '50%',
                                padding: '4px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }} 
                            onError={e => { (e.target as HTMLImageElement).src = '/caloocan-seal.png'; }}
                        />
                        <span style={{
                            display: 'inline-block',
                            background: 'rgba(255, 183, 165, 0.4)',
                            color: '#e06b4b',
                            padding: '4px 14px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            letterSpacing: '0.5px'
                        }}>
                            📍 CALOOCAN CITY GOVERNMENT
                        </span>
                    </div>

                    <h1 style={{
                        color: '#319795',
                        fontSize: window.innerWidth < 900 ? '2.8rem' : '4rem',
                        fontWeight: '800',
                        letterSpacing: '-1.5px',
                        marginBottom: '16px',
                        lineHeight: '1.1'
                    }}>
                        BHCare {isPatient ? 'Portal' : role}
                    </h1>
                    <h2 style={{
                        color: '#4a5568',
                        fontSize: '1.4rem',
                        fontWeight: '500',
                        lineHeight: '1.5',
                        maxWidth: '520px',
                        margin: window.innerWidth < 900 ? '0 auto' : '0'
                    }}>
                        {isPatient 
                            ? 'Providing quality healthcare services for every resident. Join our community today.' 
                            : 'Authorized personnel access only. Please sign in.'}
                    </h2>
                </div>

                {/* ── RIGHT FLOATING FORM CARD ── */}
                <div style={{
                    flex: '0 0 auto',
                    width: '100%',
                    maxWidth: '420px',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, .1), 0 8px 16px rgba(0, 0, 0, .1)',
                    padding: '24px',
                    boxSizing: 'border-box'
                }}>
                    <LoginForm onLoginSuccess={onLoginSuccess} initialMode={initialMode} expectedType={expectedType} />
                    
                    {/* Add a subtle back link centered underneath the card logic */}
                    <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #dadde1', paddingTop: '16px' }}>
                        <button
                            onClick={() => window.location.href = '/'}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#319795',
                                fontWeight: '600',
                                fontSize: '14px',
                                cursor: 'pointer',
                            }}
                        >
                            ← Return to Homepage
                        </button>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default DedicatedLogin;

