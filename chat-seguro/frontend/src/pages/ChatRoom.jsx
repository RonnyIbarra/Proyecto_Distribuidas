import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { PaperClip, Send, Smile, Users, Camera, X } from 'lucide-react';

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = useRef(null);

  const roomId = localStorage.getItem('roomId');
  const nickname = localStorage.getItem('nickname');
  const pin = localStorage.getItem('pin');

  useEffect(() => {
    socket.current = io('http://chat_backend:3000', { transports: ['websocket'] });

    socket.current.emit('join-room', { roomId, nickname, pin });

    socket.current.on('message', (msg) => {
      setMessages(prev => [...prev, { ...msg, id: Date.now() }]);
    });

    socket.current.on('user-joined', ({ nickname: joinedUser }) => {
      setUsers(prev => [...new Set([...prev, joinedUser])]);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        system: true, 
        text: `${joinedUser} se unió al chat` 
      }]);
    });

    socket.current.on('error', (err) => {
      alert(err.message);
      localStorage.clear();
      window.location.href = '/';
    });

    return () => socket.current?.disconnect();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() || file) {
      socket.current.emit('send-message', {
        roomId,
        message,
        nickname,
        file: file ? { name: file.name, type: file.type } : null
      });
      setMessage('');
      setFile(null);
    }
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f && f.size <= 5 * 1024 * 1024) {
      setFile(f);
    } else {
      alert('Máximo 5MB');
    }
  };

  const emojis = ['smiling face', 'laughing', 'heart', 'thumbs up', 'party', 'fire', 'rocket', 'star'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Sala: {roomId}</h1>
              <p className="text-sm opacity-90">{users.length} en línea</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {users.map((u, i) => (
              <div key={i} className="bg-white/30 px-3 py-1 rounded-full text-sm">
                {u}
              </div>
            ))}
          </div>
        </div>

        {/* MENSAJES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.nickname === nickname ? 'justify-end' : 'justify-start'}`}>
              {msg.system ? (
                <p className="text-xs text-gray-500 italic bg-gray-200 px-3 py-1 rounded-full">{msg.text}</p>
              ) : (
                <div className={`max-w-xs lg:max-w-md ${msg.nickname === nickname ? 'order-2' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 shadow-md ${
                    msg.nickname === nickname 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    <p className="font-semibold text-sm mb-1">{msg.nickname}</p>
                    {msg.text && <p className="break-words">{msg.text}</p>}
                    {msg.file && (
                      <a href={msg.file} target="_blank" className="flex items-center gap-2 mt-2 text-blue-600 underline">
                        <Camera className="w-4 h-4" />
                        Ver imagen
                      </a>
                    )}
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 bg-gray-100 border-t">
          {showEmoji && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setMessage(prev => prev + emoji)}
                  className="text-2xl hover:scale-150 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-3 bg-yellow-400 rounded-full hover:bg-yellow-500 transition"
            >
              <Smile className="w-5 h-5" />
            </button>

            <label className="cursor-pointer p-3 bg-blue-500 rounded-full hover:bg-blue-600 transition">
              <PaperClip className="w-5 h-5 text-white" />
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>

            <input
              className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:border-purple-500"
              placeholder="Escribe un mensaje..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
            />

            <button
              onClick={sendMessage}
              className="p-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full hover:from-pink-600 hover:to-orange-600 transition transform hover:scale-110"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>

          {file && (
            <div className="flex items-center justify-between mt-2 bg-green-50 p-2 rounded">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                {file.name}
              </p>
              <button onClick={() => setFile(null)} className="text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;