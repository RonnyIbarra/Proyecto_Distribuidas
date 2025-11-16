import { useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode.react';

function AdminPanel() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roomId, setRoomId] = useState('');
  const [pin, setPin] = useState('');
  const [type, setType] = useState('text');
  const [message, setMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const login = async () => {
    const res = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      setLoggedIn(true);
      setMessage('¡Login exitoso!');
    } else {
      setMessage(data.error || 'Error');
    }
  };

  const createRoom = async () => {
    const res = await fetch('http://localhost:3000/api/admin/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: roomId.toUpperCase(), pin, type })
    });
    const data = await res.json();
    setMessage(data.success ? `Sala ${roomId} creada` : data.error);
  };

  const shareLink = () => {
    const link = `${window.location.origin}/?sala=${roomId.toUpperCase()}&pin=${pin}`;
    navigator.clipboard.writeText(link);
    setMessage('¡Enlace copiado! Envíalo por WhatsApp');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-6">
      <div className="bg-white/95 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-lg">
        <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Panel Admin
        </h2>

        {!loggedIn ? (
          <>
            <input
              placeholder="Usuario"
              className="w-full p-4 mb-4 text-lg border-2 border-purple-300 rounded-xl focus:border-purple-600"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <input
              placeholder="Contraseña"
              type="password"
              className="w-full p-4 mb-6 text-lg border-2 border-pink-300 rounded-xl focus:border-pink-600"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              onClick={login}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-full hover:from-purple-600 hover:to-pink-600 transition"
            >
              Iniciar Sesión
            </button>
          </>
        ) : (
          <>
            <input
              placeholder="ID Sala (ej: EC2025)"
              className="w-full p-4 mb-4 text-lg border-2 border-indigo-300 rounded-xl"
              value={roomId}
              onChange={e => setRoomId(e.target.value.toUpperCase())}
            />
            <input
              placeholder="PIN (4 dígitos)"
              className="w-full p-4 mb-4 text-lg border-2 border-green-300 rounded-xl"
              value={pin}
              onChange={e => setPin(e.target.value)}
              maxLength="4"
            />
            <select
              className="w-full p-4 mb-4 text-lg border-2 border-yellow-300 rounded-xl"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="text">Solo Texto</option>
              <option value="multimedia">Multimedia</option>
            </select>

            <button
              onClick={createRoom}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-full hover:from-blue-600 hover:to-cyan-600 mb-3"
            >
              Crear Sala
            </button>

            <button
              onClick={shareLink}
              className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold py-3 rounded-full hover:from-green-500 hover:to-emerald-600 mb-3"
            >
              Copiar Enlace para Compartir
            </button>

            <button
              onClick={() => setShowQR(true)}
              className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold py-3 rounded-full hover:from-orange-500 hover:to-red-600"
            >
              Mostrar QR
            </button>

            {showQR && (
              <div className="mt-6 text-center p-4 bg-gray-50 rounded-xl">
                <QRCode value={`${window.location.origin}/?sala=${roomId}&pin=${pin}`} size={180} />
                <p className="text-sm mt-2 text-gray-600">Escanea con tu celular</p>
              </div>
            )}
          </>
        )}

        <p className="mt-6 text-center text-sm font-medium text-green-600">{message}</p>
        <Link to="/" className="block text-center mt-4 text-purple-600 hover:underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default AdminPanel;