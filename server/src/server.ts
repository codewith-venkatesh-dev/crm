import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import leadRoutes from './routes/leadRoutes';
import followUpRoutes, { followUpDirectRouter } from './routes/followUpRoutes';
import activityRoutes from './routes/activityRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Cross-origin and JSON body parsing
app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/leads', leadRoutes);
app.use('/api/leads/:leadId/follow-ups', followUpRoutes);
app.use('/api/follow-ups', followUpDirectRouter);
app.use('/api/leads/:leadId/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Mini CRM Backend running on http://localhost:${PORT}`);
});
