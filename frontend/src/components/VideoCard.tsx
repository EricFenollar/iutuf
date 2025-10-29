import { useNavigate } from 'react-router-dom';
import { getEnv } from '../utils/Env';

const VideoCard = ({ video }) => {
  const navigate = useNavigate();

  return (
    <li key={video.id} style={{ width: '31%' }}>
      <div
        className="card shadow-sm h-100"
        onClick={() => navigate(`/video/${video.id}`)}
        style={{
          cursor: 'pointer',
          borderRadius: '1%',
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out',
        }}
      >
        <div
          style={{
            width: '100%',
            position: 'relative',
            paddingBottom: '56.25%', // 16:9
            overflow: 'hidden',
          }}
        >
          <img
            src={`${getEnv().API_BASE_URL}/api/videos/thumbnail/${video.id}`}
            alt={video.title}
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
        <div className="card-body text-center"
             style={{
                 backgroundColor: '#000',
                 color: '#fff',
                 padding: '1%',
             }}
        >
          <h5 className="card-title">{video.title}</h5>
          <p style={{ margin: 0, color: '#fff' }}>Author: {video.user}</p>
        </div>
      </div>
    </li>
  );
};

export default VideoCard;
