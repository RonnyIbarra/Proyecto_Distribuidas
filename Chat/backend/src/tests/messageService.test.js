const messageService = require('../services/messageService');

describe('MessageService', () => {
  const roomId = 'test-room-123';

  test('debe validar mensaje vacío', () => {
    try {
      messageService.validateMessage('');
      fail('Debería lanzar error');
    } catch (error) {
      expect(error.message).toContain('vacío');
    }
  });

  test('debe validar mensaje muy largo', () => {
    try {
      const longMessage = 'a'.repeat(6000);
      messageService.validateMessage(longMessage);
      fail('Debería lanzar error');
    } catch (error) {
      expect(error.message).toContain('demasiado largo');
    }
  });

  test('debe agregar mensaje válido', () => {
    const message = messageService.addMessage(roomId, {
      nickname: 'testuser',
      content: 'Hola mundo'
    });

    expect(message).toBeDefined();
    expect(message.id).toBeDefined();
    expect(message.nickname).toBe('testuser');
    expect(message.content).toBe('Hola mundo');
    expect(message.timestamp).toBeDefined();
  });

  test('debe obtener mensajes de una sala', () => {
    messageService.addMessage(roomId, {
      nickname: 'user1',
      content: 'Mensaje 1'
    });

    messageService.addMessage(roomId, {
      nickname: 'user2',
      content: 'Mensaje 2'
    });

    const messages = messageService.getMessages(roomId);
    expect(messages.length).toBeGreaterThanOrEqual(2);
  });

  test('debe limpiar mensajes de una sala', () => {
    messageService.addMessage(roomId, {
      nickname: 'user',
      content: 'test'
    });

    messageService.clearRoomMessages(roomId);
    const messages = messageService.getMessages(roomId);

    expect(messages.length).toBe(0);
  });

  test('debe respetar límite de mensajes', () => {
    for (let i = 0; i < 100; i++) {
      messageService.addMessage(roomId, {
        nickname: 'user',
        content: `Mensaje ${i}`
      });
    }

    const messages = messageService.getMessages(roomId, 50);
    expect(messages.length).toBe(50);
  });
});
