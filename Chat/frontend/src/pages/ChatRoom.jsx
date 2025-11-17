import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';
import apiService from '../services/apiService';
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
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMultimedia, setIsMultimedia] = useState(false);

  const messagesEndRef = useRef(null);

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

    socketService.connect();
    socketService.joinRoom(roomId, pin, nickname, deviceIp);

    socketService.onUserJoined((data) => setUsers(data.users));
    socketService.onUserLeft((data) => setUsers(data.users));

    socketService.onReceiveMessage((message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketService.onLoadMessages((msgs) => {
      setMessages(msgs);
      setLoading(false);
    });

    socketService.onFileUploaded((fileData) => {
      // agregar al panel de archivos
      setFiles((prev) => [...prev, fileData]);

      // agregar mensaje automáticamente
      setMessages((prev) => [
        ...prev,
        {
          id: fileData.id,
          file: fileData.url,
          mimetype: fileData.mimetype,
          originalName: fileData.originalName,
          nickname: fileData.uploadedBy,
          timestamp: new Date().toISOString()
        }
      ]);
    });

    socketService.onUserTyping((data) => {
      setTypingUsers((prev) => {
        if (!prev.includes(data.nickname)) return [...prev, data.nickname];
        return prev;
      });

      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== data.nickname));
      }, 3000);
    });

    socketService.onError((err) => setError(err.message || 'Error de conexión'));

    return () => socketService.disconnect();
  }, [roomId, navigate]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (messageInput.trim()) {
      socketService.sendMessage({
        content: messageInput,
        nickname: sessionStorage.getItem("nickname")
      });
      setMessageInput('');
      setError('');
    }
  };

  const handleTyping = () => {
    socketService.typing();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isMultimedia) {
      setError('Esta sala no permite archivos');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Archivo demasiado grande (máximo 10MB)');
      return;
    }

    const nickname = sessionStorage.getItem('nickname') || 'Anonimo';

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // SUBIR ARCHIVO AL BACKEND
      const res = await apiService.uploadFile(roomId, file, nickname, setUploadProgress);

      // AGREGARLO A LISTA
      setFiles(prev => [...prev, res.file]);

      // ENVIARLO COMO MENSAJE AL CHAT
      socketService.sendMessage({
        file: res.file.url,
        mimetype: res.file.mimetype,
        originalName: res.file.originalName,
        nickname,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      console.error("ERROR SUBIENDO ARCHIVO:", err);
      setError(typeof err === 'string' ? err : err.message);
    }

    setIsUploading(false);
    setUploadProgress(0);
    e.target.value = '';
  };

  const handleLeaveRoom = () => {
    sessionStorage.clear();
    navigate('/join');
  };

  const nickname = sessionStorage.getItem('nickname');

  return (
    <div className="chat-room-container">
      
      {/* HEADER */}
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

        {/* SIDEBAR */}
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
                    {file.mimetype.startsWith('image/') ? (
                      <button
                        className="file-thumb-btn"
                        onClick={() => setPreviewImage(file.url)}
                        title={file.originalName}
                      >
                        <img src={file.url} alt={file.originalName} className="file-thumb" />
                      </button>
                    ) : (
                      <a href={file.url} download={file.originalName}>
                        📎 {file.originalName}
                      </a>
                    )}
                    <div className="file-meta">
                      <small>{file.originalName}</small>
                      <small>{file.uploadedBy}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* MENSAJES */}
        <main className="chat-messages-section">
          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading-messages">Cargando mensajes...</div>
          ) : (
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">Sin mensajes aún.</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id || Math.random()}
                    className={`message ${msg.nickname === nickname ? 'own' : ''}`}
                  >
                    <span className="message-author">{msg.nickname}</span>

                    {/* MENSAJE NORMAL */}
                    {msg.content && (
                      <p className="message-content">{msg.content}</p>
                    )}

                    {/* MENSAJE: ARCHIVO */}
                    {msg.file && msg.mimetype?.startsWith('image/') && (
                      <img
                        src={msg.file}
                        alt={msg.originalName}
                        className="message-image"
                      />
                    )}

                    {msg.file && !msg.mimetype?.startsWith('image/') && (
                      <a href={msg.file} download={msg.originalName}>
                        📎 {msg.originalName}
                      </a>
                    )}

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

      {/* FOOTER */}
      <div className="chat-footer">
        {isUploading && (
          <div className="upload-progress-bar">
            <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}

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
                  disabled={isUploading}
                />
              </label>
            )}

            <button type="submit" className="btn btn-send" disabled={isUploading}>
              {isUploading ? `${uploadProgress}%` : 'Enviar'}
            </button>
          </div>
        </form>
      </div>

      {/* PREVIEW MODAL */}
      {previewImage && (
        <div className="file-modal" onClick={() => setPreviewImage(null)}>
          <div className="file-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="file-modal-close" onClick={() => setPreviewImage(null)}>✕</button>
            <img src={previewImage} alt="Preview" className="file-modal-img" />
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatRoom;
