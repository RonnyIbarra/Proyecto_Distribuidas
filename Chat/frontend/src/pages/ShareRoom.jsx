import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/pages.css';

function ShareRoom() {
  const { roomId, pin } = useParams();
  const navigate = useNavigate();
  
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar que roomId y pin existan
    if (!roomId || !pin) {
      setError('Link inválido o expirado');
      setTimeout(() => navigate('/join'), 3000);
    }
  }, [roomId, pin, navigate]);

  const handleEnter = (e) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      setError('Por favor ingresa un nombre de usuario');
      return;
    }

    if (nickname.length < 3 || nickname.length > 20) {
      setError('El nombre debe tener entre 3 y 20 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Guardar datos en sessionStorage
      sessionStorage.setItem('roomId', roomId);
      sessionStorage.setItem('pin', pin);
      sessionStorage.setItem('nickname', nickname);
      sessionStorage.setItem('roomType', 'text'); // Por defecto
      sessionStorage.setItem('deviceIp', 'shared-link'); // Marca especial para links compartidos
      
      // Navegar al chat
      navigate(`/chat/${roomId}`);
    } catch (err) {
      setError('Error al entrar a la sala');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="share-room-container">
      <div className="share-room-card">
        <div className="share-room-header">
          <h1>🎉 ¡Bienvenido!</h1>
          <p className="subtitle">Fue invitado a una sala de chat compartida</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
            {error.includes('Link inválido') && (
              <p style={{ marginTop: '10px', fontSize: '12px' }}>Redirigiendo a inicio...</p>
            )}
          </div>
        )}

        <form onSubmit={handleEnter} className="share-room-form">
          <div className="form-group">
            <label htmlFor="nickname">¿Cuál es tu nombre?</label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ingresa tu nombre de usuario"
              maxLength="20"
              minLength="3"
              required
              disabled={loading}
              autoFocus
            />
            <small>Entre 3 y 20 caracteres</small>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !nickname.trim()}
          >
            {loading ? 'Entrando...' : '✨ Entrar a la Sala'}
          </button>
        </form>

        <div className="share-room-info">
          <p className="info-text">
            💡 Al entrar, podrás chatear en tiempo real con otros usuarios
          </p>
        </div>

        <button
          onClick={() => navigate('/join')}
          className="btn btn-secondary"
          style={{ marginTop: '15px', width: '100%' }}
        >
          ← Volver a Explorar Salas
        </button>
      </div>
    </div>
  );
}

export default ShareRoom;
