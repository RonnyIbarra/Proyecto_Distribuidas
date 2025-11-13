import express from 'express';
import multer from 'multer';
import { uploadToGridFS } from '../utils/gridfs.js';

const router = express.Router();
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/', 'application/pdf'];
    if (allowed.some(t => file.mimetype.startsWith(t))) cb(null, true);
    else cb(new Error('Tipo no permitido'));
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });
  const fileId = await uploadToGridFS(req.file);
  res.json({
    url: `/api/files/${fileId}`,
    fileName: req.file.originalname,
    fileSize: req.file.size
  });
});

export default router;