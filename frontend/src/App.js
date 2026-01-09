import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import PaymentForm from './components/PaymentForm';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

// API URL configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://video-platform2-api.onrender.com';

// Main App wrapper
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

// Main content component with auth context
function AppContent() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const { isAuthenticated, user, logout, login } = useAuth();
  const navigate = useNavigate();

  // Test backend connection on startup
  useEffect(() => {
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

  // Load videos from backend
  useEffect(() => {
    fetch(`${API_URL}/api/videos`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVideos(data);
        }
        setLoadingVideos(false);
      })
      .catch(err => {
        console.error('Failed to load videos:', err);
        setLoadingVideos(false);
      });
  }, []);

  const handlePayment = (videoId, videoTitle, price) => {
    setSelectedVideo({ id: videoId, title: videoTitle, price });
  };

  const createSampleVideo = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      alert('Please login first to create videos');
      navigate('/login');
      return;
    }

    fetch(`${API_URL}/api/videos/create-sample`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(`✅ Sample video created: ${data.video.title} (KSh ${data.video.price})`);
          // Reload videos
          fetch(`${API_URL}/api/videos`)
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data)) {
                setVideos(data);
              }
            });
        }
      })
      .catch(err => {
        console.error('Failed to create sample video:', err);
        alert('Failed to create sample video');
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎬 Video Platform</h1>
        <p>Pay with M-Pesa to unlock exclusive videos</p>
        
        <div className="status-card">
          <h3>System Status</h3>
          <p>Frontend: Running ✅ (Vercel)</p>
          <p>Backend: {backendStatus} ({API_URL.replace('https://', '')})</p>
          <p>User: {isAuthenticated ? `Logged in as ${user?.name}` : 'Not logged in'}</p>
          <p>Videos: {loadingVideos ? 'Loading...' : `${videos.length} available`}</p>
        </div>

        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-info">
              <span>Welcome, {user?.name}!</span>
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <button 
              className="login-btn" 
              onClick={() => navigate('/login')}
            >
              Login / Register
            </button>
          )}
          
          {/* Admin button to create sample video */}
          <button 
            className="sample-video-btn" 
            onClick={createSampleVideo}
            style={{marginLeft: '15px', background: '#2196F3'}}
          >
            Create Sample Video
          </button>
        </div>

        <Routes>
          <Route path="/" element={<HomePage 
            videos={videos} 
            loadingVideos={loadingVideos} 
            handlePayment={handlePayment}
            createSampleVideo={createSampleVideo}
            isAuthenticated={isAuthenticated}
          />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>

        {/* Payment Modal */}
        {selectedVideo && (
          <div className="payment-modal">
            <div className="modal-content">
              <button className="close-btn" onClick={() => setSelectedVideo(null)}>×</button>
              <PaymentForm
                videoId={selectedVideo.id}
                videoTitle={selectedVideo.title}
                price={selectedVideo.price}
                onSuccess={() => {
                  setSelectedVideo(null);
                  alert('🎉 Payment successful! Video unlocked.');
                }}
              />
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

// HomePage component (your current main page)
function HomePage({ videos, loadingVideos, handlePayment, createSampleVideo, isAuthenticated }) {
  return (
    <div className="home-content">
      <div className="video-library">
        <h2>Available Videos</h2>
        
        {loadingVideos ? (
          <p>Loading videos...</p>
        ) : videos.length === 0 ? (
          <div className="no-videos">
            <p>No videos available yet. Click "Create Sample Video" above to add one.</p>
          </div>
        ) : (
          <div className="video-grid">
            {videos.map(video => (
              <div key={video._id} className="video-card">
                <div className="video-thumbnail">
                  <div className="thumbnail-placeholder">
                    <span>VIDEO PREVIEW</span>
                  </div>
                  <div className="video-price">KSh {video.price}</div>
                </div>
                <div className="video-info">
                  <h3>{video.title}</h3>
                  <p>{video.description || 'Exclusive content'}</p>
                  <p className="video-duration">Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</p>
                  <button 
                    className="pay-btn"
                    onClick={() => handlePayment(video._id, video.title, video.price)}
                  >
                    Pay KSh {video.price} with M-Pesa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="next-steps">
        <h3>Project Progress:</h3>
        <ul>
          <li>✅ Backend API Setup</li>
          <li>✅ MongoDB Database</li>
          <li>✅ Frontend Deployment</li>
          <li>✅ Backend Connection</li>
          <li>✅ M-Pesa Integration</li>
          <li>✅ User Authentication</li>
          <li>🔲 Video Upload System</li>
          <li>🔲 Video Player with Protection</li>
        </ul>
        
        <div className="test-instructions">
          <h4>💰 Test M-Pesa Payment:</h4>
          <ol>
            <li>{isAuthenticated ? '✅' : '🔲'} Login first (required)</li>
            <li>{videos.length > 0 ? '✅' : '🔲'} Click "Create Sample Video" (creates test video)</li>
            <li>Click "Pay with M-Pesa" on any video</li>
            <li>Use test phone: <strong>254708374149</strong></li>
            <li>Amount: <strong>1 KSh</strong> (minimum test amount)</li>
            <li>Simulated payment will succeed automatically</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// LoginPage component
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    login(userData);
    navigate('/dashboard');
  };

  const handleRegister = (userData) => {
    // Registration logic here
    login(userData); // For now, just log them in
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Welcome Back</h2>
        <LoginForm 
          onLogin={handleLogin} 
          onRegister={handleRegister}
        />
        <div className="login-footer">
          <p>Don't have an account? Register with your email</p>
          <p>Demo credentials: test@example.com / password123</p>
        </div>
      </div>
    </div>
  );
}

export default App;