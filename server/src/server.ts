import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import leadRoutes from './routes/leadRoutes';
import followUpRoutes, { followUpDirectRouter } from './routes/followUpRoutes';
import activityRoutes from './routes/activityRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorHandler } from './middleware/errorHandler';
import { authenticateJWT } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Public Auth Routes
app.use('/api/auth', authRoutes);

// Protected API Routes (Requires valid JWT token)
app.use('/api/users', userRoutes);
app.use('/api/leads', authenticateJWT, leadRoutes);
app.use('/api/leads/:leadId/follow-ups', authenticateJWT, followUpRoutes);
app.use('/api/follow-ups', authenticateJWT, followUpDirectRouter);
app.use('/api/leads/:leadId/activities', authenticateJWT, activityRoutes);
app.use('/api/dashboard', authenticateJWT, dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Mini CRM Backend running on http://localhost:${PORT}`);
});
