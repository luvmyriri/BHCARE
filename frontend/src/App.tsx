import { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import LoginForm from './LoginForm';
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
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('bh_user');
      if (!u) return null;
      let userData = JSON.parse(u);

      return userData;
    } catch {
      return null;
    }
  });

  // Fetch fresh user data from backend on mount to ensure profile picture is loaded
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

  const openLogin = (mode: 'login' | 'register' = 'login') => {
    setLoginMode(mode);
    setShowLogin(true);
  };
  const closeLogin = () => setShowLogin(false);

  const onLoginSuccess = (u: any) => {
    setUser(u);
    setShowLogin(false);
  };

  const onLogoutClick = () => {
    try {
      localStorage.removeItem('bh_user');
    } catch { }
    setUser(null);
  };

  // If logged in, show the appropriate Dashboard hub
  if (user) {
    const roleLower = (user.role || '').toLowerCase();

    if (['admin', 'administrator', 'super admin', 'superadmin'].includes(roleLower)) {
      return (
        <ErrorBoundary>
          <AdminDashboard
            user={user}
            onLogout={onLogoutClick}
          />
        </ErrorBoundary>
      );
    }
    // Check for "Medical Staff" role group (Nurses, Midwives, Health Workers)
    if (['Nurse', 'Midwife', 'Health Worker', 'Medical Staff'].includes(user.role)) {
      return (
        <MedicalStaffDashboard
          user={user}
          onLogout={onLogoutClick}
        />
      );
    }
    // Check for "Doctor" role
    if (user.role === 'doctor' || user.role === 'Doctor') {
      return (
        <DoctorDashboard
          user={user}
          onLogout={onLogoutClick}
          onUserUpdated={setUser}
        />
      );
    }
    if (user.role === 'security' || user.role === 'Security') {
      return (
        <SecurityDashboard
          user={user}
          onLogout={onLogoutClick}
        />
      );
    }
    return (
      <Dashboard
        user={user}
        onLogout={onLogoutClick}
        onUserUpdated={setUser}
      />
    );
  }

  // Otherwise show the landing page or password reset pages
  return (
    <Routes>


      <Route path="/*" element={
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
          <Services />
          <ContactForm />
          <Footer onAppointmentClick={() => openLogin('login')} />
          <FloatingActions />

          {showLogin && (
            <div className="modal-overlay" onClick={closeLogin}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="modal-close" onClick={closeLogin} aria-label="Close modal">
                  ×
                </button>
                <div className="form-scroll">
                  <LoginForm onLoginSuccess={onLoginSuccess} initialMode={loginMode} />
                </div>
              </div>
            </div>
          )}
        </div>
      } />
    </Routes>
  );
}

export default App;
