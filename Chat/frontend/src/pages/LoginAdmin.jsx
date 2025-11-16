import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages.css';

function LoginAdmin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/admin/panel');
    } catch (err) {
      setError(typeof err === 'string' ? err : err.message || 'Error en autenticación');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToUser = () => {
    navigate('/join');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Login Administrador</h1>
        <p className="subtitle">Acceso exclusivo para administradores</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>

        <button onClick={handleBackToUser} className="btn btn-secondary">
          Volver como Usuario
        </button>
      </div>
    </div>
  );
}

export default LoginAdmin;
