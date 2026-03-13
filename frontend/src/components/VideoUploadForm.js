import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function VideoUploadForm({ onUploadSuccess }) {
  const { getToken } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(50);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setMessage('Please select a video file');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('video', videoFile);
    if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('isPublic', 'true');

    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_URL}/api/upload/video-with-thumbnail`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Video uploaded successfully!');
        setTitle('');
        setDescription('');
        setPrice(50);
        setVideoFile(null);
        setThumbnailFile(null);
        // Reset file inputs
        document.getElementById('video-input').value = '';
        document.getElementById('thumbnail-input').value = '';
        if (onUploadSuccess) onUploadSuccess(data.video);
      } else {
        setMessage(`❌ ${data.error || 'Upload failed'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-form">
      <h2>Upload New Video</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Video Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter video title"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            placeholder="Enter video description"
          />
        </div>

        <div className="form-group">
          <label>Price (KSh) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Video File * (MP4, MOV, AVI - Max 100MB)</label>
          <input
            id="video-input"
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            required
          />
          {videoFile && (
            <small>Selected: {videoFile.name} ({(videoFile.size / (1024*1024)).toFixed(2)} MB)</small>
          )}
        </div>

        <div className="form-group">
          <label>Thumbnail Image (Optional - JPG, PNG)</label>
          <input
            id="thumbnail-input"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
          />
        </div>

        <button type="submit" disabled={uploading} className="upload-btn">
          {uploading ? `Uploading... ${progress}%` : 'Upload Video'}
        </button>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </form>

      <div className="upload-guidelines">
        <h4>📋 Upload Guidelines:</h4>
        <ul>
          <li>Maximum file size: 100MB (free Cloudinary limit)</li>
          <li>Supported formats: MP4, MOV, AVI, MKV, WebM</li>
          <li>Videos are automatically optimized for web streaming</li>
          <li>Thumbnail should be 16:9 ratio for best display</li>
        </ul>
      </div>
    </div>
  );
}

export default VideoUploadForm;