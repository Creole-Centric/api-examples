import express, { Request, Response } from 'express';
import { CreoleCentricAPI, TTSJobRequest } from '../lib/creolecentric.js';

const router = express.Router();

// Initialize API client
const apiKey = process.env.CREOLECENTRIC_API_KEY;
const apiUrl = process.env.CREOLECENTRIC_API_URL;

if (!apiKey) {
  throw new Error('CREOLECENTRIC_API_KEY environment variable is required');
}

const client = new CreoleCentricAPI({
  apiKey,
  baseUrl: apiUrl,
});

// Health check
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await client.checkHealth();
    res.json(health);
  } catch (error) {
    throw error;
  }
});

// Get credit balance
router.get('/credits/balance', async (req: Request, res: Response) => {
  try {
    const balance = await client.getCreditBalance();
    res.json(balance);
  } catch (error) {
    throw error;
  }
});

// Get available voices
router.get('/tts/voices', async (req: Request, res: Response) => {
  try {
    const voices = await client.getVoices();
    res.json(voices);
  } catch (error) {
    throw error;
  }
});

// Get available models
router.get('/tts/models', async (req: Request, res: Response) => {
  try {
    const models = await client.getModels();
    res.json(models);
  } catch (error) {
    throw error;
  }
});

// Create TTS job
router.post('/tts/jobs', async (req: Request, res: Response) => {
  try {
    const jobRequest: TTSJobRequest = req.body;

    // Validate required fields
    if (!jobRequest.text || jobRequest.text.trim() === '') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const job = await client.createTTSJob(jobRequest);
    res.json(job);
  } catch (error) {
    throw error;
  }
});

// Get job status
router.get('/tts/jobs/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const job = await client.getJobStatus(jobId);
    res.json(job);
  } catch (error) {
    throw error;
  }
});

// Get job details
router.get('/tts/jobs/:jobId/details', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const job = await client.getJobDetails(jobId);
    res.json(job);
  } catch (error) {
    throw error;
  }
});

// List jobs
router.get('/tts/jobs', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const jobs = await client.listJobs(limit, offset);
    res.json(jobs);
  } catch (error) {
    throw error;
  }
});

// Cancel job
router.post('/tts/jobs/:jobId/cancel', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    const result = await client.cancelJob(jobId);
    res.json(result);
  } catch (error) {
    throw error;
  }
});

export default router;
