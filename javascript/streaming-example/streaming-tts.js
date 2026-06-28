#!/usr/bin/env node
/**
 * CreoleCentric Streaming TTS Example (Node.js)
 * =============================================
 *
 * Demonstrates the live-streaming TTS endpoint:
 *
 *     POST /v1/users/dev/tts/stream/
 *
 * The response body is a Server-Sent Events stream of base64-encoded
 * 24 kHz mono 16-bit PCM chunks, ending with a `done` event that
 * carries the saved S3 audio URL.
 *
 * Use streaming when you need low-latency playback (live voice agents,
 * phone bots, real-time interactive apps). For batch jobs, use the
 * regular /v1/tts/jobs/ endpoint.
 *
 * Billing: 1.5x the standard per-character rate (same premium as
 * Express mode). Cancelling mid-stream refunds credits proportional
 * to the audio not yet delivered.
 *
 * Requires Node.js 18+ (native `fetch` + ReadableStream).
 */
import { writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import 'dotenv/config';

const API_KEY = process.env.CREOLECENTRIC_API_KEY;
const API_URL = process.env.CREOLECENTRIC_API_URL
  || 'https://api.creolecentric.com/v1';
const VOICE_ID = process.env.CREOLECENTRIC_VOICE_ID
  || 'smgykWMfupuWlPLWf0Zi9';

if (!API_KEY) {
  console.error('error: set CREOLECENTRIC_API_KEY in your environment '
    + '(or in a .env file)');
  process.exit(1);
}

/**
 * Wrap raw 24 kHz mono 16-bit PCM in a standard RIFF/WAV header so
 * the saved file opens in any audio app.
 */
function buildWavHeader(numSamples, sampleRate = 24000,
                        channels = 1, bitsPerSample = 16) {
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const dataSize = numSamples * blockAlign;
  const buf = Buffer.alloc(44);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);             // fmt chunk size
  buf.writeUInt16LE(1, 20);              // PCM format
  buf.writeUInt16LE(channels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  return buf;
}

/**
 * Iterate SSE events out of a chunked HTTP body. SSE frames are
 * separated by `\n\n`; within each frame we only emit lines that
 * start with `data:` (parsed as JSON).
 */
async function* iterSseEvents(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      for (const line of frame.split('\n')) {
        if (line.startsWith('data:')) {
          yield JSON.parse(line.slice(5).trim());
        }
      }
    }
  }
}

async function streamTts(text, voiceId, modelId = 'ccl_ht_gem_pro',
                         outputWav = 'output.wav') {
  const t0 = performance.now();
  let firstByteMs = null;
  const pcmChunks = [];
  let doneEvent = null;

  const response = await fetch(`${API_URL}/users/dev/tts/stream/`, {
    method: 'POST',
    headers: {
      Authorization: `ApiKey ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, voice_id: voiceId, model_id: modelId }),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  for await (const event of iterSseEvents(response)) {
    switch (event.type) {
      case 'open':
        console.log(`[open]  job=${event.job_id}  ${event.mime}`);
        break;
      case 'chunk':
        if (firstByteMs === null) {
          firstByteMs = performance.now() - t0;
          console.log(`[ttfb]  first PCM byte at ${firstByteMs.toFixed(0)} ms`);
        }
        pcmChunks.push(Buffer.from(event.pcm_b64, 'base64'));
        break;
      case 'done': {
        doneEvent = event;
        const wallMs = performance.now() - t0;
        const pcmBytes = pcmChunks.reduce((n, c) => n + c.length, 0);
        console.log(`[done]  ${pcmChunks.length} chunks  `
          + `${pcmBytes.toLocaleString()} PCM bytes  `
          + `duration=${event.duration_seconds.toFixed(2)}s  `
          + `wall=${wallMs.toFixed(0)} ms`);
        console.log(`[done]  saved audio: ${event.audio_url}`);
        break;
      }
      case 'cancelled':
        throw new Error(`Stream cancelled by server: ${event.reason}`);
      case 'error':
        throw new Error(`Stream error [${event.code}]: ${event.message}`);
    }
  }

  if (!doneEvent) throw new Error('Stream ended without a `done` event');

  if (outputWav && pcmChunks.length) {
    const pcm = Buffer.concat(pcmChunks);
    const header = buildWavHeader(pcm.length / 2); // 16-bit = 2 bytes/sample
    writeFileSync(outputWav, Buffer.concat([header, pcm]));
    console.log(`[wav]   wrote ${outputWav} (${pcm.length.toLocaleString()} PCM bytes)`);
  }

  return doneEvent;
}

const text = 'Bonjou tout moun! Mwen kontan we ou la jodi a. '
  + 'Mèsi anpil pou prezans ou.';

try {
  const result = await streamTts(text, VOICE_ID);
  console.log(`\nFinal audio URL: ${result.audio_url}`);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
