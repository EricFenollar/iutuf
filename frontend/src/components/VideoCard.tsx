import { useNavigate, Link } from 'react-router-dom';
import { getEnv } from '../utils/Env';
import { useState } from 'react';

const VideoCard = ({ video }: { video: any }) => {
  const navigate = useNavigate();

  const authorName = video.user || video.username;
  const [isAuthorHovered, setIsAuthorHovered] = useState(false);

  return (
    <li key={video.id} style={{ width: '31%', minWidth: '280px', listStyle: 'none', marginBottom: '20px' }}>
      <div
        className="card shadow-sm h-100 video-card-container"
        // Lleva al video si clicas en cualquier parte de la tarjeta menos el nombre del autor
        onClick={() => navigate(`/video/${video.id}`)}
        style={{
          cursor: 'pointer',
          borderRadius: '1%',
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {/* IMAGEN THUMBNAIL */}
        <div
          style={{
            width: '100%',
            position: 'relative',
            paddingBottom: '56.25%', // 16:9
            overflow: 'hidden',
            backgroundColor: '#000',
          }}
        >
          <img
            src={`${getEnv().API_BASE_URL}/api/videos/thumbnail/${video.id}`}
            alt={video.title}
            onError={(e) => {
              //Si la imagen falla (404), pone una por defecto
              e.currentTarget.src = 'https://via.placeholder.com/640x360/202020/FFFFFF?text=No+Thumbnail';
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* CONTENIDO TEXTO */}
        <div
          className="card-body text-center"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            padding: '1%',
          }}
        >
          <h5
            className="card-title"
            style={{
              fontSize: '1.1rem',
              marginBottom: '5px',
              whiteSpace: 'nowrap', //Para títulos largos
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {video.title}
          </h5>

          <p
            style={{
              margin: 0,
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
            }}
          >
            Author:
            <Link
              to={`/profile/${authorName}`}
              onMouseEnter={() => setIsAuthorHovered(true)}
              onMouseLeave={() => setIsAuthorHovered(false)}
              onClick={(e) => {
                e.stopPropagation(); // Evita ir al video
              }}
              style={{
                color: isAuthorHovered ? '#1e90ff' : 'var(--text-secondary)',
                fontWeight: 'bold',
                textDecoration: 'none',
                zIndex: 10, // Asegura que esté encima para recibir el click
                position: 'relative',
                transition: 'color 0.2s ease',
              }}
            >
              {authorName}
            </Link>
          </p>
        </div>
      </div>
    </li>
  );
};

export default VideoCard;
