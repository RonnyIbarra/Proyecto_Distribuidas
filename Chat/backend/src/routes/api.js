const express = require('express');
const authService = require('../services/authService');
const authMiddleware = require('../middleware/authMiddleware');
const roomService = require('../services/roomService');

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

module.exports = router;
