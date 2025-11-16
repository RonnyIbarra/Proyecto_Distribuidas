const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class FileService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;
    this.allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(',');
    
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  validateFile(file) {
    if (!file) {
      throw new Error('No se proporcionó archivo');
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`Archivo demasiado grande. Máximo: ${this.maxFileSize / 1024 / 1024}MB`);
    }

    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new Error(`Tipo de archivo no permitido. Permitidos: ${this.allowedTypes.join(', ')}`);
    }

    return true;
  }

  async saveFile(file, roomId) {
    this.validateFile(file);

    const fileId = uuidv4();
    const ext = path.extname(file.originalname);
    const filename = `${roomId}_${fileId}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    await file.mv(filepath);

    return {
      id: fileId,
      filename: filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
      url: `/api/files/${roomId}/${filename}`
    };
  }

  getFilePath(roomId, filename) {
    return path.join(this.uploadDir, filename);
  }

  deleteFile(filepath) {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return true;
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
    return false;
  }

  getRoomFiles(roomId, files) {
    return files.filter(f => f.filename.startsWith(roomId));
  }
}

module.exports = new FileService();
