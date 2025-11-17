const { v4: uuidv4 } = require("uuid");

class MessageService {
  constructor() {
    // Map<roomId, Array<messages>>
    this.messageHistory = new Map();
  }

  /**
   * Agrega un mensaje (texto o archivo)
   */
  addMessage(roomId, message) {
    const msgData = {
      id: uuidv4(),
      nickname: message.nickname,
      content: message.content || null,   // texto o null si es archivo
      file: message.file || null,         // archivo o null
      timestamp: new Date(),
      type: message.type || "text"        // "text" | "file"
    };

    if (!this.messageHistory.has(roomId)) {
      this.messageHistory.set(roomId, []);
    }

    this.messageHistory.get(roomId).push(msgData);
    return msgData;
  }

  /**
   * Obtiene los últimos mensajes (texto/archivo)
   */
  getMessages(roomId, limit = 50) {
    const messages = this.messageHistory.get(roomId) || [];
    return messages.slice(-limit);
  }

  /**
   * Limpia mensajes de una sala
   */
  clearRoomMessages(roomId) {
    this.messageHistory.delete(roomId);
  }

  /**
   * Valida contenido de mensaje según el tipo
   */
  validateMessage(content, type = "text") {
    // 📌 NO VALIDAR TEXTO si el mensaje es de archivo
    if (type === "file") {
      return true;
    }

    // 📌 Validación para mensajes de texto
    if (!content || typeof content !== "string") {
      throw new Error("Contenido de mensaje inválido");
    }

    if (content.trim().length === 0) {
      throw new Error("El mensaje no puede estar vacío");
    }

    if (content.length > 5000) {
      throw new Error("El mensaje es demasiado largo (máx 5000 caracteres)");
    }

    return content.trim();
  }
}

module.exports = new MessageService();
