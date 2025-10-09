import { Request, Response, NextFunction } from 'express';
import { CreoleCentricAPIError } from '../lib/creolecentric.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  if (err instanceof CreoleCentricAPIError) {
    return res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseBody,
    });
  }

  res.status(500).json({
    error: err.message || 'Internal server error',
  });
}
