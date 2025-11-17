import { useParams, useNavigate } from 'react-router-dom';
import { getEnv } from '../utils/Env';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './video.css'; // 保留新增的 CSS

type LoadingState = 'loading' | 'success' | 'error' | 'idle';

function Video() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { username, isAuthenticated } = useAuth();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [video, setVideo] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');

  const comment = async (e) => {
    try {
      if (e.key === "Enter" && commentText.trim() !== "" && isAuthenticated) {
        comment(commentText);

        const response = await fetch(`${getEnv().API_BASE_URL}/api/videos/${id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: commentText, author: username }),
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(err);
        }

        setCommentText('');
      }
    } catch (error) {
      setCommentText(error.message);
    }
  };

  useEffect(() => {
    if (!id) return;

    fetch(`${getEnv().API_BASE_URL}/api/videos/${id}/info`)
      .then((res) => {
        if (!res.ok) throw new Error('Error getting video');
        return res.json();
      })
      .then((data) => {
        setVideo(data);
        setLikes(data.likeCount ?? 0);
        setDislikes(data.dislikeCount ?? 0);
        setReaction(data.reaction ?? null);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setReaction] = useState<'like' | 'dislike' | null>(null);

  async function handleLike() {
    try {
      const response = await fetch(`${getEnv().API_BASE_URL}/api/videos/${id}/like?username=${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response) return console.error('POST/like failed.');

      const data = await response.json();
      setLikes(data.likeCount);
      setDislikes(data.dislikeCount);
      setReaction(data.reaction);
    } catch (error) {
      console.error('Like failed:', error);
    }
  }

  async function handdislike() {
    try {
      const response = await fetch(`${getEnv().API_BASE_URL}/api/videos/${id}/dislike?username=${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.error('POST /dislike failed:', response.status);
        return;
      }

      const data = await response.json();
      setLikes(data.likeCount);
      setDislikes(data.dislikeCount);
      setReaction(data.reaction);
    } catch (error) {
      console.error('Dislike failed:', error);
    }
  }

  if (!video) return <p>Loading...</p>;

  return (
    <div className="video-modal">
      <div className="video-modal-content">
        <button onClick={() => navigate(-1)} className="close-button">
          ✖
        </button>

        <div className="video-container">
          <video controls autoPlay style={{ width: '100%', height: '100%', borderRadius: '1%' }}>
            <source src={`${getEnv().API_BASE_URL}/api/videos/${video.id}`} type="video/mp4" />
          </video>
        </div>

        <div className="comment-section">
          <div className="video-info">
            <h3 className="video-title">{video.title}</h3>
          </div>

          {/* Like / Dislike */}
          <div>
            <button onClick={handleLike} style={{ color: userReaction === 'like' ? 'blue' : 'gray' }}>
              👍{likes}
            </button>

            <button onClick={handdislike} style={{ color: userReaction === 'dislike' ? 'red' : 'gray' }}>
              👎 {dislikes}
            </button>
          </div>

          {/* Description */}
          <div className="video-description">
            <div className={`description-text ${showFullDescription ? '' : 'description-collapsed'}`}>
              <p>{video.meta.description || 'No description available.'}</p>

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

            {video.meta.description?.split('\n').length > 3 && (
              <button className="toggle-button" onClick={() => setShowFullDescription(!showFullDescription)}>
                {showFullDescription ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Comments */}
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
