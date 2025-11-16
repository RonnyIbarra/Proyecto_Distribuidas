import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// CARPETA UPLOADS
const uploadDir = join(__dirname, 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// CONEXIÓN MONGO
mongoose.connect('mongodb://mongo_db:27017/chat_seguro', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('MongoDB error:', err));

// SALAS
global.rooms = {};

// RUTAS ADMIN
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'chat2025') {
    res.json({ success: true, token: 'admin-token-2025' });
  } else {
    res.status(401).json({ error: 'Credenciales incorrectas' });
  }
});

app.post('/api/admin/rooms', (req, res) => {
  const { roomId, pin, type = 'text' } = req.body;
  if (!roomId || !pin || pin.length !== 4) {
    return res.status(400).json({ error: 'PIN debe tener 4 dígitos' });
  }
  if (global.rooms[roomId]) {
    return res.status(400).json({ error: 'Sala ya existe' });
  }
  global.rooms[roomId] = { pin, type, users: [] };
  res.json({ success: true, roomId });
});

// SOCKET.IO
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('join-room', ({ roomId, nickname, pin }) => {
    const room = global.rooms[roomId];
    if (!room || room.pin !== pin) {
      socket.emit('error', { message: 'PIN incorrecto o sala no existe' });
      return;
    }
    socket.join(roomId);
    room.users.push({ id: socket.id, nickname });
    socket.emit('joined', { roomId, nickname });
    io.to(roomId).emit('user-joined', { nickname });
  });

  socket.on('send-message', (data) => {
    const { roomId, message, nickname, file } = data;
    const room = global.rooms[roomId];
    if (!room) return;

    const msg = {
      nickname,
      text: message || (file ? `[Imagen: ${file.name}]` : ''),
      file: file ? `/uploads/${file.name}` : null,
      timestamp: new Date()
    };
    io.to(roomId).emit('message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Backend en puerto ${PORT}`);
});