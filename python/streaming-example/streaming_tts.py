#!/usr/bin/env python3
"""
CreoleCentric Streaming TTS Example
====================================

Demonstrates the live-streaming TTS endpoint:

    POST /v1/users/dev/tts/stream/

The response body is a Server-Sent Events stream of base64-encoded
24 kHz mono 16-bit PCM chunks, ending with a `done` event that
carries the saved S3 audio URL. First audio byte typically lands in
under 100 ms; the entire stream completes a few seconds after that.

Use streaming when you need low-latency playback (live voice agents,
phone bots, real-time interactive apps). For batch jobs, use the
regular /v1/tts/jobs/ endpoint.

Billing: 1.5x the standard per-character rate (same premium as
Express mode). Cancelling mid-stream refunds credits proportional to
the audio not yet delivered — partially-streamed audio is billed at
the regular streaming rate.

Requirements:
    pip install requests python-dotenv
"""
import base64
import json
import os
import struct
import sys
import time
from typing import Optional

import requests
from dotenv import load_dotenv


load_dotenv()


def build_wav_header(num_samples: int, sample_rate: int = 24000,
                     channels: int = 1, bits_per_sample: int = 16) -> bytes:
    """Return a 44-byte RIFF/WAV header for the given PCM size.

    The streaming endpoint emits raw 24 kHz mono 16-bit PCM; we wrap
    it in a WAV header so the saved file plays in any audio app
    without resampling or format conversion.
    """
    byte_rate = sample_rate * channels * bits_per_sample // 8
    block_align = channels * bits_per_sample // 8
    data_size = num_samples * block_align
    return (
        b'RIFF' + struct.pack('<I', 36 + data_size) + b'WAVE'
        + b'fmt ' + struct.pack('<IHHIIHH',
                                16, 1, channels, sample_rate,
                                byte_rate, block_align, bits_per_sample)
        + b'data' + struct.pack('<I', data_size)
    )


def stream_tts(text: str, voice_id: str, model_id: str = 'ccl_ht_gem_pro',
               output_wav: Optional[str] = 'output.wav') -> dict:
    """Stream a TTS request and (optionally) save the audio to a WAV file.

    Returns the `done` event payload (audio_url, duration, etc.) on
    success. Raises requests.HTTPError on transport errors and
    RuntimeError if the server emits an `error` SSE event.
    """
    api_key = os.environ['CREOLECENTRIC_API_KEY']
    base_url = os.environ.get('CREOLECENTRIC_API_URL',
                              'https://api.creolecentric.com/v1')

    headers = {
        'Authorization': f'ApiKey {api_key}',
        'Content-Type': 'application/json',
    }
    payload = {'text': text, 'voice_id': voice_id, 'model_id': model_id}

    pcm_chunks: list[bytes] = []
    done_event: Optional[dict] = None
    t0 = time.perf_counter()
    first_byte_ms: Optional[float] = None

    with requests.post(f'{base_url}/users/dev/tts/stream/',
                       headers=headers, json=payload,
                       stream=True, timeout=60) as resp:
        resp.raise_for_status()

        # SSE frames: `data: {...}\n\n`. requests.iter_lines yields
        # one line at a time (newline-stripped); we only care about
        # lines that start with "data: ".
        for raw in resp.iter_lines(decode_unicode=True):
            if not raw or not raw.startswith('data:'):
                continue
            event = json.loads(raw[5:].strip())
            etype = event.get('type')

            if etype == 'open':
                print(f"[open]  job={event['job_id']}  {event['mime']}")

            elif etype == 'chunk':
                if first_byte_ms is None:
                    first_byte_ms = (time.perf_counter() - t0) * 1000
                    print(f"[ttfb]  first PCM byte at {first_byte_ms:.0f} ms")
                pcm_chunks.append(base64.b64decode(event['pcm_b64']))

            elif etype == 'done':
                done_event = event
                wall_ms = (time.perf_counter() - t0) * 1000
                pcm_bytes = sum(len(c) for c in pcm_chunks)
                print(f"[done]  {len(pcm_chunks)} chunks  "
                      f"{pcm_bytes:,} PCM bytes  "
                      f"duration={event['duration_seconds']:.2f}s  "
                      f"wall={wall_ms:.0f} ms")
                print(f"[done]  saved audio: {event['audio_url']}")

            elif etype == 'cancelled':
                raise RuntimeError(
                    f"Stream cancelled by server: {event.get('reason')}"
                )

            elif etype == 'error':
                raise RuntimeError(
                    f"Stream error [{event.get('code')}]: {event.get('message')}"
                )

    if done_event is None:
        raise RuntimeError("Stream ended without a `done` event")

    if output_wav and pcm_chunks:
        pcm_data = b''.join(pcm_chunks)
        num_samples = len(pcm_data) // 2  # 16-bit = 2 bytes per sample
        with open(output_wav, 'wb') as f:
            f.write(build_wav_header(num_samples))
            f.write(pcm_data)
        print(f"[wav]   wrote {output_wav} ({len(pcm_data):,} PCM bytes)")

    return done_event


def main():
    text = (
        "Bonjou tout moun! Mwen kontan we ou la jodi a. "
        "Mèsi anpil pou prezans ou."
    )
    # Pick any voice that supports the ccl_ht_gem_pro model — call
    # GET /v1/users/voices/ to list available voice_ids.
    voice_id = os.environ.get('CREOLECENTRIC_VOICE_ID',
                              'smgykWMfupuWlPLWf0Zi9')

    try:
        result = stream_tts(text, voice_id)
        print(f"\nFinal audio URL: {result['audio_url']}")
    except KeyError:
        sys.exit("error: set CREOLECENTRIC_API_KEY in your environment "
                 "(or in a .env file)")
    except requests.HTTPError as e:
        sys.exit(f"HTTP {e.response.status_code}: {e.response.text}")


if __name__ == '__main__':
    main()
