import './Home.css';
import { useAllVideos } from '../useAllVideos';
import VideoGrid from '../components/VideoGrid';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
//import { useTranslation } from 'react-i18next';
//import LanguageSwitcher from '../components/LanguageSwitcher';

function Home() {
  const { loading, message, value: allVideos } = useAllVideos();

  const [displayVideos, setDisplayVideos] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const { username, isAuthenticated, logout } = useAuth();
  //const { t } = useTranslation();

  useEffect(() => {
    if (loading === 'success' && allVideos) {
      setDisplayVideos(allVideos);
    }
  }, [loading, allVideos]);

  useEffect(() => {
    if (!allVideos) return;
    if (searchTerm.trim() === '') {
      setDisplayVideos(allVideos);
    } else {
      const filtered = allVideos.filter((video: any) => video.title.toLowerCase().includes(searchTerm.toLowerCase()));

      setDisplayVideos(filtered);
    }
  }, [searchTerm, allVideos]);

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

          {/* My Profile */}
          {isAuthenticated && (
            <Link to={username ? `/profile/${username}` : '/profile'} className="login-link">
              My Profile
            </Link>
          )}

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
