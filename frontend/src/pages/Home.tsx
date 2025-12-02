import './Home.css';
import { useAllVideos } from '../useAllVideos';
import VideoGrid from '../components/VideoGrid';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UploadModal from '../components/uploadModel';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

function Home() {
  const { loading, message, value: allVideos } = useAllVideos();

  const [displayVideos, setDisplayVideos] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();

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

  function handleUploadSuccess(video: any) {
    setDisplayVideos((prev) => [video, ...prev]);
    setShowUpload(false);
  }

  if (loading === 'loading') return <div>{t('common.loading')}</div>;
  if (loading === 'error')
    return (
      <div>
        <h3>{t('common.error')}</h3>
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
          {/* 🌍 放在上传按钮左边的语言切换器 */}
          <LanguageSwitcher />

          <input
            type="text"
            placeholder={t('header.search_placeholder')}
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
            {isAuthenticated ? t('header.logout') : t('header.login')}
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
