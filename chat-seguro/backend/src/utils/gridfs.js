import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let gfs;
mongoose.connection.once('open', () => {
  gfs = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
});

export const uploadToGridFS = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = gfs.openUploadStream(file.originalname);
    uploadStream.end(file.buffer);
    uploadStream.on('finish', () => resolve(uploadStream.id));
    uploadStream.on('error', reject);
  });
};

export const getFileStream = (id) => gfs.openDownloadStream(id);