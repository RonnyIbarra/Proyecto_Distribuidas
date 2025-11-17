const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class FileService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');

    // Tamaño máximo permitido: 10 MB
    this.maxFileSize = 10 * 1024 * 1024;

    // Tipos permitidos
    this.allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf'
    ];
    
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  validateFile(file) {
    if (!file) throw new Error('No se proporcionó archivo');

    const fileName = file.originalname || file.name;
    if (!fileName || fileName.trim() === '') {
      throw new Error('El archivo no tiene un nombre válido');
    }

    // VALIDACIÓN DE TAMAÑO (10 MB)
    if (file.size > this.maxFileSize) {
      throw new Error('Archivo demasiado grande. Máximo permitido: 10MB');
    }

    if (!file.mimetype) {
      throw new Error('No se pudo determinar el tipo de archivo');
    }

    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new Error(
        `Tipo de archivo no permitido. 
         Permitidos: JPG, PNG, GIF, PDF 
         Recibido: ${file.mimetype}`
      );
    }

    return true;
  }

  async saveFile(file, roomId) {
    console.log('saveFile - recibido:', {
      name: file.name,
      size: file.size,
      type: file.mimetype
    });
    
    // ejecutar validaciones
    this.validateFile(file);

    const fileId = uuidv4();
    const fileName = file.originalname || file.name;
    const ext = path.extname(fileName);
    const filename = `${roomId}_${fileId}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    console.log(`Guardando archivo: ${filename}`);

    try {
      if (!file.data) {
        throw new Error('El archivo no incluye datos para guardar');
      }

      await fs.promises.writeFile(filepath, file.data);
      console.log(`Archivo guardado: ${filepath}`);
    } catch (err) {
      console.error('Error guardando archivo:', err);
      throw new Error(`Error guardando archivo: ${err.message}`);
    }

    return {
      id: fileId,
      filename,
      originalName: fileName,
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
