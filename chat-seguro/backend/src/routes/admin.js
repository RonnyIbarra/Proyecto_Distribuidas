const express = require('express');
const router = express.Router();

// Credenciales de admin (en producción usa hash)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'chat2025'
};

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    res.json({ success: true, token: 'admin-token-2025' });
  } else {
    res.status(401).json({ error: 'Credenciales incorrectas' });
  }
});

// Crear sala
router.post('/rooms', (req, res) => {
  const { roomId, pin, type = 'text' } = req.body;
  if (!roomId || !pin) return res.status(400).json({ error: 'Faltan datos' });

  // Aquí guardarías en MongoDB
  global.rooms = global.rooms || {};
  global.rooms[roomId] = { pin, type, users: [] };

  res.json({ success: true, roomId });
});

module.exports = router;