import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://aba-child.pages.dev',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// API version endpoint
app.get('/api/version', (req: Request, res: Response) => {
  res.json({
    version: '1.0.0',
    api: 'v1',
    features: [
      'schedule-management',
      'child-profiles',
      'session-logging',
      'reports',
      'backup-restore',
      'encryption',
    ],
  });
});

// TODO: Import route handlers
// import reportRoutes from './routes/report.js';
// import passwordRoutes from './routes/password-setup.js';
// import backupRoutes from './routes/backup.js';
// app.use('/api', reportRoutes);
// app.use('/api/password', passwordRoutes);
// app.use('/api/backup', backupRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`[${NODE_ENV}] Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
