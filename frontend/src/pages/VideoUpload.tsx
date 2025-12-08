import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getEnv } from '../utils/Env';
import { useAuth } from '../context/AuthContext';
import './VideoUpload.css';

function VideoUpload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { username, token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate('/login');
    }
  }, [token, isAuthenticated, navigate]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError('You must be logged in to upload videos.');
      return;
    }

    if (!file) return setError('Please select a video file.');
    if (!title.trim()) return setError('Please enter a title.');
    if (!thumbnail) return setError('Please select a thumbnail.');

    setUploading(true);
    setProgress(0);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (thumbnail) formData.append('thumbnail', thumbnail);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('username', username || 'Anonymous');

      const env = getEnv();
      const baseUrl = env.API_BASE_URL || 'http://localhost:8080';
      const url = `${baseUrl}/api/videos/upload`;

      const config: any = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
      };

      await axios.post(url, formData, config);

      setMessage('Upload successful!');
      setTimeout(() => {
        setUploading(false);
        navigate('/');
      }, 1000);
    } catch (err: any) {
      console.error('Upload Error:', err);

      const serverMessage = err.response?.data?.message || err.response?.data || err.message;
      setError(typeof serverMessage === 'string' ? serverMessage : 'Upload failed (Unknown error)');
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      {/* Añadido: noValidate para que React gestione los errores */}
      <form className="upload-container" onSubmit={handleUpload} noValidate>
        <h2>Upload Video</h2>

        {error && <div className="upload-message error">{error}</div>}
        {message && <div className="upload-message success">{message}</div>}

        {uploading && (
          <div className="progress-wrapper">
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}

        <input
          data-testid="title-input"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={uploading}
          // required
        />

        <textarea
          data-testid="desc-input"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={uploading}
          // required
        />

        <div className="file-input-group">
          <label htmlFor="video-file">Video File:</label>
          <input
            data-testid="video-input"
            id="video-file"
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={uploading}
            // required
          />
        </div>

        <div className="file-input-group">
          <label htmlFor="thumbnail-file">Thumbnail (Optional):</label>
          <input
            data-testid="thumb-input"
            id="thumbnail-file"
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
            disabled={uploading}
          />
        </div>

        <button type="submit" disabled={uploading} data-testid="upload-btn">
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}

export default VideoUpload;
