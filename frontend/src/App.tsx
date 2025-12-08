import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Video from './pages/Video';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import UploadVideo from './pages/VideoUpload';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/video/:id" element={<Video />} />
        <Route path="/upload" element={<UploadVideo />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
