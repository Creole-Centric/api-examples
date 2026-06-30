# Telnyx Integration Notes

Practical notes for wiring the CreoleCentric Live Streaming TTS endpoint into a Telnyx voice deployment (Programmable Voice, Media Streaming, or the AI Assistant framework). The Python sample in this directory (`streaming_tts.py`) consumes the SSE stream into a list of PCM chunks; this doc covers what you do with those chunks on the Telnyx side.

If you ship a working integration based on these notes, we'd love to upstream it as the official `python/telnyx-example/` in this repo — open an issue or PR and we'll credit your team.

## Audio format crash-course

Our streaming endpoint returns **24 kHz mono 16-bit little-endian PCM**. Telnyx expects different formats depending on which product you're wiring into:

| Telnyx product | Expected audio format | Conversion required |
|---|---|---|
| Programmable Voice (telephony, PSTN) | PCMU (µ-law) or PCMA (A-law) @ 8 kHz mono | Downsample 24 kHz → 8 kHz **and** encode to µ-law/A-law |
| Voice API Media Streaming (`bidirectional_streaming`) | Configurable; default PCMU @ 8 kHz | Same as Programmable Voice unless you've configured L16 |
| AI Assistant framework (WebRTC / SIP) | L16 16 kHz mono (16-bit linear PCM) is the common interop format | Downsample 24 kHz → 16 kHz; **no codec conversion** needed |
| Custom WebRTC pipeline | Often Opus or L16 16 kHz | Depends on your SDP negotiation — check what your peer ultimately accepts |

The two conversion primitives you need are **resampling** (24 kHz → 8 kHz or 16 kHz) and **codec encoding** (linear PCM → µ-law for telephony).

## Conversion code

Python's `audioop` module from the standard library handles both of these without any external dependencies. Pass the raw PCM bytes from each `chunk` SSE event through these helpers:

```python
import audioop

def pcm_24khz_to_pcmu_8khz(pcm_24k_16bit_le: bytes) -> bytes:
    """24 kHz mono 16-bit linear PCM → 8 kHz µ-law (Telnyx telephony)."""
    # Downsample 24 kHz → 8 kHz. ratecv keeps a state tuple between calls
    # for chunked conversion; the None passes a fresh state each chunk.
    # For sub-100 ms chunks the small phase discontinuity is inaudible;
    # if you need clean joins, persist the state tuple across chunks.
    pcm_8k, _ = audioop.ratecv(pcm_24k_16bit_le, 2, 1, 24000, 8000, None)
    # Linear 16-bit → µ-law (G.711 µ-law, sample width 2)
    return audioop.lin2ulaw(pcm_8k, 2)


def pcm_24khz_to_l16_16khz(pcm_24k_16bit_le: bytes) -> bytes:
    """24 kHz mono 16-bit PCM → 16 kHz mono 16-bit PCM (Telnyx AI Assistant)."""
    pcm_16k, _ = audioop.ratecv(pcm_24k_16bit_le, 2, 1, 24000, 16000, None)
    return pcm_16k
```

For A-law (less common; some European telephony deployments), swap `audioop.lin2ulaw` for `audioop.lin2alaw`.

If you need higher-quality downsampling than `audioop.ratecv` provides (it uses a simple linear-interpolation algorithm), reach for `scipy.signal.resample_poly` or `librosa.resample` — but for telephony delivery the quality bottleneck is the 8 kHz µ-law channel itself, so `audioop` is almost always good enough.

## Buffering

The SSE chunks arrive every ~40 ms (1920 bytes of 24 kHz PCM per chunk). Network jitter can stretch the inter-arrival gap to 100–200 ms occasionally, which will cause audible underruns if you forward each chunk directly to Telnyx.

Recommended pattern:

1. **Pre-buffer ~200 ms of audio** (5 chunks × 40 ms) before you start emitting to Telnyx. This gives you headroom for jitter without adding noticeable initial latency.
2. **Maintain a fixed-size jitter buffer** (200–400 ms) and emit at a constant rate matched to your Telnyx sink's expected packet cadence (20 ms packets for PCMU is typical).
3. **On underrun**, emit a brief silence packet rather than skipping ahead — Telnyx Programmable Voice handles this gracefully; the AI Assistant framework expects continuous audio.

## HTTP client

Use `requests.post(..., stream=True)` or `httpx.stream(...)`. **Do NOT add an `Accept: text/event-stream` header.** Send only `Authorization` and `Content-Type`. Our server returns `Content-Type: text/event-stream` regardless of what you send in `Accept`, and adding the header explicitly has been observed to interact awkwardly with some Python `requests` + asyncio + Telnyx audio-pipeline combinations.

```python
# Right
headers = {
    "Authorization": f"ApiKey {API_KEY}",
    "Content-Type": "application/json",
}

# Wrong (don't do this)
headers = {
    "Authorization": f"ApiKey {API_KEY}",
    "Content-Type": "application/json",
    "Accept": "text/event-stream",
}
```

## QA recording (free)

The SSE `done` event includes an `audio_url` field — that's the full synthesized clip saved to our S3 bucket. The URL is publicly readable (signed). You can wire it directly into your conversation logger / QA pipeline at zero additional cost (no second API call, no extra credits charged) so every IVR utterance you streamed live also has a persistent recording for review.

```python
elif evt["type"] == "done":
    audio_url = evt["audio_url"]
    # log to your QA system — completely free, no extra TTS call
    conversation_logger.attach_audio(call_id, audio_url)
    break
```

## Common gotchas

| Symptom | Likely cause |
|---|---|
| Audio plays at "chipmunk" speed | You forgot to downsample — Telnyx is interpreting 24 kHz samples as 8 kHz | 
| Audio plays at slowed-down "drunk" speed | You downsampled to 8 kHz but forgot to convert to µ-law; Telnyx is interpreting linear PCM as µ-law | 
| Choppy / underrun audio | Insufficient pre-buffer; raise initial buffer to 200 ms before emitting | 
| First-byte latency >200 ms | Your SSE consumer is line-buffering — use `iter_lines(decode_unicode=True, chunk_size=1)` or `httpx.stream` |
| Long synthesis cuts off mid-word | Input text > 600 chars; split at sentence boundaries on the client | 

## Telnyx documentation links

- **Programmable Voice**: <https://developers.telnyx.com/docs/voice/programmable-voice>
- **Media Streaming (`bidirectional_streaming`)**: <https://developers.telnyx.com/docs/voice/programmable-voice/media-streaming>
- **AI Assistant framework**: <https://developers.telnyx.com/docs/ai/assistant>
- **Audio format reference**: <https://developers.telnyx.com/docs/voice/audio-formats>

(Telnyx docs may have moved since this note was written — search "Telnyx <topic>" if a link 404s.)
