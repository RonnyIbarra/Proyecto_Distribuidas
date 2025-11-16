import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';
import '../styles/pages.css';

function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [error, setError] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMultimedia, setIsMultimedia] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const nickname = sessionStorage.getItem('nickname');
    const pin = sessionStorage.getItem('pin');
    const deviceIp = sessionStorage.getItem('deviceIp');
    const roomType = sessionStorage.getItem('roomType');

    if (!nickname || !pin || !roomId) {
      navigate('/join');
      return;
    }

    setIsMultimedia(roomType === 'multimedia');

    // Conectar al socket
    socketService.connect();

    // Unirse a la sala
    socketService.joinRoom(roomId, pin, nickname, deviceIp);

    // Listeners
    socketService.onUserJoined((data) => {
      setUsers(data.users);
    });

    socketService.onUserLeft((data) => {
      setUsers(data.users);
    });

    socketService.onReceiveMessage((message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketService.onLoadMessages((msgs) => {
      setMessages(msgs);
      setLoading(false);
    });

    socketService.onFileUploaded((fileData) => {
      setFiles((prev) => [...prev, fileData]);
    });

    socketService.onUserTyping((data) => {
      setTypingUsers((prev) => {
        if (!prev.includes(data.nickname)) {
          return [...prev, data.nickname];
        }
        return prev;
      });
      
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== data.nickname));
      }, 3000);
    });

    socketService.onError((err) => {
      setError(err.message || 'Error de conexión');
    });

    return () => {
      socketService.disconnect();
    };
  }, [roomId, navigate]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (messageInput.trim()) {
      socketService.sendMessage(messageInput);
      setMessageInput('');
      setError('');
    }
  };

  const handleTyping = () => {
    socketService.typing();
  };

  const handleFileUpload = (e) => {
    if (!isMultimedia) {
      setError('Esta sala no permite archivos');
      return;
    }

    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Archivo demasiado grande (máximo 10MB)');
        return;
      }

      socketService.uploadFile(file, roomId);
      e.target.value = '';
    }
  };

  const handleLeaveRoom = () => {
    sessionStorage.clear();
    navigate('/join');
  };

  const nickname = sessionStorage.getItem('nickname');

  return (
    <div className="chat-room-container">
      <div className="chat-header">
        <div className="chat-info">
          <h1>Sala de Chat</h1>
          <p className="user-badge">👤 {nickname}</p>
        </div>
        <button onClick={handleLeaveRoom} className="btn btn-danger">
          Salir de Sala
        </button>
      </div>

      <div className="chat-main">
        <aside className="chat-sidebar">
          <div className="users-section">
            <h3>Usuarios en línea ({users.length})</h3>
            <ul className="users-list">
              {users.map((user) => (
                <li key={user.socketId} className="user-item">
                  <span className="user-status">🟢</span>
                  {user.nickname}
                </li>
              ))}
            </ul>
          </div>

          {isMultimedia && files.length > 0 && (
            <div className="files-section">
              <h3>Archivos ({files.length})</h3>
              <ul className="files-list">
                {files.map((file) => (
                  <li key={file.id} className="file-item">
                    <a href={file.url} download={file.originalName}>
                      📎 {file.originalName}
                    </a>
                    <small>{file.uploadedBy}</small>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <main className="chat-messages-section">
          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading-messages">Cargando mensajes...</div>
          ) : (
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>Sin mensajes aún. ¡Sé el primero en escribir!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.nickname === nickname ? 'own' : ''}`}
                  >
                    <span className="message-author">{msg.nickname}</span>
                    <p className="message-content">{msg.content}</p>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}

              {typingUsers.length > 0 && (
                <div className="typing-indicator">
                  {typingUsers.join(', ')} está escribiendo...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </main>
      </div>

      <div className="chat-footer">
        <form onSubmit={handleSendMessage} className="message-form">
          <div className="message-input-wrapper">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                handleTyping();
              }}
              placeholder="Escribe tu mensaje..."
              className="message-input"
            />

            {isMultimedia && (
              <label className="file-upload-btn" title="Subir archivo">
                📎
                <input
                  type="file"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  accept="image/*,.pdf"
                />
              </label>
            )}

            <button type="submit" className="btn btn-send">
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatRoom;
