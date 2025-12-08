import './Auth.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEnv } from '../utils/Env';
import { useTheme } from '../context/AppTheme';

const REGISTER_URL = `${getEnv().API_BASE_URL}/api/auth/register`;

function Register() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      alert('Password mismatch');
      return;
    }

    const user = {
      id: Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER + 1)),
      email,
      username,
      password,
    };

    try {
      const response = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      login(username);
      navigate('/');
    } catch (error) {
      navigate('/error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Register</h2>

        <input className="auth-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <input
          className="auth-input"
          placeholder="Username"
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

        <input
          className="auth-input"
          type="password"
          placeholder="Confirm password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />

        <button className="auth-button" onClick={handleRegister}>
          Create account
        </button>

        <Link to="/login">
          <button className="auth-button secondary">Back to login</button>
        </Link>
      </div>
    </div>
  );
}

export default Register;
