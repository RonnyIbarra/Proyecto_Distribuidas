import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';
import '../styles/pages.css';

function AdminPanel() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const { rooms, createRoom, deleteRoom, fetchRooms, loading: roomLoading } = useRoom();
  
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('text');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchRooms();
  }, [token, navigate]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!roomName.trim() || pin.length < 4) {
      setError('Completa todos los campos. PIN mínimo 4 dígitos.');
      return;
    }

    setCreating(true);
    try {
      await createRoom(roomName, roomType, pin);
      setSuccess(`Sala "${roomName}" creada exitosamente`);
      setRoomName('');
      setPin('');
      setRoomType('text');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(typeof err === 'string' ? err : err.message || 'Error creando sala');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta sala?')) {
      try {
        await deleteRoom(roomId);
        setSuccess('Sala eliminada exitosamente');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(typeof err === 'string' ? err : err.message || 'Error eliminando sala');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const handleCopyShareLink = (roomId) => {
    const baseUrl = window.location.origin;
    const shareLink = `${baseUrl}/share/${roomId}`;
    
    navigator.clipboard.writeText(shareLink).then(() => {
      setSuccess('🔗 Link copiado al portapapeles');
      setTimeout(() => setSuccess(''), 3000);
    }).catch(() => {
      setError('Error al copiar el link');
    });
  };

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>Panel de Administración</h1>
        <button onClick={handleLogout} className="btn btn-danger">Cerrar Sesión</button>
      </header>

      <div className="admin-content">
        <section className="create-room-section">
          <h2>Crear Nueva Sala</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleCreateRoom} className="create-room-form">
            <div className="form-group">
              <label htmlFor="roomName">Nombre de la Sala:</label>
              <input
                type="text"
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Ej: Sala de Proyectos"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="roomType">Tipo de Sala:</label>
              <select
                id="roomType"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                <option value="text">Solo Texto</option>
                <option value="multimedia">Texto + Multimedia</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="pin">PIN de Acceso (mínimo 4 dígitos):</label>
              <input
                type="password"
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Ej: 1234"
                maxLength="6"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating || roomLoading}
            >
              {creating ? 'Creando...' : 'Crear Sala'}
            </button>
          </form>
        </section>

        <section className="rooms-list-section">
          <h2>Salas Existentes ({rooms.length})</h2>
          
          {roomLoading && <p>Cargando salas...</p>}

          {rooms.length === 0 ? (
            <p className="no-rooms">No hay salas creadas aún.</p>
          ) : (
            <div className="rooms-grid">
              {rooms.map((room) => (
                <div key={room.id} className="room-card">
                  <h3>{room.name}</h3>
                  <p className="room-type">
                    {room.type === 'text' ? '📝 Solo Texto' : '🎬 Multimedia'}
                  </p>
                  <p className="room-users">👥 {room.userCount || 0} usuario(s)</p>
                  <p className="room-id">ID: <code>{room.id.substring(0, 8)}...</code></p>
                  <div className="room-actions">
                    <button
                      onClick={() => handleCopyShareLink(room.id)}
                      className="btn btn-secondary-small"
                      title="Copiar link compartible"
                    >
                      🔗 Compartir
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="btn btn-danger-small"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminPanel;
