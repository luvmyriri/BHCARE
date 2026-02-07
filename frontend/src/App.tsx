import { useState } from 'react';
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

function App() {
  const [showLogin, setShowLogin] = useState(false);
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
      } else {
        userData.role = 'patient';
      }
      return userData;
    } catch {
      return null;
    }
  });

  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);

  const onLoginSuccess = (u: any) => {
    // Apply hardcoded role on login too
    if (u.email === 'admin@bhcare.ph') {
      u.role = 'admin';
    } else if (u.email === 'doctor@bhcare.ph') {
      u.role = 'doctor';
    } else {
      u.role = 'patient';
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
    if (user.role === 'doctor') {
      return (
        <DoctorDashboard
          user={user}
          onLogout={onLogoutClick}
        />
      );
    }
    return (
      <Dashboard
        user={user}
        onLogout={onLogoutClick}
      />
    );
  }

  // Otherwise show the landing page
  return (
    <div className="app">
      <FloatingImages />
      <FloatingParticles />
      <Navbar
        onLoginClick={openLogin}
        onLogoutClick={onLogoutClick}
        onProfileClick={() => { }}
        onAppointmentClick={openLogin}
        user={user}
      />
      <Hero onRegisterClick={openLogin} onLoginClick={openLogin} />
      <LocationShowcase />
      <Services />
      <ContactForm />
      <Footer />

      {showLogin && (
        <div className="modal-overlay" onClick={closeLogin}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeLogin}>
              ×
            </button>
            <div className="form-scroll">
              <LoginForm onLoginSuccess={onLoginSuccess} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
