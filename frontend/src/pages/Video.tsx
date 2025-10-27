import { useParams, useNavigate } from 'react-router-dom';
import { getEnv } from '../utils/Env';
import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';

type LoadingState = 'loading' | 'success' | 'error' | 'idle';
function Video() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState<any | null>(null);

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

        {/* COMENTARIOS */}
        <div style={styles.commentSection}>
          {/* TÍTULO DEL VÍDEO */}
          <div style={styles.videoInfo}>
            <h3 style={styles.videoTitle}>{video.title}</h3>
          </div>

          <div style={styles.commentTitle}>Comments</div>
          <div style={styles.commentWrapper}>
            <input type="text" placeholder="Add a comment..." style={styles.commentInput} />
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
  commentTitle: {
    marginLeft: '2.7%',
    marginTop: '0.75%',
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
