import VideoCard from './VideoCard';

interface VideoGridProps {
  videos: any[];
}
const VideoGrid = ({ videos }: VideoGridProps) => {
  return (
    <div>
      {/* GRID DE TARJETAS */}
      <ul
        className="row g-4"
        style={{
          padding: '3%',
          listStyle: 'none',
          margin: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2%',
          justifyContent: 'center',
        }}
      >
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </ul>
    </div>
  );
};
export default VideoGrid;
