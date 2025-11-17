import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Video from './pages/Video';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/video/:id" element={<Video />} />
    </Routes>
  );
}

export default App;
