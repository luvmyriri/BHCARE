import React from 'react';
import LoginForm from './LoginForm';
import FloatingParticles from './components/FloatingParticles';
import FloatingImages from './components/FloatingImages';

interface DedicatedLoginProps {
    role: string;
    onLoginSuccess: (user: any) => void;
}

const DedicatedLogin: React.FC<DedicatedLoginProps> = ({ role, onLoginSuccess }) => {
    const expectedType = role.toLowerCase() === 'admin' ? 'admin' : 'employee';

    return (
        <div className="app" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh', 
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background elements to keep it matching the style */}
            <FloatingImages />
            <FloatingParticles />
            
            <div style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '650px',
                margin: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
            }}>
                <div style={{
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '800',
                        color: '#2d3748',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        BHCare <span style={{ color: '#319795' }}>{role}</span>
                    </h1>
                    <p style={{
                        color: '#718096',
                        fontSize: '14px',
                        marginTop: '8px',
                        fontWeight: '500'
                    }}>
                        Authorized Personnel Only
                    </p>
                </div>
                
                <div className="form-scroll" style={{ width: '100%' }}>
                    <LoginForm onLoginSuccess={onLoginSuccess} initialMode="login" expectedType={expectedType} />
                </div>
            </div>
        </div>
    );
};

export default DedicatedLogin;
