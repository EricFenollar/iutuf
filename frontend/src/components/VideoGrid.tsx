import { useState, useEffect } from 'react';
import { getEnv } from '../utils/Env';

const VideoGrid = () => {
  const [someData, setSomeData] = useState([]);

  useEffect(() => {
    fetch(getEnv().API_BASE_URL + '/api/videos')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log('✅ Fetched videos:', data);

        // 如果返回的是对象，比如 { videos: [...] } 或 { content: [...] }
        const videoArray = Array.isArray(data) ? data : data.videos || data.content || [];

        setSomeData(videoArray);
      });
  }, []);

  return (
    <ul className="row g-4"
        style={{
          padding: "3%",    // padding general del contenedor
          listStyle: "none",
          margin: 0,
        }}>
      {someData?.map((video: any) => (
        <li key={video.id} className="col-md-4">
          <div className="card shadow-sm h-100"
               onClick={(e)=>window.location.href = `${getEnv().API_BASE_URL}/api/videos/${video.id}`}
          >
            <div
                style={{
                  width: "100%",
                  height: "250px",
                  overflow: "hidden",
                  flexShrink: 0,
                }}>
              <img
                  src={`${getEnv().API_BASE_URL}/api/videos/thumbnail/${video.id}`}
                  className="card-img-top"
                  alt={video.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",   // evita que la imagen se deforme
                  }}
              />
            </div>
            <div className="card-body text-center">
              <h5 className="card-title">{video.title}</h5>
              <p className="text-muted mt-2">Author: {video.user}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default VideoGrid;
