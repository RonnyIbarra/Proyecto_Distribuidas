import { parentPort } from 'worker_threads';
import Room from '../models/Room.js';
import Message from '../models/Message.js';
import { redisClient } from '../utils/db.js';
import { comparePin } from '../middleware/auth.js';

parentPort.on('message', async ({ type, data, socket, msg }) => {
  try {
    if (type === 'JOIN') {
      const { roomId, pin, nickname, ip } = data;
      const room = await Room.findOne({ roomId, active: true });
      if (!room || !(await comparePin(pin, room.pin))) {
        socket.emit('error', 'PIN inválido'); return;
      }
      const key = `session:${ip}`;
      if (await redisClient.get(key)) {
        socket.emit('error', 'Ya estás conectado'); return;
      }
      await redisClient.setEx(key, 1800, JSON.stringify({ roomId, nickname }));
      socket.join(roomId);
      socket.emit('joined', { roomId, type: room.type });
      socket.to(roomId).emit('user-joined', nickname);
    }
    if (type === 'MESSAGE') {
      const message = await Message.create(msg);
      parentPort.postMessage({ type: 'BROADCAST', roomId: msg.roomId, message });
    }
  } catch (err) {
    socket.emit('error', 'Error');
  }
});