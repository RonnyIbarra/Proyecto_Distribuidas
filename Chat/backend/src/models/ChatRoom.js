// Modelo en memoria para salas (producción usaría BD)
class ChatRoom {
  constructor(name, type = 'text', adminId) {
    this.id = require('uuid').v4();
    this.name = name;
    this.type = type; // 'text' o 'multimedia'
    this.pin = null; // Será hasheado
    this.adminId = adminId;
    this.createdAt = new Date();
    this.users = new Map(); // Map<socketId, userInfo>
    this.messages = [];
    this.files = [];
  }

  addUser(socketId, userInfo) {
    this.users.set(socketId, userInfo);
  }

  removeUser(socketId) {
    this.users.delete(socketId);
  }

  addMessage(message) {
    this.messages.push({
      ...message,
      timestamp: new Date(),
      id: require('uuid').v4()
    });
  }

  addFile(file) {
    if (this.type === 'multimedia') {
      this.files.push({
        ...file,
        uploadedAt: new Date(),
        id: require('uuid').v4()
      });
    }
  }

  getUsers() {
    return Array.from(this.users.values());
  }

  getUserCount() {
    return this.users.size;
  }

  isEmpty() {
    return this.users.size === 0;
  }
}

module.exports = ChatRoom;
