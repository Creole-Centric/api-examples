'use client';

import { useState } from 'react';

interface TTSJob {
  id: string;
  status: 'queued' | 'processing' | 'synthesized' | 'uploaded' | 'delivered' | 'failed' | 'cancelled';
  text: string;
  voice_id: string;
  model_id: string;
  audio_url?: string;
  duration_seconds?: number;
  credits_used?: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export default function Home() {
  const [text, setText] = useState('');
  const [voiceId, setVoiceId] = useState('i4mRPwKM2yHwXhbmkN514'); // Xavier Bruneau default
  const [modelId, setModelId] = useState('ccl_ht_v100');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<TTSJob | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setJob(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_id: voiceId,
          model_id: modelId,
          speed,
          pitch,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create TTS job');
      }

      const jobData: TTSJob = await response.json();
      setJob(jobData);

      // Poll for job completion
      pollJobStatus(jobData.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job status');
        }

        const jobData: TTSJob = await response.json();
        setJob(jobData);

        if (['delivered', 'failed', 'cancelled'].includes(jobData.status)) {
          setLoading(false);
          return;
        }

        // Continue polling
        setTimeout(checkStatus, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check job status');
        setLoading(false);
      }
    };

    checkStatus();
  };

  return (
    <div className="container">
      <h1>CreoleCentric TTS Example</h1>
      <p className="subtitle">Convert text to speech using the CreoleCentric API</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="text">Text to Convert</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter Haitian Creole text..."
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="voice">Voice ID</label>
          <input
            type="text"
            id="voice"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            disabled={loading}
          />
          <p className="info-text">Default: Xavier Bruneau (i4mRPwKM2yHwXhbmkN514)</p>
        </div>

        <div className="form-group">
          <label htmlFor="model">Model ID</label>
          <select
            id="model"
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            disabled={loading}
          >
            <option value="ccl_ht_v100">Haitian Creole v100</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="speed">Speed: {speed}</label>
          <input
            type="number"
            id="speed"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="pitch">Pitch: {pitch}</label>
          <input
            type="number"
            id="pitch"
            min="0.5"
            max="2.0"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading || !text.trim()}>
          {loading ? 'Processing...' : 'Generate Speech'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {job && (
        <div className="status-card">
          <h3>Job Status</h3>
          <p>
            <strong>Job ID:</strong> {job.id}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={`status-badge status-${job.status}`}>
              {job.status}
            </span>
          </p>
          {job.duration_seconds && (
            <p>
              <strong>Duration:</strong> {job.duration_seconds.toFixed(2)} seconds
            </p>
          )}
          {job.credits_used && (
            <p>
              <strong>Credits Used:</strong> {job.credits_used}
            </p>
          )}
          {job.error_message && (
            <p style={{ color: '#991b1b' }}>
              <strong>Error:</strong> {job.error_message}
            </p>
          )}

          {job.audio_url && (
            <div className="audio-player">
              <h4>Generated Audio</h4>
              <audio controls src={job.audio_url}>
                Your browser does not support the audio element.
              </audio>
              <p>
                <a href={job.audio_url} download target="_blank" rel="noopener noreferrer">
                  Download Audio
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
