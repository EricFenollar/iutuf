import './Home.css';
import { useAllVideos } from '../useAllVideos';
import VideoGrid from '../components/VideoGrid';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { loading, message, value: allVideos } = useAllVideos();

  const [displayVideos, setDisplayVideos] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState('');

  const { isAuthenticated, logout } = useAuth();

  // 初始化时加载视频

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

  // 上传成功后的回调

  function handleUploadSuccess(video: any) {
    // 添加到顶部（体验更好）

    setDisplayVideos((prev) => [video, ...prev]);
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

          <Link to="/upload" className="upload-link">
            Upload
          </Link>

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
    </div>
  );
}

export default Home;
