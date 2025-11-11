import { useParams, useNavigate } from 'react-router-dom';
import { getEnv } from '../utils/Env';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './video.css';

type LoadingState = 'loading' | 'success' | 'error' | 'idle';
function Video() {
  const { id } = useParams();
  const navigate = useNavigate();
  // @ts-ignore
  const { username } = useAuth();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [video, setVideo] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');

  const comment = async (e) => {
    try {
      if (e.key === 'Enter' && commentText.trim() !== '') {
        comment(commentText); // llama a tu función comment

        const response = await fetch(`${getEnv().API_BASE_URL}/api/videos/${id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: commentText, author: username }),
        });
        if (!response.ok) {
          const err = await response.text();
          throw new Error(err);
        }
        setCommentText(''); // limpia el input
      }
    } catch (error) {
      setCommentText(error.message);
    }
  };

  useEffect(() => {
    if (!id) return; // evita llamada si no hay id

    fetch(`${getEnv().API_BASE_URL}/api/videos/${id}/info`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener el video');
        return res.json();
      })
      .then((data) => setVideo(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!video) return <p>Loading...</p>;

  return (
    <div className="video-modal">
      <div className={'video-modal-content'}>
        {/* BOTÓN CERRAR */}
        <button onClick={() => navigate(-1)} className="close-button">
          ✖
        </button>

        {/* VÍDEO */}
        <div className="video-container">
          <video controls autoPlay style={{ width: '100%', height: '100%', borderRadius: '1%' }}>
            <source src={`${getEnv().API_BASE_URL}/api/videos/${video.id}`} type="video/mp4" />
          </video>
        </div>

        {/* TÍTULO Y DESCRIPCIÓN */}
        <div className="comment-section">
          <div className="video-info">
            <h3 className="video-title">{video.title}</h3>
          </div>
          <div className="video-description">
            <div className={`description-text ${showFullDescription ? '' : 'description-collapsed'}`}>
              <p>{video.meta.description || 'No description available.'}</p>

              {/* TAGS */}
              {video.meta?.tags?.length > 0 && (
                <div className="tags-container">
                  {video.meta.tags.map((tag: string, i: number) => (
                    <span key={i} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* TOGGLE-BUTTON */}
            {video.meta.description?.split('\n').length > 3 && (
              <button className="toggle-button" onClick={() => setShowFullDescription(!showFullDescription)}>
                {showFullDescription ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* COMENTARIOS */}
          <div className="comment-title">{video.meta?.comments?.length || 0} Comments</div>
          <div className="comment-wrapper">
            <input
              type="text"
              placeholder="Add a comment..."
              className="comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={comment}
            />
            {video.meta?.comments?.length ? (
              video.meta.comments.map((c: any, i: number) => (
                <div key={i} className="comment-item">
                  <p>
                    <strong>{c.author}:</strong> {c.text}
                  </p>
                </div>
              ))
            ) : (
              <p>No comments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Video;
