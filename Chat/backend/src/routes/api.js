const express = require('express');
const authService = require('../services/authService');
const authMiddleware = require('../middleware/authMiddleware');
const roomService = require('../services/roomService');
const fileService = require('../services/fileService');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const result = await authService.login(username, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Crear sala (requiere autenticación)
router.post('/rooms', authMiddleware, async (req, res) => {
  try {
    const { name, type, pin } = req.body;

    const room = await roomService.createRoom(name, type, pin);
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener todas las salas
router.get('/rooms', (req, res) => {
  try {
    const rooms = roomService.getAllRooms();
    res.json(rooms);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener estadísticas de una sala
router.get('/rooms/:roomId/stats', (req, res) => {
  try {
    const stats = roomService.getRoomStats(req.params.roomId);
    if (!stats) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar sala (requiere autenticación)
router.delete('/rooms/:roomId', authMiddleware, (req, res) => {
  try {
    const deleted = roomService.deleteRoom(req.params.roomId);
    if (deleted) {
      res.json({ message: 'Sala eliminada' });
    } else {
      res.status(404).json({ error: 'Sala no encontrada' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para subir archivos a una sala (multipart/form-data)
router.post('/rooms/:roomId/upload', async (req, res) => {
  try {
    const roomId = req.params.roomId;
    
    console.log('=== UPLOAD REQUEST ===');
    console.log('roomId:', roomId);
    console.log('req.files disponible:', !!req.files);
    console.log('req.body:', req.body);
    
    if (req.files) {
      console.log('req.files keys:', Object.keys(req.files));
      for (const key in req.files) {
        const f = req.files[key];
        console.log(`  - ${key}:`, {
          name: f.name,
          originalname: f.originalname,
          mimetype: f.mimetype,
          size: f.size,
          data: f.data ? `[Buffer ${f.data.length} bytes]` : 'no data'
        });
      }
    }

    // Validar que se recibió archivo
    if (!req.files) {
      console.error('ERROR: req.files no está disponible');
      return res.status(400).json({ error: 'No se recibió archivo - req.files undefined' });
    }

    if (!req.files.file) {
      console.error('ERROR: req.files.file no existe');
      return res.status(400).json({ error: 'No se recibió archivo en campo "file"' });
    }

    const file = req.files.file;
    console.log('Archivo recibido correctamente:', file.name);

    const room = roomService.getRoom(roomId);
    if (!room) return res.status(404).json({ error: 'Sala no encontrada' });

    const nickname = req.body.nickname || 'Anonimo';

    // Validar que la sala permita multimedia
    if (room.type !== 'multimedia') {
      return res.status(400).json({ error: 'Esta sala no permite archivos' });
    }

    console.log(`Subida iniciada: ${file.name} (${file.size} bytes) por ${nickname}`);

    const fileInfo = await fileService.saveFile(file, roomId);
    room.addFile(fileInfo);

    // Emitir evento a través de Socket.IO si está disponible
    const io = req.app && req.app.locals && req.app.locals.io;
    if (io) {
      io.to(roomId).emit('file-uploaded', {
        ...fileInfo,
        uploadedBy: nickname
      });
    }

    console.log('✓ Archivo guardado exitosamente');
    res.json({ success: true, file: fileInfo });
  } catch (error) {
    console.error('ERROR en /upload:', error.message, error.stack);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
