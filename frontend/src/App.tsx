import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Video from './pages/Video';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/video/:id" element={<Video />} />
      <Route path="/profile/:id" element={<UserProfile />} />
    </Routes>
  );
}

export default App;
