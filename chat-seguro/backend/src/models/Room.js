import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true },
  pin: { type: String, required: true },
  type: { type: String, enum: ['text', 'multimedia'], required: true },
  createdBy: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

roomSchema.pre('save', function(next) {
  if (!this.roomId) {
    this.roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

export default mongoose.model('Room', roomSchema);