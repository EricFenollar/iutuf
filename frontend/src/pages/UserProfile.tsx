import './UserProfile.css';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEnv } from '../utils/Env';
import VideoGrid from '../components/VideoGrid';
import { Link, useParams } from 'react-router-dom';
import {useUserVideos} from "../useUserVideos";

function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth();
  const { username } = useParams();
  const userId = username || user?.id;
  const { value: videos, loading, message } = useUserVideos(userId);
  const [displayVideos, setDisplayVideos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (loading === 'success' && videos) {
      setDisplayVideos(videos);
    }
  }, [loading, videos]);

  // 搜索功能
  useEffect(() => {
    if (!videos) return;

    if (searchTerm.trim() === '') {
      setDisplayVideos(videos);
    } else {
      const filtered = videos.filter((video: any) => video.title.toLowerCase().includes(searchTerm.toLowerCase()));
      setDisplayVideos(filtered);
    }
  }, [searchTerm, videos]);

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
      {/* HEADER */}
      <header className="App-header">
        <div className="header-left">
          <Link to="/">
            <img src="/protube-logo-removebg-preview.png" className="App-logo" alt="logo" />
          </Link>
          <h1 className="app-name">ProTube</h1>
        </div>

        <div className="header-right">
          <Link to="/" className="login-link">
            Home
          </Link>
          <span className="login-link">My Profile</span>
          <Link to="/" className="login-link" onClick={logout}>
            Logout
          </Link>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="profile-content">
        <h2>
          {username === user ? "Your Videos" : `${username}'s Videos`}
        </h2>

        {loading ? (
            <p>Loading...</p>
        ) : videos.length === 0 ? (
            <p>
              {username === user
                  ? "You haven't uploaded any videos yet."
                  : `${username} hasn't uploaded any videos yet.`}
            </p>
        ) : (
            <VideoGrid videos={videos} />
        )}
      </main>
    </div>
  );
}

export default UserProfile;
