import React, { useState } from 'react';
import './App.css';
import LoginForm from './LoginForm';
import Profile from './Profile';
import Services from './services';

function Navbar({ onLoginClick, onLogoutClick, onProfileClick, user }: { onLoginClick: () => void; onLogoutClick: () => void; onProfileClick: () => void; user: any }) {
  return (
    <nav className="nav">
      <div className="nav-left">
        <img className="logo-icon" src="/images/Logo.png" alt="Logo" />
        <span className="logo-text">Barangay 174 Health Center</span>
      </div>

      <ul className="nav-links">
        <li>
          <a href="#home">
            Home
          </a>
        </li>
        <li>
          <a href="#services">
            Services
          </a>
        </li>
        <li>
          <a href="#appointment">
            Appointment
          </a>
        </li>
        <li>
          <a href="#contact">
            Contact
          </a>
        </li>
      </ul>

      <div className="nav-right">
        <button
          className="profile-button"
          title={user ? `${user.first_name} ${user.last_name}` : 'View Profile'}
          onClick={onProfileClick}
        >
          <span className="profile-icon">👤</span>
        </button>
        {user ? (
          <button className="logout-button" onClick={onLogoutClick}>
            Log-out
          </button>
        ) : (
          <button className="login-button" onClick={onLoginClick}>
            Log-in
          </button>
        )}
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-left">
        <div className="badge">Your Health, Our Priority</div>
        <h1 className="hero-title">
          Barangay
          <br />
          Health Center
          <br />
          Appointment
        </h1>
        <p className="hero-subtitle">
          We’re dedicated to your health and well-being by eliminating long queues,
          ensuring priority access, and giving you control over when you visit the
          barangay health center. Providing compassionate care when you need it most
          backed by smart analytics that help health centers serve you better, one
          appointment at a time.
        </p>
        <div className="hero-actions">
          <button className="primary-btn">Book Appointment </button>
          <button className="secondary-btn">Learn More </button>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-image-card">
          <img
            src="/images/sample.jpg"
            alt="Hospital building"
            className="hero-image"
          />
        </div>
      </div>
    </section>
  );
}

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
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
  const onLogoutClick = () => {
    try {
      localStorage.removeItem('bh_user');
    } catch {}
    setUser(null);
    setShowProfile(false);
  };

  return (
    <div className="app">
      <Navbar onLoginClick={openLogin} onLogoutClick={onLogoutClick} onProfileClick={onProfileIconClick} user={user} />
      <Hero />
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
    </div>
  );
}

export default App;
