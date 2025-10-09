import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ttsRouter from './routes/tts.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', ttsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CreoleCentric TTS API - Express.js Example',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      credits: 'GET /api/credits/balance',
      voices: 'GET /api/tts/voices',
      models: 'GET /api/tts/models',
      createJob: 'POST /api/tts/jobs',
      getJobStatus: 'GET /api/tts/jobs/:jobId',
      getJobDetails: 'GET /api/tts/jobs/:jobId/details',
      listJobs: 'GET /api/tts/jobs',
      cancelJob: 'POST /api/tts/jobs/:jobId/cancel',
    },
    documentation: 'https://creolecentric.com/developer',
  });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`📖 API Documentation: https://creolecentric.com/developer`);
});
