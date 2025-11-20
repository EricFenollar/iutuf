import React, { useState } from 'react';
import axios from 'axios';
import { getEnv } from '../utils/Env';
import { useAuth } from '../context/AuthContext';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: (video: any) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const { username } = useAuth();

  async function handleUpload() {
    // ❗ 未登录时提示，不禁用按钮，只显示错误
    if (!username) {
      setError('You must log in before uploading.');
      return;
    }

    if (!file) return setError('Please select a video file.');
    if (!title.trim()) return setError('Please enter a title.');
    if (!file.type.startsWith('video/')) return setError('File is not a video.');

    try {
      setUploading(true);
      setProgress(0);
      setError('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('username', username);

      const response = await axios.post(`${getEnv().API_BASE_URL}/api/videos/upload`, formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            setProgress(percent);
          }
        },
      });

      const video = response.data;

      onSuccess(video);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <h2>Upload Video</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {uploading && (
          <>
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: `${progress}%` }} />
            </div>
            <p>{progress}%</p>
          </>
        )}

        <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />

        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

        {/* Upload 按钮：未登录可点，但会弹出提示 */}
        <button
          style={{
            ...styles.button,
            background: uploading ? '#999' : '#0077b6',
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        <button style={styles.cancelButton} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UploadModal;

// 🎨 样式保持不变
const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: 'rgba(255,255,255,0.9)',
    padding: '20px',
    width: '420px',
    borderRadius: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
  },
  progressContainer: {
    width: '100%',
    height: '10px',
    background: '#eee',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #00b4d8, #0077b6)',
    transition: 'width 0.2s',
  },
  button: {
    padding: '10px',
    color: 'white',
    fontSize: '16px',
    borderRadius: '8px',
    border: 'none',
  },
  cancelButton: {
    padding: '10px',
    background: '#ccc',
    color: '#333',
    fontSize: '16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  },
};
