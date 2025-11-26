import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import tourRoutes from './routes/tours';
import familyRoutes from './routes/families';
import visitRoutes from './routes/visits';
import jokesRoutes from './routes/jokes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/jokes', jokesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-tour', (tourId: string) => {
    socket.join(`tour-${tourId}`);
    console.log(`Client ${socket.id} joined tour ${tourId}`);
  });

  socket.on('leave-tour', (tourId: string) => {
    socket.leave(`tour-${tourId}`);
    console.log(`Client ${socket.id} left tour ${tourId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

httpServer.listen(PORT, () => {
  console.log(`🎅 Santa Tracker server running on port ${PORT}`);
});

export { io };

