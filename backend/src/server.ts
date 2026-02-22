import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { connectDatabase } from './config/database';
import userRoutes from './routes/user.routes';
import chatRoutes from './routes/chat.routes';
import notificationRoutes from './routes/notification.routes';
import escrowRoutes from './routes/escrow.routes';
import disputeRoutes from './routes/dispute.routes';
import activityRoutes from './routes/activity.routes';
import ratingRoutes from './routes/rating.routes';
import aiRoutes from './routes/ai.routes';
import badgeRoutes from './routes/badge.routes';
import { setupSocketHandlers } from './services/socket.service';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/badges', badgeRoutes);

setupSocketHandlers(io);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

connectDatabase()
  .then(() => {
    console.log('✅ Database ready');
  })
  .catch((error) => {
    console.warn('⚠️ MongoDB not available — DB-dependent routes will fail, but blockchain routes will work.');
  });

export { io };
