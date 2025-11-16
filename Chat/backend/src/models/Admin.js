// Modelo para usuario administrador
class Admin {
  constructor(username, hashedPassword) {
    this.username = username;
    this.password = hashedPassword;
    this.createdAt = new Date();
    this.rooms = new Map(); // Map<roomId, ChatRoom>
  }

  addRoom(room) {
    this.rooms.set(room.id, room);
  }

  removeRoom(roomId) {
    this.rooms.delete(roomId);
  }

  getRooms() {
    return Array.from(this.rooms.values());
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }
}

module.exports = Admin;
