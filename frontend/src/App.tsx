import { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LocationShowcase from './components/LocationShowcase';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import FloatingParticles from './components/FloatingParticles';
import FloatingImages from './components/FloatingImages';
import Services from './services';
import Dashboard from './Dashboard';
import DoctorDashboard from './DoctorDashboard';
import AdminDashboard from './AdminDashboard';
import MedicalStaffDashboard from './MedicalStaffDashboard';
import SecurityDashboard from './SecurityDashboard';
import FloatingActions from './components/FloatingActions';
import DedicatedLogin from './DedicatedLogin';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('bh_user');
      if (!u) return null;
      return JSON.parse(u);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const refreshUserData = async () => {
      const storedUser = localStorage.getItem('bh_user');
      if (!storedUser) return;
      try {
        const userData = JSON.parse(storedUser);
        const response = await fetch(`/user/${userData.id}`);
        if (response.ok) {
          const freshData = await response.json();
          setUser(freshData);
          localStorage.setItem('bh_user', JSON.stringify(freshData));
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    };
    refreshUserData();
  }, []);

  const onLoginSuccess = (u: any) => {
    setUser(u);
  };

  const onLogoutClick = () => {
    try { localStorage.removeItem('bh_user'); } catch { }
    setUser(null);
  };

  // If logged in, route to the correct dashboard
  if (user) {
    const roleLower = (user.role || '').toLowerCase();

    if (['admin', 'administrator', 'super admin', 'superadmin'].includes(roleLower)) {
      return (
        <ErrorBoundary>
          <AdminDashboard user={user} onLogout={onLogoutClick} />
        </ErrorBoundary>
      );
    }
    if (['Nurse', 'Midwife', 'Health Worker', 'Medical Staff'].includes(user.role)) {
      return <MedicalStaffDashboard user={user} onLogout={onLogoutClick} />;
    }
    if (user.role === 'doctor' || user.role === 'Doctor') {
      return <DoctorDashboard user={user} onLogout={onLogoutClick} onUserUpdated={setUser} />;
    }
    if (user.role === 'security' || user.role === 'Security') {
      return <SecurityDashboard user={user} onLogout={onLogoutClick} />;
    }
    return <Dashboard user={user} onLogout={onLogoutClick} onUserUpdated={setUser} />;
  }

  // Not logged in — show landing page or dedicated portals
  return (
    <Routes>
      <Route path="/Admin"    element={<DedicatedLogin role="Admin" onLoginSuccess={onLoginSuccess} />} />
      <Route path="/Employee" element={<DedicatedLogin role="Employee" onLoginSuccess={onLoginSuccess} />} />
      <Route path="/login"    element={
        <DedicatedLogin
          role="Patient"
          onLoginSuccess={onLoginSuccess}
          initialMode={loginMode}
          setLoginMode={setLoginMode}
        />
      } />
      <Route path="/*" element={
        <LandingPage
          user={user}
          onLogoutClick={onLogoutClick}
          setLoginMode={setLoginMode}
        />
      } />
    </Routes>
  );
}

function LandingPage({
  user,
  onLogoutClick,
  setLoginMode
}: {
  user: any;
  onLogoutClick: () => void;
  setLoginMode: (m: 'login' | 'register') => void;
}) {
  const navigate = useNavigate();

  const openLogin = (mode: 'login' | 'register' = 'login') => {
    setLoginMode(mode);
    navigate('/login');
  };

  return (
    <div className="app">
      <FloatingImages />
      <FloatingParticles />
      <Navbar
        onLoginClick={() => openLogin('login')}
        onLogoutClick={onLogoutClick}
        onProfileClick={() => { }}
        onAppointmentClick={() => openLogin('login')}
        user={user}
      />
      <Hero onRegisterClick={() => openLogin('register')} onLoginClick={() => openLogin('login')} />
      <LocationShowcase />
      <Services onServiceClick={() => openLogin('login')} />
      <ContactForm />
      <Footer onAppointmentClick={() => openLogin('login')} />
      <FloatingActions />
    </div>
  );
}

export default App;
