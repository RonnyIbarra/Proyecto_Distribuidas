const roomService = require('../services/roomService');

describe('RoomService', () => {
  let roomId;

  test('debe crear una sala', async () => {
    const room = await roomService.createRoom('TestRoom', 'text', '1234');
    expect(room).toBeDefined();
    expect(room.id).toBeDefined();
    expect(room.name).toBe('TestRoom');
    expect(room.type).toBe('text');
    roomId = room.id;
  });

  test('debe fallar si faltan parámetros', async () => {
    try {
      await roomService.createRoom('', 'text', '1234');
      fail('Debería lanzar error');
    } catch (error) {
      expect(error.message).toContain('Faltan parámetros');
    }
  });

  test('debe fallar si tipo inválido', async () => {
    try {
      await roomService.createRoom('TestRoom', 'invalid', '1234');
      fail('Debería lanzar error');
    } catch (error) {
      expect(error.message).toContain('Tipo de sala inválido');
    }
  });

  test('debe fallar si PIN muy corto', async () => {
    try {
      await roomService.createRoom('TestRoom', 'text', '12');
      fail('Debería lanzar error');
    } catch (error) {
      expect(error.message).toContain('al menos 4 dígitos');
    }
  });

  test('debe obtener todas las salas', () => {
    const rooms = roomService.getAllRooms();
    expect(Array.isArray(rooms)).toBe(true);
    expect(rooms.length).toBeGreaterThan(0);
  });

  test('debe obtener sala por ID', () => {
    const room = roomService.getRoom(roomId);
    expect(room).toBeDefined();
    expect(room.id).toBe(roomId);
  });

  test('debe eliminar una sala', () => {
    const deleted = roomService.deleteRoom(roomId);
    expect(deleted).toBe(true);

    const room = roomService.getRoom(roomId);
    expect(room).toBeUndefined();
  });

  test('debe fallar al eliminar sala inexistente', () => {
    const deleted = roomService.deleteRoom('nonexistent');
    expect(deleted).toBe(false);
  });
});
