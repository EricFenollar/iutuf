import './UserProfile.css';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEnv } from '../utils/Env';
import VideoGrid from '../components/VideoGrid';
import { Link, useParams } from 'react-router-dom';

function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth();
  const { id } = useParams();
  const userId = id || user?.id;

  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    fetch(`${getEnv().API_BASE_URL}/api/videos/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setVideos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [isAuthenticated, userId]);

  if (!isAuthenticated) {
    return (
      <div className="not-logged">
        <h2>You must be logged in to view your profile.</h2>
        <Link to="/login" className="login-button">
          Go to Login
        </Link>
      </div>
    );
  }

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
        <h2>Your Videos</h2>
        {loading ? (
          <p>Loading...</p>
        ) : videos.length === 0 ? (
          <p>You haven't uploaded any videos yet.</p>
        ) : (
          <VideoGrid videos={videos} />
        )}
      </main>
    </div>
  );
}

export default UserProfile;
