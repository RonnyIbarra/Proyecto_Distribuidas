import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import '../styles/pages.css';

function JoinRoom() {
  const navigate = useNavigate();
  const { rooms, fetchRooms, loading } = useRoom();
  
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const getDeviceIp = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (err) {
      return 'local-' + Date.now();
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setShowForm(true);
    setError('');
    setPin('');
    setNickname('');
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim() || !pin.trim()) {
      setError('Completa todos los campos');
      return;
    }

    if (pin.length < 4) {
      setError('El PIN debe tener al menos 4 dígitos');
      return;
    }

    setJoining(true);
    try {
      const deviceIp = await getDeviceIp();
      
      // Guardar información de la sesión
      sessionStorage.setItem('roomId', selectedRoom.id);
      sessionStorage.setItem('pin', pin);
      sessionStorage.setItem('nickname', nickname);
      sessionStorage.setItem('deviceIp', deviceIp);
      sessionStorage.setItem('roomType', selectedRoom.type);

      navigate(`/chat/${selectedRoom.id}`);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Error al unirse a la sala');
    } finally {
      setJoining(false);
    }
  };

  const handleBackToAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="join-room-container">
      <header className="join-header">
        <h1>Chat Seguro</h1>
        <button onClick={handleBackToAdmin} className="btn btn-secondary">
          Acceso Administrador
        </button>
      </header>

      <div className="join-content">
        {loading && <p className="loading">Cargando salas disponibles...</p>}

        {!loading && rooms.length === 0 && (
          <div className="no-rooms-msg">
            <p>No hay salas disponibles en este momento.</p>
            <p>Por favor, intenta más tarde.</p>
          </div>
        )}

        {!loading && rooms.length > 0 && !showForm && (
          <section className="available-rooms">
            <h2>Salas Disponibles</h2>
            <div className="rooms-grid">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="room-item"
                  onClick={() => handleSelectRoom(room)}
                >
                  <h3>{room.name}</h3>
                  <p className="room-type">
                    {room.type === 'text' ? '📝 Solo Texto' : '🎬 Multimedia'}
                  </p>
                  <p className="room-users">👥 {room.userCount || 0} usuario(s)</p>
                  <button className="btn btn-primary">Acceder</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {showForm && selectedRoom && (
          <section className="join-form-section">
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedRoom(null);
              }}
              className="btn btn-back"
            >
              ← Volver a Salas
            </button>

            <div className="join-form-card">
              <h2>Acceder a: {selectedRoom.name}</h2>
              <p className="form-subtitle">
                {selectedRoom.type === 'text' ? '📝 Solo Texto' : '🎬 Multimedia'}
              </p>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleJoinRoom} className="join-form">
                <div className="form-group">
                  <label htmlFor="nickname">Nickname:</label>
                  <input
                    type="text"
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Ej: Juan123"
                    maxLength="20"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pin">PIN de Acceso:</label>
                  <input
                    type="password"
                    id="pin"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Ingresa el PIN"
                    maxLength="6"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={joining}
                >
                  {joining ? 'Conectando...' : 'Entrar a Sala'}
                </button>
              </form>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default JoinRoom;
