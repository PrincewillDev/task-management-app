import React, { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Dashboard from './components/Dashboard.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
  };

  if (user) {
    return (
      <div className="App">
        <nav className="main-nav">
          <div className="nav-left">
            <h1>Task Manager</h1>
          </div>
          <div className="nav-center">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={currentView === 'dashboard' ? 'active' : ''}
            >
              Dashboard
            </button>
            {user.is_staff && (
              <button 
                onClick={() => setCurrentView('admin')}
                className={currentView === 'admin' ? 'active' : ''}
              >
                Admin Panel
              </button>
            )}
          </div>
          <div className="nav-right">
            <span>Welcome, {user.email}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        <main className="main-content">
          {currentView === 'dashboard' ? (
            <Dashboard user={user} onLogout={handleLogout} />
          ) : (
            <AdminPanel user={user} />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="auth-container">
        {showRegister ? (
          <div>
            <Register onRegister={handleRegister} />
            <p>
              Already have an account? 
              <button onClick={() => setShowRegister(false)}>Login</button>
            </p>
          </div>
        ) : (
          <div>
            <Login onLogin={handleLogin} />
            <p>
              Don't have an account? 
              <button onClick={() => setShowRegister(true)}>Register</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;