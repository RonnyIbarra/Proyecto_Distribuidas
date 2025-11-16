require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');

const apiRoutes = require('./routes/api');
const authService = require('./services/authService');
const roomService = require('./services/roomService');
const messageService = require('./services/messageService');
const fileService = require('./services/fileService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas API
app.use('/api', apiRoutes);

// Descarga de archivos
app.get('/api/files/:roomId/:filename', (req, res) => {
  try {
    const filepath = fileService.getFilePath(req.params.roomId, req.params.filename);
    res.download(filepath);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Socket.IO - Conexiones en tiempo real
const userSessions = new Map(); // Map<socketId, userInfo>
const roomUsers = new Map(); // Map<roomId, Set<socketId>>

io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  // Evento: unirse a una sala
  socket.on('join-room', async (data) => {
    try {
      const { roomId, pin, nickname, deviceIp } = data;

      // Validar acceso a la sala
      const room = await roomService.joinRoom(roomId, pin, nickname, deviceIp);

      // Guardar información del usuario
      const userInfo = {
        socketId: socket.id,
        nickname,
        deviceIp,
        joinedAt: new Date(),
        roomId
      };

      userSessions.set(socket.id, userInfo);

      // Agregar usuario a la sala
      room.addUser(socket.id, userInfo);

      // Unir socket a la sala
      socket.join(roomId);

      // Notificar a los demás usuarios
      io.to(roomId).emit('user-joined', {
        nickname,
        users: room.getUsers(),
        timestamp: new Date()
      });

      // Enviar historial de mensajes al nuevo usuario
      const messages = messageService.getMessages(roomId);
      socket.emit('load-messages', messages);

      console.log(`${nickname} se unió a la sala ${roomId}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Evento: enviar mensaje
  socket.on('send-message', (data) => {
    try {
      const userInfo = userSessions.get(socket.id);
      if (!userInfo) {
        socket.emit('error', { message: 'Usuario no autenticado' });
        return;
      }

      const content = messageService.validateMessage(data.content);
      const roomId = userInfo.roomId;

      const message = messageService.addMessage(roomId, {
        nickname: userInfo.nickname,
        content
      });

      io.to(roomId).emit('receive-message', message);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Evento: subir archivo (solo en salas multimedia)
  socket.on('upload-file', async (data) => {
    try {
      const userInfo = userSessions.get(socket.id);
      if (!userInfo) {
        socket.emit('error', { message: 'Usuario no autenticado' });
        return;
      }

      const room = roomService.getRoom(userInfo.roomId);
      if (!room || room.type !== 'multimedia') {
        socket.emit('error', { message: 'Esta sala no permite archivos' });
        return;
      }

      const file = data.file;
      const fileInfo = await fileService.saveFile(file, userInfo.roomId);

      room.addFile(fileInfo);

      io.to(userInfo.roomId).emit('file-uploaded', {
        ...fileInfo,
        uploadedBy: userInfo.nickname
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Evento: escribiendo
  socket.on('typing', (data) => {
    const userInfo = userSessions.get(socket.id);
    if (userInfo) {
      socket.to(userInfo.roomId).emit('user-typing', {
        nickname: userInfo.nickname
      });
    }
  });

  // Evento: desconexión
  socket.on('disconnect', () => {
    const userInfo = userSessions.get(socket.id);
    if (userInfo) {
      const room = roomService.getRoom(userInfo.roomId);
      if (room) {
        room.removeUser(socket.id);

        io.to(userInfo.roomId).emit('user-left', {
          nickname: userInfo.nickname,
          users: room.getUsers()
        });

        // Limpiar salas vacías
        roomService.cleanEmptyRooms();
      }
      userSessions.delete(socket.id);
    }
    console.log(`Usuario desconectado: ${socket.id}`);
  });

  // Manejo de errores en Socket.IO
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Inicializar servicio de autenticación
async function initializeApp() {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    await authService.initializeAdmin(adminUsername, adminPassword);
    console.log('✓ Autenticación del administrador configurada');
  } catch (error) {
    console.error('Error inicializando aplicación:', error);
  }
}

// Iniciar servidor
const PORT = process.env.PORT || 3000;

initializeApp().then(() => {
  server.listen(PORT, () => {
    console.log(`✓ Servidor ejecutándose en puerto ${PORT}`);
    console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Rechazo no manejado en:', promise, 'razón:', reason);
});

module.exports = { app, server, io };
