import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  joinRoom(roomId, pin, nickname, deviceIp) {
    if (this.socket) {
      this.socket.emit('join-room', { roomId, pin, nickname, deviceIp });
    }
  }

  sendMessage(content) {
    if (this.socket) {
      this.socket.emit('send-message', { content });
    }
  }

  uploadFile(file, roomId) {
    if (this.socket) {
      this.socket.emit('upload-file', { file, roomId });
    }
  }

  typing() {
    if (this.socket) {
      this.socket.emit('typing', {});
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive-message', callback);
    }
  }

  onLoadMessages(callback) {
    if (this.socket) {
      this.socket.on('load-messages', callback);
    }
  }

  onFileUploaded(callback) {
    if (this.socket) {
      this.socket.on('file-uploaded', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  onError(callback) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService();
