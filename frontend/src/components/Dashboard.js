import React, { useState } from 'react';  // ✅ Added useState
import { useAuth } from '../context/AuthContext';
import VideoUploadForm from './VideoUploadForm';  // ✅ Added import

function Dashboard() {
  const { user, logout } = useAuth();
  const [showUploadForm, setShowUploadForm] = useState(false);  // ✅ Added state

  return (
    <div className="dashboard" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Welcome to Your Dashboard, {user?.name}!</h1>
      
      {/* ✅ Admin section with upload button */}
      {user?.role === 'admin' && (
        <div className="admin-section" style={{ marginBottom: '20px' }}>
          <button 
            className="upload-toggle-btn"
            onClick={() => setShowUploadForm(!showUploadForm)}
            style={{
              padding: '10px 20px',
              background: showUploadForm ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            {showUploadForm ? 'Hide Upload Form' : 'Upload New Video'}
          </button>
          
          {showUploadForm && (
            <VideoUploadForm 
              onUploadSuccess={(video) => {
                console.log('Video uploaded:', video);
                setShowUploadForm(false);
                // You can add a success message or refresh video list here
              }}
            />
          )}
        </div>
      )}
      
      <div className="user-info-card" style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <h2>Your Profile</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Phone:</strong> {user?.phone || 'Not set'}</p>
        <p><strong>Account Type:</strong> {user?.role}</p>
      </div>

      <button 
        className="logout-btn" 
        onClick={logout}
        style={{ padding: '10px 20px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Logout
      </button>

      <div className="purchased-videos" style={{ marginTop: '30px' }}>
        <h2>Your Purchased Videos</h2>
        <p style={{ color: '#666' }}>You haven't purchased any videos yet.</p>
      </div>
    </div>
  );
}

export default Dashboard;