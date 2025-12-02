import './Auth.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEnv } from '../utils/Env';
import { useTranslation } from 'react-i18next';

const LOGIN_URL = `${getEnv().API_BASE_URL}/api/auth/login`;

function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        <h2>{t('login.title')}</h2>

        <input
          className="auth-input"
          placeholder={t('login.username')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="auth-input"
          type="password"
          placeholder={t('login.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-button" onClick={handleLogin}>
          {t('login.login_button')}
        </button>

        <Link to="/register">
          <button className="auth-button secondary">{t('login.signup_button')}</button>
        </Link>

        <Link className="auth-back" to="/">
          ← {t('login.back')}
        </Link>
      </div>
    </div>
  );
}

export default Login;
