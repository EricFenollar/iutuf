import './Auth.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEnv } from '../utils/Env';

const LOGIN_URL = `${getEnv().API_BASE_URL}/api/auth/login`;

function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error(await response.text());
      login(username);
      navigate('/');
    } catch (error) {
      navigate('/error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Login</h2>

        <input
          className="auth-input"
          placeholder="User"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-button" onClick={handleLogin}>
          Login
        </button>

        <Link to="/register">
          <button className="auth-button secondary">Sign up</button>
        </Link>

        <Link className="auth-back" to="/">
          ← Back
        </Link>
      </div>
    </div>
  );
}

export default Login;
