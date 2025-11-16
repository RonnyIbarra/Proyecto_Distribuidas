const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const ChatRoom = require('../models/ChatRoom');

class RoomService {
  constructor() {
    this.rooms = new Map();
  }

  async createRoom(name, type, pin) {
    if (!name || !type || !pin) {
      throw new Error('Faltan parámetros requeridos');
    }

    if (!['text', 'multimedia'].includes(type)) {
      throw new Error('Tipo de sala inválido');
    }

    if (pin.length < 4) {
      throw new Error('El PIN debe tener al menos 4 dígitos');
    }

    const room = new ChatRoom(name, type);
    room.pin = await bcrypt.hash(pin, 10);

    this.rooms.set(room.id, room);
    return {
      id: room.id,
      name: room.name,
      type: room.type,
      createdAt: room.createdAt
    };
  }

  async joinRoom(roomId, pin, nickname, deviceIp) {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Sala no encontrada');
    }

    const isPinValid = await bcrypt.compare(pin, room.pin);
    if (!isPinValid) {
      throw new Error('PIN incorrecto');
    }

    // Validar nicknames únicos en la sala
    const userExists = Array.from(room.users.values()).some(
      u => u.nickname === nickname
    );
    if (userExists) {
      throw new Error('Nickname ya está en uso en esta sala');
    }

    // Nota: Se removió validación de dispositivo para permitir múltiples usuarios
    // desde la misma IP (útil para testing y demostración)

    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getAllRooms() {
    return Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      type: room.type,
      userCount: room.getUserCount(),
      createdAt: room.createdAt
    }));
  }

  deleteRoom(roomId) {
    if (this.rooms.has(roomId)) {
      this.rooms.delete(roomId);
      return true;
    }
    return false;
  }

  getRoomStats(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      id: room.id,
      name: room.name,
      type: room.type,
      userCount: room.getUserCount(),
      messageCount: room.messages.length,
      fileCount: room.files.length,
      users: room.getUsers(),
      createdAt: room.createdAt
    };
  }

  cleanEmptyRooms() {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.isEmpty()) {
        this.rooms.delete(roomId);
      }
    }
  }
}

module.exports = new RoomService();
