import express from 'express';
import { getFileStream } from '../utils/gridfs.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const stream = getFileStream(new mongoose.Types.ObjectId(req.params.id));
    stream.pipe(res);
  } catch {
    res.status(404).json({ error: 'Archivo no encontrado' });
  }
});

export default router;