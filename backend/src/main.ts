/**
 * AIO Hub Backend - Main Entry Point
 * 
 * Express Server mit:
 * - CORS & Helmet für Sicherheit
 * - Morgan für Request Logging
 * - JSON Body Parser
 * - Health Check Endpoint
 * - API Routes
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { prisma } from './prisma/client';
import authRoutes from './routes/auth.routes';
import todoRoutes from './routes/todo.routes';
import eventRoutes from './routes/event.routes';
import bodyMetricRoutes from './routes/bodymetric.routes';
import workoutRoutes from './routes/workout.routes';
import nutritionRoutes from './routes/nutrition.routes';

// Umgebungsvariablen laden
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ============================================
// MIDDLEWARE
// ============================================

// Security Headers
app.use(helmet());

// CORS aktivieren
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Request Logging (nur in Development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// JSON Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/body-metrics', bodyMetricRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`
  });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ============================================
// SERVER START
// ============================================

const startServer = async () => {
  try {
    // Datenbankverbindung testen
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Server starten
    app.listen(PORT, () => {
      console.log(`🚀 AIO Hub Backend running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Server starten
startServer();

export default app;
