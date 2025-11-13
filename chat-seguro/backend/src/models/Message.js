import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  nickname: { type: String, required: true },
  content: String,
  type: { type: String, enum: ['text', 'file'], default: 'text' },
  fileName: String,
  fileSize: Number,
  fileUrl: String
}, { timestamps: true });

messageSchema.index({ roomId: 1, createdAt: -1 });
export default mongoose.model('Message', messageSchema);