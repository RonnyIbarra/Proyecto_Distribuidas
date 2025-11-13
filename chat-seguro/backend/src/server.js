import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { connectDB } from './utils/db.js';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import uploadRoutes from './routes/upload.js';
import fileRoutes from './routes/files.js';
import { setupSockets } from './sockets/chat.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:5173" } });

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/files', fileRoutes);

setupSockets(io);
connectDB();

server.listen(process.env.PORT, () => console.log(`Backend en puerto ${process.env.PORT}`));