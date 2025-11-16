const { v4: uuidv4 } = require('uuid');

class MessageService {
  constructor() {
    this.messageHistory = new Map(); // Map<roomId, messages>
  }

  addMessage(roomId, message) {
    const msgData = {
      id: uuidv4(),
      nickname: message.nickname,
      content: message.content,
      timestamp: new Date(),
      type: 'text'
    };

    if (!this.messageHistory.has(roomId)) {
      this.messageHistory.set(roomId, []);
    }

    this.messageHistory.get(roomId).push(msgData);
    return msgData;
  }

  getMessages(roomId, limit = 50) {
    const messages = this.messageHistory.get(roomId) || [];
    return messages.slice(-limit);
  }

  clearRoomMessages(roomId) {
    this.messageHistory.delete(roomId);
  }

  validateMessage(content) {
    if (!content || typeof content !== 'string') {
      throw new Error('Contenido de mensaje inválido');
    }

    if (content.trim().length === 0) {
      throw new Error('El mensaje no puede estar vacío');
    }

    if (content.length > 5000) {
      throw new Error('El mensaje es demasiado largo (máx 5000 caracteres)');
    }

    return content.trim();
  }
}

module.exports = new MessageService();
