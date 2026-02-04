import React, { useState } from 'react';
import './App.css';
import LoginForm from './LoginForm';
import Profile from './Profile';
import Services from './services';
import Appointments from './Appointments';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LocationShowcase from './components/LocationShowcase';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('bh_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);
  const closeProfile = () => setShowProfile(false);
  const closeAppointments = () => setShowAppointments(false);
  const onLoginSuccess = (u: any) => {
    setUser(u);
    setShowLogin(false);
    setShowProfile(true);
  };
  const onProfileUpdated = (u: any) => setUser(u);
  const onProfileIconClick = () => {
    if (user) setShowProfile(true);
    else setShowLogin(true);
  };
  const onAppointmentClick = () => {
    if (user) setShowAppointments(true);
    else setShowLogin(true);
  };
  const onLogoutClick = () => {
    try {
      localStorage.removeItem('bh_user');
    } catch { }
    setUser(null);
    setShowProfile(false);
    setShowAppointments(false);
  };

  return (
    <div className="app">
      <Navbar
        onLoginClick={openLogin}
        onLogoutClick={onLogoutClick}
        onProfileClick={onProfileIconClick}
        onAppointmentClick={onAppointmentClick}
        user={user}
      />
      <Hero onRegisterClick={openLogin} onLoginClick={openLogin} />
      <LocationShowcase />
      <Services />

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
      {showProfile && (
        <div className="modal-overlay" onClick={closeProfile}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProfile}>
              ×
            </button>
            <div className="form-scroll">
              <Profile user={user} onClose={closeProfile} onUpdated={onProfileUpdated} />
            </div>
          </div>
        </div>
      )}
      {showAppointments && (
        <div className="modal-overlay" onClick={closeAppointments}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeAppointments}>
              ×
            </button>
            <div className="form-scroll">
              <Appointments user={user} onClose={closeAppointments} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
