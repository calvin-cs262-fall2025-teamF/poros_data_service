import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import companyRoutes from './routes/companies';
import applicationRoutes from './routes/applications';
import resumeRoutes from './routes/resumes';
import checklistRoutes from './routes/checklist';

// Import error handler
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
// CORS - Allow all origins (important for Expo and web clients)
// Expo apps and web browsers need CORS to work
app.use(cors({
  origin: true, // Allow all origins - works for Expo, web, and mobile apps
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/checklist', checklistRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server (only in non-serverless environments)
// Vercel uses serverless functions, so we don't start a server there
// For local development and other platforms, start the server normally
if (process.env.VERCEL !== '1' && process.env.VERCEL_ENV !== 'production') {
  const serverPort = process.env.PORT || PORT;
  app.listen(Number(serverPort), '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${serverPort}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${serverPort}/health`);
  });
}

// Export app for Vercel serverless functions
export default app;


