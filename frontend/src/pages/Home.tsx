import './Home.css';
import { useAllVideos } from '../useAllVideos';
import VideoGrid from '../components/VideoGrid';
import { useState, useEffect } from 'react';

function Home() {
    const { loading, message, value: allVideos } = useAllVideos();
    const [displayVideos, setDisplayVideos] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (loading === 'success' && allVideos) {
            setDisplayVideos(allVideos);
        }
    }, [loading, allVideos]);

    useEffect(() => {    //actualiza la grid mientras se escribe
        if (!allVideos) return;

        if (searchTerm.trim() === '') {
            setDisplayVideos(allVideos);
        } else {
            const filtered = allVideos.filter((video: any) =>
                video.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setDisplayVideos(filtered);
        }
    }, [searchTerm, allVideos]);

    if (loading === 'loading') return <div>Loading...</div>;
    if (loading === 'error') return <div><h3>Error</h3><p>{message}</p></div>;

  return (
      <div className="App">
          <header className="App-header">
              <div className="header-left">
                  <img src="/protube-logo-removebg-preview.png" className="App-logo" alt="logo"/>
                  <h1 className="app-name">ProTube</h1>
              </div>

              <div className="header-right">
                  <input
                      type="text"
                      placeholder="Search videos..."
                      className="search-bar"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </header>

          <main className="App-content">
              <VideoGrid videos={displayVideos}/>
          </main>
      </div>
  );
}

function ContentApp() {
    const {loading, message, value} = useAllVideos();
    switch (loading) {
    case 'loading':
      return <div>Loading...</div>;
    case 'error':
      return (
        <div>
          <h3>Error</h3> <p>{message}</p>
        </div>
      );
    case 'success':
      return (
        <>
          <h2>Videos available:</h2>
          <VideoGrid videos={value} />
        </>
      );
  }
  return <div>Idle...</div>;
}

export default Home;
