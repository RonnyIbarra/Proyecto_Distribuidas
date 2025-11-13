import express from 'express';
import Room from '../models/Room.js';
import { verifyAdmin, hashPin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyAdmin, async (req, res) => {
  const { pin, type } = req.body;
  if (!pin || pin.length < 4) return res.status(400).json({ error: 'PIN ≥ 4 dígitos' });

  const hashedPin = await hashPin(pin);
  const room = await Room.create({ pin: hashedPin, type, createdBy: 'admin' });
  res.status(201).json({ roomId: room.roomId, type: room.type });
});

export default router;