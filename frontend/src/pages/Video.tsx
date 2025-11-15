import { useParams, useNavigate } from 'react-router-dom';
import { getEnv } from '../utils/Env';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

type LoadingState = 'loading' | 'success' | 'error' | 'idle';
function Video() {
  //从path中找到路径参数id
  const { id } = useParams();
  //专挑路径或者返回某个页面
  const navigate = useNavigate();
  // @ts-ignore
  const { username } = useAuth();

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
      .then((data) => {
        setVideo(data);

        //新增：从后端载入点赞、点踩、reaction
        setLikes(data.likeCount ?? 0);
        setDislikes(data.dislikeCount ?? 0);
        setReaction(data.reaction ?? null);
      })
      .catch((err) => console.error(err));
  }, [id]);
  //添加点赞功能
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setReaction] = useState<'like' | 'dislike' | null>(null);
  async function handleLike() {
    try {
      const response = await fetch(`${getEnv().API_BASE_URL}/api/videos/${id}/like?username=${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response) return console.error('POST/like La solicitud falló.');

      const data = await response.json();
      setLikes(data.likeCount);
      setDislikes(data.dislikeCount);
      setReaction(data.reaction);

    } catch (error) {
      // 网络错误（服务器关闭、断网等）
      console.error('Like failed (network error):', error);
    }
  }

  async function handdislike() {
    try {
      const response = await fetch(`${getEnv().API_BASE_URL}/api/videos/${id}/dislike?username=${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      // 网络错误（断网/后端停机）
      console.error('Dislike failed (network error):', error);
    }
  }

  if (!video) return <p>Cargando...</p>;

  return (
    <div className="video-modal" style={styles.modal}>
      <div className="video-modal-content" style={styles.modalContent}>
        {/* BOTÓN CERRAR */}
        <button onClick={() => navigate(-1)} style={styles.closeButton}>
          ✖
        </button>

        {/* VÍDEO */}
        <div style={styles.videoContainer}>
          <video controls autoPlay style={{ width: '100%', height: '100%', borderRadius: '1%' }}>
            <source src={`${getEnv().API_BASE_URL}/api/videos/${video.id}`} type="video/mp4" />
          </video>
        </div>

        {/* TÍTULO, DESCRIPCIÓN Y COMENTARIOS */}
        <div style={styles.commentSection}>
          <div style={styles.videoInfo}>
            <h3 style={styles.videoTitle}>{video.title}</h3>
          </div>
          <div>
            <button onClick={handleLike} style={{ color: userReaction === 'like' ? 'blue' : 'gray' }}>
              👍{likes}
            </button>

            <button onClick={handdislike} style={{ color: userReaction === 'dislike' ? 'red' : 'gray' }}>
              👎 {dislikes}
            </button>
          </div>
          <div style={styles.videoDescription}>{video.meta.description || 'No description available.'}</div>

          <div style={styles.commentTitle}>Comments</div>
          <div style={styles.commentWrapper}>
            <input
              type="text"
              placeholder="Add a comment..."
              style={styles.commentInput}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={comment}
            />
            {video.meta?.comments?.length ? (
              video.meta.comments.map((c: any, i: number) => (
                <div key={i} style={styles.commentWrapper}>
                  <p key={i}>
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

//ESTILOS CSS EN JS
const styles: Record<string, React.CSSProperties> = {
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#000',
    color: '#fff',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    padding: '1%',
  },
  closeButton: {
    position: 'absolute',
    top: '1%',
    right: '2%',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1.5vw',
    cursor: 'pointer',
  },
  videoContainer: {
    flex: '0 0 55%',
    width: '80%',
    backgroundColor: 'black',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto',
    borderRadius: '1%',
    overflow: 'hidden',
  },
  videoInfo: {
    width: '90%',
    marginLeft: '2.6%',
    marginBottom: '1%',
  },
  videoTitle: {
    fontSize: '1.5vw',
    fontWeight: 'bold',
    margin: 0,
    marginTop: '1%',
    color: '#000',
  },
  videoDescription: {
    width: '90%',
    marginLeft: '2.7%',
    marginBottom: '1%',
    padding: '1%',
    backgroundColor: '#f0f0f0',
    color: '#000',
    borderRadius: '0.5%',
    textAlign: 'left',
    fontSize: '0.95vw',
  },
  commentTitle: {
    marginLeft: '2.7%',
    fontSize: '1.2vw',
    fontWeight: 'bold',
    color: '#000',
  },
  commentWrapper: {
    width: '90%', //10% de margen a la derecha
    marginLeft: '1.5%',
  },
  commentSection: {
    flex: 1, // ocupa el espacio restante
    width: '100%',
    overflowY: 'auto', // scroll
    borderLeft: '0.2% solid #ccc',
    padding: '1%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    fontSize: '0.95vw',
    color: '#000',
    backgroundColor: '#fff',
  },
  commentInput: {
    width: '90%',
    padding: '1%',
    marginTop: '1%',
    marginBottom: '1.5%',
    fontSize: '0.95vw',
    color: '#000',
    backgroundColor: '#fff',
    border: '0.1em solid #ccc',
    marginLeft: '1.5%',
  },
};
export default Video;
