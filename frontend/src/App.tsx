import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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


function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('bh_user');
      if (!u) return null;
      let userData = JSON.parse(u);

      // Hardcoded Role Assignment
      if (userData.email === 'admin@bhcare.ph') {
        userData.role = 'admin';
      } else if (userData.email === 'doctor@bhcare.ph') {
        userData.role = 'doctor';
      } else if (userData.email === 'security@bhcare.ph' || userData.email === 'security1741@bhcare.ph') {
        userData.role = 'security';
      } else {
        // Use existing role or default to patient
        userData.role = userData.role || 'patient';
      }
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
        // Skip refresh for hardcoded admin/doctor accounts
        if (userData.email === 'admin@bhcare.ph' || userData.email === 'doctor@bhcare.ph' || userData.email === 'security@bhcare.ph' || userData.email === 'security1741@bhcare.ph') {
          return;
        }

        const response = await fetch(`/user/${userData.id}`);
        if (response.ok) {
          const freshData = await response.json();

          // Apply role
          if (freshData.email === 'admin@bhcare.ph') {
            freshData.role = 'admin';
          } else if (freshData.email === 'doctor@bhcare.ph') {
            freshData.role = 'doctor';
          } else if (freshData.email === 'security@bhcare.ph' || freshData.email === 'security1741@bhcare.ph') {
            freshData.role = 'security';
          } else {
            // Use existing role or default to patient
            freshData.role = freshData.role || 'patient';
          }

          // Update both state and localStorage
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
    // Apply hardcoded role on login too
    if (u.email === 'admin@bhcare.ph') {
      u.role = 'admin';
    } else if (u.email === 'doctor@bhcare.ph') {
      u.role = 'doctor';
    } else if (u.email === 'security@bhcare.ph' || u.email === 'security1741@bhcare.ph') {
      u.role = 'security';
    } else {
      // Use existing role or default to patient
      u.role = u.role || 'patient';
    }
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
    if (user.role === 'admin') {
      return (
        <AdminDashboard
          user={user}
          onLogout={onLogoutClick}
        />
      );
    }
    if (user.role === 'Medical Staff') {
      return (
        <MedicalStaffDashboard
          user={user}
          onLogout={onLogoutClick}
        />
      );
    }
    if (user.role === 'doctor') {
      return (
        <DoctorDashboard
          user={user}
          onLogout={onLogoutClick}
          onUserUpdated={setUser}
        />
      );
    }
    if (user.role === 'security') {
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
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
