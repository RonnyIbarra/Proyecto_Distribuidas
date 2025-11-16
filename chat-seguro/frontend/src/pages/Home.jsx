import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlSala = searchParams.get('sala');
  const urlPin = searchParams.get('pin');

  const [roomId, setRoomId] = useState(urlSala || '');
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState(urlPin || '');

  useEffect(() => {
    if (urlSala && urlPin) {
      setRoomId(urlSala);
      setPin(urlPin);
    }
  }, [urlSala, urlPin]);

  const joinRoom = () => {
    if (roomId && nickname && pin && pin.length === 4) {
      localStorage.setItem('roomId', roomId);
      localStorage.setItem('nickname', nickname);
      localStorage.setItem('pin', pin);
      navigate('/chat');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center p-6">
      <div className="bg-white/95 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-lg transform transition-all hover:scale-105">
        <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
          Chat Seguro
        </h1>

        {urlSala && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-xl text-center">
            <p className="text-sm text-green-700">Invitado a la sala:</p>
            <p className="font-bold text-lg text-green-800">{urlSala}</p>
            <p className="text-xs text-green-600">PIN: {urlPin}</p>
          </div>
        )}

        <input
          className="w-full p-4 mb-4 text-lg border-2 border-purple-300 rounded-xl focus:border-purple-600 focus:outline-none transition"
          placeholder="ID de Sala (ej: EC2025)"
          value={roomId}
          onChange={e => setRoomId(e.target.value.toUpperCase())}
        />
        <input
          className="w-full p-4 mb-4 text-lg border-2 border-pink-300 rounded-xl focus:border-pink-600 focus:outline-none transition"
          placeholder="Tu apodo"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
        />
        <input
          className="w-full p-4 mb-6 text-lg border-2 border-orange-300 rounded-xl focus:border-orange-600 focus:outline-none transition"
          placeholder="PIN de 4 dígitos"
          type="password"
          value={pin}
          onChange={e => setPin(e.target.value)}
          maxLength="4"
        />

        <button
          onClick={joinRoom}
          disabled={!roomId || !nickname || pin.length !== 4}
          className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold py-4 rounded-full hover:from-green-500 hover:to-emerald-600 transition transform hover:scale-105 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {urlSala ? '¡Entrar Ahora!' : 'Entrar a la Sala'}
        </button>

        <p className="text-center mt-6 text-white">
          <Link to="/admin" className="text-yellow-300 hover:underline font-semibold">
            ¿Eres administrador?
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Home;