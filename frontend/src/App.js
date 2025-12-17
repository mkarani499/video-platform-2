import React, { useState, useEffect } from 'react';
import './App.css';

// API URL configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [videos, setVideos] = useState([]);
  const [user, setUser] = useState(null);

  // Test backend connection on startup
  useEffect(() => {
    // Direct fetch call - no external dependencies
    fetch(`${API_URL}/api/test`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBackendStatus('Connected ✅');
        } else {
          setBackendStatus('Disconnected ❌');
        }
      })
      .catch(err => {
        console.error('Backend connection failed:', err);
        setBackendStatus('Disconnected ❌');
      });
  }, []);

  const handleLogin = () => {
    // Temporary mock login
    setUser({
      name: 'Test User',
      email: 'test@example.com'
    });
    alert('Login feature will be implemented next!');
  };

  const handlePayment = (videoTitle, price) => {
    alert(`M-Pesa payment of KSh ${price} for "${videoTitle}" will be implemented next!`);
  };

  // Sample videos data
  const sampleVideos = [
    { id: 1, title: 'Video Tutorial 1', price: 50, locked: true },
    { id: 2, title: 'Video Tutorial 2', price: 100, locked: true },
    { id: 3, title: 'Video Tutorial 3', price: 150, locked: true },
  ];

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎬 Video Platform</h1>
        <p>Pay with M-Pesa to unlock exclusive videos</p>
        
        <div className="status-card">
          <h3>System Status</h3>
          <p>Frontend: Running ✅ (localhost:3000)</p>
          <p>Backend: {backendStatus} ({API_URL})</p>
          <p>User: {user ? `Logged in as ${user.name}` : 'Not logged in'}</p>
        </div>

        <div className="auth-section">
          {!user ? (
            <button className="login-btn" onClick={handleLogin}>
              Login / Register
            </button>
          ) : (
            <div className="user-info">
              <span>Welcome, {user.name}!</span>
              <button className="logout-btn" onClick={() => setUser(null)}>
                Logout
              </button>
            </div>
          )}
        </div>

        <div className="video-library">
          <h2>Available Videos</h2>
          <div className="video-grid">
            {sampleVideos.map(video => (
              <div key={video.id} className="video-card">
                <div className="video-thumbnail">
                  <div className="thumbnail-placeholder">
                    <span>VIDEO PREVIEW</span>
                  </div>
                  <div className="video-price">KSh {video.price}</div>
                </div>
                <div className="video-info">
                  <h3>{video.title}</h3>
                  <p>Pay to unlock and watch this exclusive content</p>
                  <button 
                    className="pay-btn"
                    onClick={() => handlePayment(video.title, video.price)}
                  >
                    Pay with M-Pesa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="next-steps">
          <h3>Next Steps to Implement:</h3>
          <ul>
            <li>✅ Backend API Setup</li>
            <li>✅ MongoDB Database</li>
            <li>✅ Basic Frontend</li>
            <li>🔲 User Authentication</li>
            <li>🔲 Video Upload System</li>
            <li>🔲 M-Pesa Payment Integration</li>
            <li>🔲 Video Player with Protection</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;