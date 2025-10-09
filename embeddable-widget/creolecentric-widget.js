/**
 * CreoleCentric TTS Embeddable Widget
 *
 * A simple, embeddable text-to-speech widget for Haitian Creole.
 * Features:
 * - Text input with play button
 * - Local storage caching of generated audio
 * - Automatic cache invalidation on text change
 * - Customizable styling
 *
 * Usage:
 * <div id="creolecentric-tts"></div>
 * <script src="creolecentric-widget.js"></script>
 * <script>
 *   CreoleCentricWidget.init({
 *     containerId: 'creolecentric-tts',
 *     apiKey: 'cc_your_api_key_here',
 *     voiceId: 'i4mRPwKM2yHwXhbmkN514',
 *     modelId: 'ccl_ht_v100'
 *   });
 * </script>
 */

(function() {
  'use strict';

  const CreoleCentricWidget = {
    config: {
      apiBaseUrl: 'https://creolecentric.com/api/v1',
      containerId: 'creolecentric-tts',
      apiKey: '',
      voiceId: 'i4mRPwKM2yHwXhbmkN514',
      modelId: 'ccl_ht_v100',
      placeholder: 'Ekri tèks ou an kreyòl Ayisyen...',
      theme: 'light'
    },

    init: function(options) {
      this.config = Object.assign({}, this.config, options);

      if (!this.config.apiKey) {
        console.error('CreoleCentric Widget: API key is required');
        return;
      }

      this.container = document.getElementById(this.config.containerId);
      if (!this.container) {
        console.error(`CreoleCentric Widget: Container #${this.config.containerId} not found`);
        return;
      }

      this.render();
      this.attachEventListeners();
      this.loadCachedAudio();
    },

    render: function() {
      const theme = this.config.theme === 'dark' ? 'dark' : 'light';

      this.container.innerHTML = `
        <div class="cc-widget cc-widget-${theme}">
          <style>
            .cc-widget {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              max-width: 600px;
              padding: 20px;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .cc-widget-light {
              background: #ffffff;
              color: #333;
            }
            .cc-widget-dark {
              background: #1f2937;
              color: #f3f4f6;
            }
            .cc-widget-header {
              margin-bottom: 16px;
            }
            .cc-widget-title {
              font-size: 18px;
              font-weight: 600;
              margin: 0 0 4px 0;
            }
            .cc-widget-subtitle {
              font-size: 13px;
              opacity: 0.7;
              margin: 0;
            }
            .cc-widget-textarea {
              width: 100%;
              min-height: 100px;
              padding: 12px;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              font-size: 15px;
              resize: vertical;
              box-sizing: border-box;
              font-family: inherit;
            }
            .cc-widget-dark .cc-widget-textarea {
              background: #374151;
              color: #f3f4f6;
              border-color: #4b5563;
            }
            .cc-widget-textarea:focus {
              outline: none;
              border-color: #3b82f6;
            }
            .cc-widget-controls {
              display: flex;
              gap: 12px;
              margin-top: 12px;
              align-items: center;
            }
            .cc-widget-button {
              padding: 10px 20px;
              border: none;
              border-radius: 8px;
              font-size: 15px;
              font-weight: 500;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              gap: 8px;
              transition: all 0.2s;
            }
            .cc-widget-button:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            .cc-widget-button-primary {
              background: #3b82f6;
              color: white;
            }
            .cc-widget-button-primary:hover:not(:disabled) {
              background: #2563eb;
            }
            .cc-widget-button-secondary {
              background: #6b7280;
              color: white;
            }
            .cc-widget-button-secondary:hover:not(:disabled) {
              background: #4b5563;
            }
            .cc-widget-status {
              font-size: 13px;
              opacity: 0.8;
              flex: 1;
            }
            .cc-widget-status.cc-widget-error {
              color: #ef4444;
            }
            .cc-widget-status.cc-widget-success {
              color: #10b981;
            }
            .cc-widget-spinner {
              display: inline-block;
              width: 14px;
              height: 14px;
              border: 2px solid rgba(255,255,255,0.3);
              border-top-color: white;
              border-radius: 50%;
              animation: cc-spin 0.6s linear infinite;
            }
            @keyframes cc-spin {
              to { transform: rotate(360deg); }
            }
            .cc-widget-audio {
              margin-top: 12px;
              width: 100%;
            }
          </style>

          <div class="cc-widget-header">
            <h3 class="cc-widget-title">🎙️ Haitian Creole Text-to-Speech</h3>
            <p class="cc-widget-subtitle">Enter your text and press play to generate audio</p>
          </div>

          <textarea
            class="cc-widget-textarea"
            id="cc-text-input"
            placeholder="${this.config.placeholder}"
          ></textarea>

          <div class="cc-widget-controls">
            <button class="cc-widget-button cc-widget-button-primary" id="cc-play-button">
              <span id="cc-play-icon">▶️</span>
              <span id="cc-play-text">Generate & Play</span>
            </button>
            <button class="cc-widget-button cc-widget-button-secondary" id="cc-clear-button" style="display:none;">
              Clear Audio
            </button>
            <div class="cc-widget-status" id="cc-status"></div>
          </div>

          <audio class="cc-widget-audio" id="cc-audio-player" controls style="display:none;"></audio>
        </div>
      `;

      this.elements = {
        textarea: this.container.querySelector('#cc-text-input'),
        playButton: this.container.querySelector('#cc-play-button'),
        playIcon: this.container.querySelector('#cc-play-icon'),
        playText: this.container.querySelector('#cc-play-text'),
        clearButton: this.container.querySelector('#cc-clear-button'),
        status: this.container.querySelector('#cc-status'),
        audioPlayer: this.container.querySelector('#cc-audio-player')
      };
    },

    attachEventListeners: function() {
      this.elements.textarea.addEventListener('input', () => {
        this.onTextChange();
      });

      this.elements.playButton.addEventListener('click', () => {
        this.handlePlay();
      });

      this.elements.clearButton.addEventListener('click', () => {
        this.clearAudio();
      });

      this.elements.audioPlayer.addEventListener('ended', () => {
        this.updatePlayButton(false);
      });

      this.elements.audioPlayer.addEventListener('play', () => {
        this.updatePlayButton(true);
      });

      this.elements.audioPlayer.addEventListener('pause', () => {
        this.updatePlayButton(false);
      });
    },

    onTextChange: function() {
      const text = this.elements.textarea.value.trim();
      const cachedAudio = this.getCachedAudio(text);

      if (!cachedAudio) {
        this.clearAudioPlayer();
      }
    },

    handlePlay: async function() {
      const text = this.elements.textarea.value.trim();

      if (!text) {
        this.setStatus('Please enter some text', 'error');
        return;
      }

      // Check if audio is already loaded
      if (this.elements.audioPlayer.src && !this.elements.audioPlayer.paused) {
        this.elements.audioPlayer.pause();
        return;
      }

      if (this.elements.audioPlayer.src) {
        this.elements.audioPlayer.play();
        return;
      }

      // Check cache first
      const cachedAudio = this.getCachedAudio(text);
      if (cachedAudio) {
        this.loadAudioFromCache(cachedAudio);
        return;
      }

      // Generate new audio
      await this.generateAudio(text);
    },

    async generateAudio(text) {
      this.setLoading(true);
      this.setStatus('Generating audio...', 'info');

      try {
        // Create TTS job
        const jobResponse = await fetch(`${this.config.apiBaseUrl}/tts/jobs/`, {
          method: 'POST',
          headers: {
            'Authorization': `ApiKey ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: text,
            voice_id: this.config.voiceId,
            model_id: this.config.modelId
          })
        });

        if (!jobResponse.ok) {
          throw new Error(`API error: ${jobResponse.status}`);
        }

        const job = await jobResponse.json();
        this.setStatus('Processing...', 'info');

        // Poll for completion
        const audioUrl = await this.pollJobStatus(job.id);

        // Download and cache audio
        await this.downloadAndCacheAudio(text, audioUrl);

        this.setStatus('Ready to play!', 'success');
        this.elements.audioPlayer.play();

      } catch (error) {
        console.error('Error generating audio:', error);
        this.setStatus(`Error: ${error.message}`, 'error');
      } finally {
        this.setLoading(false);
      }
    },

    async pollJobStatus(jobId, maxAttempts = 60) {
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = await fetch(`${this.config.apiBaseUrl}/tts/jobs/${jobId}/`, {
          headers: {
            'Authorization': `ApiKey ${this.config.apiKey}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to check job status: ${response.status}`);
        }

        const status = await response.json();

        if (status.status === 'completed' || status.status === 'delivered') {
          return status.audio_url;
        }

        if (status.status === 'failed') {
          throw new Error(status.error || 'Job failed');
        }
      }

      throw new Error('Timeout waiting for audio generation');
    },

    async downloadAndCacheAudio(text, audioUrl) {
      this.setStatus('Downloading audio...', 'info');

      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error('Failed to download audio');
      }

      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64Audio = reader.result;
          this.cacheAudio(text, base64Audio);
          this.loadAudioFromCache(base64Audio);
          resolve();
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    },

    getCacheKey(text) {
      // Simple hash function for cache key
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return `cc_tts_${Math.abs(hash)}_${text.length}`;
    },

    cacheAudio(text, base64Audio) {
      try {
        const cacheKey = this.getCacheKey(text);
        const cacheData = {
          text: text,
          audio: base64Audio,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('Failed to cache audio:', error);
      }
    },

    getCachedAudio(text) {
      try {
        const cacheKey = this.getCacheKey(text);
        const cached = localStorage.getItem(cacheKey);

        if (!cached) return null;

        const cacheData = JSON.parse(cached);

        // Cache valid for 7 days
        const maxAge = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - cacheData.timestamp > maxAge) {
          localStorage.removeItem(cacheKey);
          return null;
        }

        if (cacheData.text === text) {
          return cacheData.audio;
        }

        return null;
      } catch (error) {
        console.warn('Failed to retrieve cached audio:', error);
        return null;
      }
    },

    loadCachedAudio() {
      const text = this.elements.textarea.value.trim();
      if (!text) return;

      const cachedAudio = this.getCachedAudio(text);
      if (cachedAudio) {
        this.loadAudioFromCache(cachedAudio);
        this.setStatus('Loaded from cache', 'success');
      }
    },

    loadAudioFromCache(base64Audio) {
      this.elements.audioPlayer.src = base64Audio;
      this.elements.audioPlayer.style.display = 'block';
      this.elements.clearButton.style.display = 'inline-flex';
    },

    clearAudio() {
      this.clearAudioPlayer();
      this.setStatus('', '');
      // Note: We don't clear localStorage cache, just the player
    },

    clearAudioPlayer() {
      this.elements.audioPlayer.pause();
      this.elements.audioPlayer.src = '';
      this.elements.audioPlayer.style.display = 'none';
      this.elements.clearButton.style.display = 'none';
      this.updatePlayButton(false);
    },

    setLoading(isLoading) {
      this.elements.playButton.disabled = isLoading;

      if (isLoading) {
        this.elements.playIcon.innerHTML = '<span class="cc-widget-spinner"></span>';
        this.elements.playText.textContent = 'Generating...';
      } else {
        this.elements.playIcon.textContent = '▶️';
        this.elements.playText.textContent = 'Generate & Play';
      }
    },

    updatePlayButton(isPlaying) {
      if (isPlaying) {
        this.elements.playIcon.textContent = '⏸️';
        this.elements.playText.textContent = 'Pause';
      } else {
        this.elements.playIcon.textContent = '▶️';
        this.elements.playText.textContent = this.elements.audioPlayer.src ? 'Play' : 'Generate & Play';
      }
    },

    setStatus(message, type) {
      this.elements.status.textContent = message;
      this.elements.status.className = 'cc-widget-status';

      if (type === 'error') {
        this.elements.status.classList.add('cc-widget-error');
      } else if (type === 'success') {
        this.elements.status.classList.add('cc-widget-success');
      }
    }
  };

  // Expose to global scope
  window.CreoleCentricWidget = CreoleCentricWidget;

  // Auto-initialize if data-api-key attribute is present
  document.addEventListener('DOMContentLoaded', function() {
    const containers = document.querySelectorAll('[data-cc-widget]');
    containers.forEach(function(container) {
      const apiKey = container.getAttribute('data-api-key');
      const voiceId = container.getAttribute('data-voice-id') || 'i4mRPwKM2yHwXhbmkN514';
      const modelId = container.getAttribute('data-model-id') || 'ccl_ht_v100';
      const theme = container.getAttribute('data-theme') || 'light';

      if (apiKey) {
        CreoleCentricWidget.init({
          containerId: container.id,
          apiKey: apiKey,
          voiceId: voiceId,
          modelId: modelId,
          theme: theme
        });
      }
    });
  });

})();
