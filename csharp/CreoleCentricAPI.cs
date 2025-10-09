using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace CreoleCentric.Api
{
    /// <summary>
    /// CreoleCentric TTS API Client
    ///
    /// A .NET client for the CreoleCentric Text-to-Speech API.
    /// Requires .NET 5.0+ or .NET Core 3.1+
    ///
    /// Example usage:
    /// <code>
    /// var client = new CreoleCentricAPI("cc_your_api_key_here");
    /// var health = await client.CheckHealthAsync();
    /// Console.WriteLine($"API Version: {health.Version}");
    /// </code>
    /// </summary>
    public class CreoleCentricAPI : IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _baseUrl;
        private readonly JsonSerializerOptions _jsonOptions;
        private bool _disposed;

        // Response models
        public class HealthCheckResponse
        {
            [JsonPropertyName("status")]
            public string Status { get; set; }

            [JsonPropertyName("service")]
            public string Service { get; set; }

            [JsonPropertyName("database")]
            public string Database { get; set; }

            [JsonPropertyName("version")]
            public string Version { get; set; }
        }

        public class CreditBalanceResponse
        {
            [JsonPropertyName("total_credits")]
            public double TotalCredits { get; set; }

            [JsonPropertyName("used_credits")]
            public double UsedCredits { get; set; }

            [JsonPropertyName("available_credits")]
            public double AvailableCredits { get; set; }

            [JsonPropertyName("currency")]
            public string Currency { get; set; }
        }

        public class Voice
        {
            [JsonPropertyName("voice_id")]
            public string VoiceId { get; set; }

            [JsonPropertyName("name")]
            public string Name { get; set; }

            [JsonPropertyName("region")]
            public string Region { get; set; }

            [JsonPropertyName("gender")]
            public string Gender { get; set; }

            [JsonPropertyName("description")]
            public string Description { get; set; }

            [JsonPropertyName("preview_url")]
            public string PreviewUrl { get; set; }

            [JsonPropertyName("is_active")]
            public bool IsActive { get; set; }
        }

        public class VoicesResponse
        {
            [JsonPropertyName("success")]
            public bool Success { get; set; }

            [JsonPropertyName("voices")]
            public List<Voice> Voices { get; set; }

            [JsonPropertyName("count")]
            public int Count { get; set; }

            [JsonPropertyName("source")]
            public string Source { get; set; }
        }

        public class Model
        {
            [JsonPropertyName("id")]
            public string Id { get; set; }

            [JsonPropertyName("name")]
            public string Name { get; set; }

            [JsonPropertyName("description")]
            public string Description { get; set; }

            [JsonPropertyName("version")]
            public string Version { get; set; }

            [JsonPropertyName("is_active")]
            public bool IsActive { get; set; }

            [JsonPropertyName("supports_streaming")]
            public bool SupportsStreaming { get; set; }
        }

        public class ModelsResponse
        {
            [JsonPropertyName("success")]
            public bool Success { get; set; }

            [JsonPropertyName("models")]
            public List<Model> Models { get; set; }

            [JsonPropertyName("count")]
            public int Count { get; set; }
        }

        public class TTSJob
        {
            [JsonPropertyName("id")]
            public string Id { get; set; }

            [JsonPropertyName("status")]
            public string Status { get; set; }

            [JsonPropertyName("text_input")]
            public string TextInput { get; set; }

            [JsonPropertyName("voice_id")]
            public string VoiceId { get; set; }

            [JsonPropertyName("model_id")]
            public string ModelId { get; set; }

            [JsonPropertyName("created_at")]
            public string CreatedAt { get; set; }
        }

        public class JobStatusResponse
        {
            [JsonPropertyName("id")]
            public string Id { get; set; }

            [JsonPropertyName("status")]
            public string Status { get; set; }

            [JsonPropertyName("audio_url")]
            public string AudioUrl { get; set; }

            [JsonPropertyName("created_at")]
            public string CreatedAt { get; set; }

            [JsonPropertyName("updated_at")]
            public string UpdatedAt { get; set; }

            [JsonPropertyName("error")]
            public string Error { get; set; }
        }

        public class RecentJobsResponse
        {
            [JsonPropertyName("success")]
            public bool Success { get; set; }

            [JsonPropertyName("jobs")]
            public List<JobStatusResponse> Jobs { get; set; }

            [JsonPropertyName("count")]
            public int Count { get; set; }
        }

        /// <summary>
        /// Initialize the CreoleCentric API client
        /// </summary>
        /// <param name="apiKey">Your CreoleCentric API key (starts with 'cc_')</param>
        public CreoleCentricAPI(string apiKey)
            : this(apiKey, "https://creolecentric.com/api/v1")
        {
        }

        /// <summary>
        /// Initialize the CreoleCentric API client with custom base URL
        /// </summary>
        /// <param name="apiKey">Your CreoleCentric API key</param>
        /// <param name="baseUrl">Custom base URL for the API</param>
        public CreoleCentricAPI(string apiKey, string baseUrl)
        {
            _apiKey = apiKey ?? throw new ArgumentNullException(nameof(apiKey));
            _baseUrl = baseUrl ?? throw new ArgumentNullException(nameof(baseUrl));

            _httpClient = new HttpClient
            {
                BaseAddress = new Uri(_baseUrl),
                Timeout = TimeSpan.FromSeconds(30)
            };

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _apiKey);
            _httpClient.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json"));

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };
        }

        /// <summary>
        /// Make an HTTP request to the API
        /// </summary>
        private async Task<T> MakeRequestAsync<T>(
            HttpMethod method,
            string endpoint,
            object body = null,
            CancellationToken cancellationToken = default)
        {
            var request = new HttpRequestMessage(method, endpoint);

            if (body != null && method == HttpMethod.Post)
            {
                var json = JsonSerializer.Serialize(body, _jsonOptions);
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");
            }

            var response = await _httpClient.SendAsync(request, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException(
                    $"HTTP {(int)response.StatusCode}: {errorContent}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<T>(responseContent, _jsonOptions);
        }

        /// <summary>
        /// Check API health and get version information
        /// </summary>
        public Task<HealthCheckResponse> CheckHealthAsync(
            CancellationToken cancellationToken = default)
        {
            return MakeRequestAsync<HealthCheckResponse>(
                HttpMethod.Get, "/health/", null, cancellationToken);
        }

        /// <summary>
        /// Get current credit balance
        /// </summary>
        public Task<CreditBalanceResponse> GetCreditBalanceAsync(
            CancellationToken cancellationToken = default)
        {
            return MakeRequestAsync<CreditBalanceResponse>(
                HttpMethod.Get, "/credits/balance/", null, cancellationToken);
        }

        /// <summary>
        /// Get list of available voices
        /// </summary>
        public Task<VoicesResponse> GetVoicesAsync(
            CancellationToken cancellationToken = default)
        {
            return MakeRequestAsync<VoicesResponse>(
                HttpMethod.Get, "/tts/voices/", null, cancellationToken);
        }

        /// <summary>
        /// Get list of available models
        /// </summary>
        public Task<ModelsResponse> GetModelsAsync(
            CancellationToken cancellationToken = default)
        {
            return MakeRequestAsync<ModelsResponse>(
                HttpMethod.Get, "/tts/models/", null, cancellationToken);
        }

        /// <summary>
        /// Create a new TTS job
        /// </summary>
        /// <param name="text">The text to convert to speech</param>
        /// <param name="voiceId">The ID of the voice to use</param>
        /// <param name="modelId">The ID of the model to use</param>
        /// <param name="speed">Speech speed (0.5 to 2.0)</param>
        /// <param name="stability">Voice stability (0.0 to 1.0)</param>
        /// <param name="similarityBoost">Voice similarity boost (0.0 to 1.0)</param>
        /// <param name="cancellationToken">Cancellation token</param>
        public Task<TTSJob> CreateTTSJobAsync(
            string text,
            string voiceId,
            string modelId,
            double speed = 1.0,
            double stability = 0.5,
            double similarityBoost = 0.75,
            CancellationToken cancellationToken = default)
        {
            var payload = new
            {
                text,
                voice_id = voiceId,
                model_id = modelId,
                speed,
                stability,
                similarity_boost = similarityBoost
            };

            return MakeRequestAsync<TTSJob>(
                HttpMethod.Post, "/tts/submit/", payload, cancellationToken);
        }

        /// <summary>
        /// Get the status of a TTS job
        /// </summary>
        /// <param name="jobId">The job ID</param>
        /// <param name="cancellationToken">Cancellation token</param>
        public Task<JobStatusResponse> GetJobStatusAsync(
            string jobId,
            CancellationToken cancellationToken = default)
        {
            return MakeRequestAsync<JobStatusResponse>(
                HttpMethod.Get, $"/tts/job/{jobId}/", null, cancellationToken);
        }

        /// <summary>
        /// Wait for a job to complete
        /// </summary>
        /// <param name="jobId">The job ID</param>
        /// <param name="timeout">Maximum time to wait in seconds</param>
        /// <param name="pollInterval">How often to check status in seconds</param>
        /// <param name="cancellationToken">Cancellation token</param>
        public async Task<JobStatusResponse> WaitForJobAsync(
            string jobId,
            int timeout = 300,
            int pollInterval = 2,
            CancellationToken cancellationToken = default)
        {
            var startTime = DateTime.UtcNow;
            var timeoutSpan = TimeSpan.FromSeconds(timeout);
            var pollIntervalSpan = TimeSpan.FromSeconds(pollInterval);

            while (DateTime.UtcNow - startTime < timeoutSpan)
            {
                var status = await GetJobStatusAsync(jobId, cancellationToken);

                if (status.Status == "completed" ||
                    status.Status == "delivered" ||
                    status.Status == "failed" ||
                    status.Status == "cancelled")
                {
                    return status;
                }

                Console.WriteLine($"Job {jobId} status: {status.Status}");
                await Task.Delay(pollIntervalSpan, cancellationToken);
            }

            throw new TimeoutException(
                $"Job {jobId} did not complete within {timeout} seconds");
        }

        /// <summary>
        /// Get recent TTS jobs
        /// </summary>
        /// <param name="limit">Maximum number of jobs to return</param>
        /// <param name="cancellationToken">Cancellation token</param>
        public Task<RecentJobsResponse> GetRecentJobsAsync(
            int limit = 10,
            CancellationToken cancellationToken = default)
        {
            return MakeRequestAsync<RecentJobsResponse>(
                HttpMethod.Get, $"/tts/jobs/?limit={limit}", null, cancellationToken);
        }

        /// <summary>
        /// Dispose of the HTTP client
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _httpClient?.Dispose();
                }
                _disposed = true;
            }
        }

        /// <summary>
        /// Example usage demonstrating all features
        /// </summary>
        public static async Task Main(string[] args)
        {
            var apiKey = Environment.GetEnvironmentVariable("CREOLECENTRIC_API_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                Console.WriteLine("Error: CREOLECENTRIC_API_KEY environment variable not set");
                Environment.Exit(1);
            }

            using var client = new CreoleCentricAPI(apiKey);

            try
            {
                // 1. Health Check
                Console.WriteLine("=== Health Check ===");
                var health = await client.CheckHealthAsync();
                Console.WriteLine($"Status: {health.Status}");
                Console.WriteLine($"Service: {health.Service}");
                Console.WriteLine($"Version: {health.Version}");
                Console.WriteLine();

                // 2. Credit Balance
                Console.WriteLine("=== Credit Balance ===");
                var balance = await client.GetCreditBalanceAsync();
                Console.WriteLine($"Total Credits: {balance.TotalCredits}");
                Console.WriteLine($"Used Credits: {balance.UsedCredits}");
                Console.WriteLine($"Available Credits: {balance.AvailableCredits}");
                Console.WriteLine();

                // 3. List Voices
                Console.WriteLine("=== Available Voices ===");
                var voicesResponse = await client.GetVoicesAsync();
                var voices = voicesResponse.Voices;
                Console.WriteLine($"Found {voicesResponse.Count} voices (source: {voicesResponse.Source}):");
                for (int i = 0; i < Math.Min(5, voices.Count); i++)
                {
                    var voice = voices[i];
                    Console.WriteLine($"  - {voice.Name} ({voice.VoiceId})");
                    Console.WriteLine($"    Region: {voice.Region}, Gender: {voice.Gender}");
                }
                Console.WriteLine();

                // 4. List Models
                Console.WriteLine("=== Available Models ===");
                var modelsResponse = await client.GetModelsAsync();
                var models = modelsResponse.Models;
                Console.WriteLine($"Found {modelsResponse.Count} models:");
                foreach (var model in models)
                {
                    Console.WriteLine($"  - {model.Name} ({model.Id})");
                    Console.WriteLine($"    {model.Description}");
                }
                Console.WriteLine();

                // 5. Create TTS Job
                var voiceId = "i4mRPwKM2yHwXhbmkN514";  // Xavier Bruneau
                var modelId = "ccl_ht_v100";

                if (voices.Count > 0 &&
                    voices[0].VoiceId != "voice_1" &&
                    voices[0].VoiceId != "voice_2")
                {
                    voiceId = voices[0].VoiceId;
                }
                if (models.Count > 0)
                {
                    modelId = models[0].Id;
                }

                Console.WriteLine("=== Creating TTS Job ===");
                var text = "Bonjou! Sa se yon egzanp nan itilizasyon API CreoleCentric pou konvèti tèks an Kreyòl Ayisyen an lapawòl.";
                Console.WriteLine($"Text: {text}");
                Console.WriteLine($"Voice ID: {voiceId}");
                Console.WriteLine($"Model ID: {modelId}");

                var job = await client.CreateTTSJobAsync(text, voiceId, modelId);
                Console.WriteLine($"Job created: {job.Id}");
                Console.WriteLine($"Status: {job.Status}");
                Console.WriteLine();

                // 6. Wait for Completion
                Console.WriteLine("=== Waiting for Job Completion ===");
                var finalStatus = await client.WaitForJobAsync(job.Id, 60, 2);
                Console.WriteLine($"Job {finalStatus.Id} {finalStatus.Status}");

                if (finalStatus.Status == "completed" || finalStatus.Status == "delivered")
                {
                    Console.WriteLine($"Audio URL: {finalStatus.AudioUrl}");
                }
                else if (finalStatus.Status == "failed")
                {
                    Console.WriteLine($"Error: {finalStatus.Error}");
                }
                Console.WriteLine();

                // 7. Recent Jobs
                Console.WriteLine("=== Recent Jobs ===");
                var recentJobs = await client.GetRecentJobsAsync(5);
                Console.WriteLine($"Found {recentJobs.Count} recent jobs:");
                foreach (var recentJob in recentJobs.Jobs)
                {
                    Console.WriteLine($"  - Job {recentJob.Id}: {recentJob.Status}");
                    if (!string.IsNullOrEmpty(recentJob.AudioUrl))
                    {
                        Console.WriteLine($"    Audio: {recentJob.AudioUrl}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                Environment.Exit(1);
            }
        }
    }
}
