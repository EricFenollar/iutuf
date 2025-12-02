import { useParams, useNavigate } from 'react-router-dom';
import { getEnv } from '../utils/Env';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Video.css';
import { useTranslation } from 'react-i18next';

function Video() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { username, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [video, setVideo] = useState<any | null>(null);
  const [commentText, setCommentText] = useState('');

  // ---- FIXED: 不再递归调用 comment() ----
  const handleComment = async (e) => {
    if (e.key !== 'Enter') return;
    if (!commentText.trim() || !isAuthenticated) return;

    try {
      const response = await fetch(`${getEnv().API_BASE_URL}/api/videos/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText, author: username }),
      });

      if (!response.ok) throw new Error(await response.text());

      setCommentText('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  // ---- 加载视频信息 ----
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
      .catch(console.error);
  }, [id]);

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setReaction] = useState<'like' | 'dislike' | null>(null);

  // ---- Like ----
  async function handleLike() {
    try {
      const response = await fetch(`${getEnv().API_BASE_URL}/api/videos/${id}/like?username=${username}`, {
        method: 'POST',
      });
      if (!response.ok) return;

      const data = await response.json();
      setLikes(data.likeCount);
      setDislikes(data.dislikeCount);
      setReaction(data.reaction);
    } catch {
      return;
    }
  }

  // ---- Dislike ----
  async function handleDislike() {
    try {
      const response = await fetch(`${getEnv().API_BASE_URL}/api/videos/${id}/dislike?username=${username}`, {
        method: 'POST',
      });
      if (!response.ok) return;

      const data = await response.json();
      setLikes(data.likeCount);
      setDislikes(data.dislikeCount);
      setReaction(data.reaction);
    } catch {
      return;
    }
  }

  if (!video) return <p>{t('common.loading')}</p>;

  return (
    <div className="video-modal">
      <div className="video-modal-content">
        <button onClick={() => navigate(-1)} className="close-button">
          ✖
        </button>

        {/* Video Player */}
        <div className="video-container">
          <video controls autoPlay style={{ width: '100%', height: '100%' }}>
            <source src={`${getEnv().API_BASE_URL}/api/videos/${video.id}`} type="video/mp4" />
          </video>
        </div>

        {/* Video Info + Comments */}
        <div className="comment-section">
          <div className="video-info">
            <h3 className="video-title">{video.title}</h3>
          </div>

          {/* Like / Dislike */}
          <div>
            <button onClick={handleLike} style={{ color: userReaction === 'like' ? 'blue' : 'gray' }}>
              👍 {likes} {t('video.like')}
            </button>

            <button onClick={handleDislike} style={{ color: userReaction === 'dislike' ? 'red' : 'gray' }}>
              👎 {dislikes} {t('video.dislike')}
            </button>
          </div>

          {/* Description */}
          <div className="video-description">
            <div className={showFullDescription ? '' : 'description-collapsed'}>
              <p>{video.meta.description || t('video.no_description')}</p>

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
                {showFullDescription ? t('video.show_less') : t('video.show_more')}
              </button>
            )}
          </div>

          {/* Comments */}
          <div className="comment-title">
            {video.meta?.comments?.length || 0} {t('video.comments')}
          </div>

          <div className="comment-wrapper">
            <input
              type="text"
              placeholder={t('video.add_comment_placeholder')}
              className="comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleComment}
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
              <p>{t('video.no_comments')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Video;
