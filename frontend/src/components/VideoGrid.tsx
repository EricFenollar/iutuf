import { useState, useEffect } from "react";
import { getEnv } from "../utils/Env";
import VideoCard from "./VideoCard";

const VideoGrid = () => {
    const [videos, setVideos] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${getEnv().API_BASE_URL}/api/videos`)
            .then((res) => res.json())
            .then((data) => {
                const videoArray = Array.isArray(data)
                    ? data
                    : data.videos || data.content || [];
                setVideos(videoArray);
            });
    }, []);

    return (
        <div>
            {/* GRID DE TARJETAS */}
            <ul
                className="row g-4"
                style={{
                    padding: "3%",
                    listStyle: "none",
                    margin: 0,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "2%",
                }}
            >
                {videos.map(video => (
                    <VideoCard key={video.id} video={video}/>
                ))}
            </ul>
        </div>
    );
};
export default VideoGrid;