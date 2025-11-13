import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const setupSockets = (io) => {
  io.on('connection', (socket) => {
    const ip = socket.handshake.address.replace('::ffff:', '');
    const worker = new Worker(path.resolve(__dirname, '../workers/broadcastWorker.js'));
    worker.on('message', (msg) => {
      if (msg.type === 'BROADCAST') io.to(msg.roomId).emit('new-message', msg.message);
    });
    socket.ip = ip;
    socket.on('join-room', (data) => worker.postMessage({ type: 'JOIN', data: { ...data, ip }, socket }));
    socket.on('send-message', (msg) => worker.postMessage({ type: 'MESSAGE', msg: { ...msg, ip } }));
    socket.on('disconnect', () => worker.terminate());
  });
};