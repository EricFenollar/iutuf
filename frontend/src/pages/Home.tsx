import './Home.css';
import { useAllVideos } from '../useAllVideos';
import VideoGrid from '../components/VideoGrid';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UploadModal from '../components/uploadModel';

function Home() {
  const { loading, message, value: allVideos } = useAllVideos();
  const [displayVideos, setDisplayVideos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  // 初始化加载
  useEffect(() => {
    if (loading === 'success' && allVideos) {
      setDisplayVideos(allVideos);
    }
  }, [loading, allVideos]);

  // 搜索功能
  useEffect(() => {
    if (!allVideos) return;

    if (searchTerm.trim() === '') {
      setDisplayVideos(allVideos);
    } else {
      const filtered = allVideos.filter((video: any) => video.title.toLowerCase().includes(searchTerm.toLowerCase()));
      setDisplayVideos(filtered);
    }
  }, [searchTerm, allVideos]);

  // 上传成功回调
  function handleUploadSuccess(video: any) {
    setDisplayVideos((prev) => [video, ...prev]);
    setShowUpload(false);
  }

  if (loading === 'loading') return <div>Loading...</div>;
  if (loading === 'error')
    return (
      <div>
        <h3>Error</h3>
        <p>{message}</p>
      </div>
    );

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-left">
          <img src="/protube-logo-removebg-preview.png" className="App-logo" alt="logo" />
          <h1 className="app-name">ProTube</h1>
        </div>

        <div className="header-right">
          <input
            type="text"
            placeholder="Search videos..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* 🔥 关键修改点：未登录时点击会提示 */}
          <button
            className="upload-btn"
            onClick={() => {
              if (!isAuthenticated) {
                alert('You must log in before uploading a video.');
                return;
              }
              setShowUpload(true);
            }}
          >
            Upload
          </button>

          <Link
            to={isAuthenticated ? '/' : '/login'}
            className="login-link"
            onClick={isAuthenticated ? logout : undefined}
          >
            {isAuthenticated ? 'Logout' : 'Login'}
          </Link>
        </div>
      </header>

      <main className="App-content">
        <VideoGrid videos={displayVideos} />
      </main>

      {/* 上传弹窗 */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}

export default Home;
