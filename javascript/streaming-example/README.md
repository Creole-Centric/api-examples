# CreoleCentric Streaming TTS — Node.js Example

Demonstrates the **live-streaming** TTS endpoint:

```
POST /v1/users/dev/tts/stream/
```

The response body is a Server-Sent Events stream of base64-encoded
24 kHz mono 16-bit PCM chunks, ending with a `done` event that
carries the saved S3 audio URL. First audio byte typically lands in
under 100 ms.

Use streaming when you need low-latency playback (live voice agents,
phone bots, real-time interactive apps). For batch jobs, use the
regular [`/v1/tts/jobs/`](../nodejs-example/) endpoint.

## Setup

Requires **Node.js 18+** (uses native `fetch` and `ReadableStream`).

```bash
cd javascript/streaming-example
npm install
cp .env.example .env
# edit .env and add your CREOLECENTRIC_API_KEY
npm start
```

You should see output like:

```
[open]  job=8d903aa9-244d-48dc-8ebb-249ad2d5697a  audio/L16;rate=24000
[ttfb]  first PCM byte at 87 ms
[done]  198 chunks  380,160 PCM bytes  duration=7.92s  wall=8120 ms
[done]  saved audio: https://...
[wav]   wrote output.wav (380,160 PCM bytes)
```

`output.wav` is a standard 24 kHz mono 16-bit WAV — opens in any
audio app.

## Eligibility

| Constraint | Value |
|---|---|
| Model | Must support `ccl_ht_gem_pro` (Studio Pro) |
| Text length | ≤ 600 characters |
| Voice | Built-in Studio Pro voices (Custom Voices not supported) |

If any constraint fails, the server returns HTTP 422 — fall back to
the regular `/v1/tts/jobs/` endpoint for those requests.

## Billing

**1.5x the standard per-character rate** (same premium as Express
mode). Cancelling mid-stream refunds credits **proportional to the
audio not yet delivered** — partially-streamed audio is billed at
the regular streaming rate.

| Scenario | Refund |
|---|---|
| Cancel before first chunk | 100% |
| Cancel mid-stream | proportional to audio not yet sent |
| Stream completes normally | 0% (audio delivered, full charge) |

## Cancellation

Close the HTTP connection — the easiest way from Node is to break
out of the `for await` loop early, or pass an `AbortController` to
`fetch()`:

```js
const ctrl = new AbortController();
setTimeout(() => ctrl.abort(), 1000); // cancel after 1s

const response = await fetch(url, {
  method: 'POST', headers, body,
  signal: ctrl.signal,
});
```

The server detects the disconnect via Daphne's `GeneratorExit`,
marks the job cancelled, and applies the proportional refund.

## SSE event shapes

| `type` | When | Notable fields |
|---|---|---|
| `open` | First frame | `job_id`, `sample_rate`, `mime` |
| `chunk` | Once per PCM block | `seq`, `pcm_b64`, `bytes` |
| `done` | Final success frame | `audio_url`, `s3_key`, `duration_seconds`, `word_timings` |
| `cancelled` | Stream cancelled by user/server | `reason` |
| `error` | Streaming-side failure (e.g. quota) | `code`, `message` |
