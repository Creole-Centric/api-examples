package com.creolecentric.api;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.annotations.SerializedName;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * CreoleCentric TTS API Client
 *
 * A Java client for the CreoleCentric Text-to-Speech API.
 * Requires Java 11+ for HttpClient support.
 *
 * Example usage:
 * <pre>
 * CreoleCentricAPI client = new CreoleCentricAPI("cc_your_api_key_here");
 * HealthCheckResponse health = client.checkHealth();
 * System.out.println("API Version: " + health.version);
 * </pre>
 */
public class CreoleCentricAPI {
    private final String apiKey;
    private final String baseUrl;
    private final HttpClient httpClient;
    private final Gson gson;

    // Response classes
    public static class HealthCheckResponse {
        public String status;
        public String service;
        public String database;
        public String version;
    }

    public static class CreditBalanceResponse {
        @SerializedName("total_credits")
        public double totalCredits;

        @SerializedName("used_credits")
        public double usedCredits;

        @SerializedName("available_credits")
        public double availableCredits;

        public String currency;
    }

    public static class Voice {
        @SerializedName("voice_id")
        public String voiceId;

        public String name;
        public String region;
        public String gender;
        public String description;

        @SerializedName("preview_url")
        public String previewUrl;

        @SerializedName("is_active")
        public boolean isActive;
    }

    public static class VoicesResponse {
        public boolean success;
        public List<Voice> voices;
        public int count;
        public String source;
    }

    public static class Model {
        public String id;
        public String name;
        public String description;
        public String version;

        @SerializedName("is_active")
        public boolean isActive;

        @SerializedName("supports_streaming")
        public boolean supportsStreaming;
    }

    public static class ModelsResponse {
        public boolean success;
        public List<Model> models;
        public int count;
    }

    public static class TTSJob {
        public String id;
        public String status;

        @SerializedName("text_input")
        public String textInput;

        @SerializedName("voice_id")
        public String voiceId;

        @SerializedName("model_id")
        public String modelId;

        @SerializedName("created_at")
        public String createdAt;
    }

    public static class JobStatusResponse {
        public String id;
        public String status;

        @SerializedName("audio_url")
        public String audioUrl;

        @SerializedName("created_at")
        public String createdAt;

        @SerializedName("updated_at")
        public String updatedAt;

        public String error;
    }

    public static class RecentJobsResponse {
        public boolean success;
        public List<JobStatusResponse> jobs;
        public int count;
    }

    /**
     * Initialize the CreoleCentric API client
     *
     * @param apiKey Your CreoleCentric API key (starts with 'cc_')
     */
    public CreoleCentricAPI(String apiKey) {
        this(apiKey, "https://creolecentric.com/api/v1");
    }

    /**
     * Initialize the CreoleCentric API client with custom base URL
     *
     * @param apiKey Your CreoleCentric API key
     * @param baseUrl Custom base URL for the API
     */
    public CreoleCentricAPI(String apiKey, String baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
        this.gson = new GsonBuilder().create();
    }

    /**
     * Make an HTTP request to the API
     */
    private <T> T makeRequest(String method, String endpoint, Object body, Class<T> responseClass) throws IOException, InterruptedException {
        String url = baseUrl + endpoint;

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json");

        if ("POST".equals(method) && body != null) {
            String jsonBody = gson.toJson(body);
            requestBuilder.POST(HttpRequest.BodyPublishers.ofString(jsonBody));
        } else {
            requestBuilder.GET();
        }

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new IOException("HTTP " + response.statusCode() + ": " + response.body());
        }

        return gson.fromJson(response.body(), responseClass);
    }

    /**
     * Check API health and get version information
     */
    public HealthCheckResponse checkHealth() throws IOException, InterruptedException {
        return makeRequest("GET", "/health/", null, HealthCheckResponse.class);
    }

    /**
     * Get current credit balance
     */
    public CreditBalanceResponse getCreditBalance() throws IOException, InterruptedException {
        return makeRequest("GET", "/credits/balance/", null, CreditBalanceResponse.class);
    }

    /**
     * Get list of available voices
     */
    public VoicesResponse getVoices() throws IOException, InterruptedException {
        return makeRequest("GET", "/tts/voices/", null, VoicesResponse.class);
    }

    /**
     * Get list of available models
     */
    public ModelsResponse getModels() throws IOException, InterruptedException {
        return makeRequest("GET", "/tts/models/", null, ModelsResponse.class);
    }

    /**
     * Create a new TTS job
     *
     * @param text The text to convert to speech
     * @param voiceId The ID of the voice to use
     * @param modelId The ID of the model to use
     * @return The created job
     */
    public TTSJob createTTSJob(String text, String voiceId, String modelId) throws IOException, InterruptedException {
        return createTTSJob(text, voiceId, modelId, 1.0, 0.5, 0.75);
    }

    /**
     * Create a new TTS job with custom parameters
     *
     * @param text The text to convert to speech
     * @param voiceId The ID of the voice to use
     * @param modelId The ID of the model to use
     * @param speed Speech speed (0.5 to 2.0)
     * @param stability Voice stability (0.0 to 1.0)
     * @param similarityBoost Voice similarity boost (0.0 to 1.0)
     * @return The created job
     */
    public TTSJob createTTSJob(String text, String voiceId, String modelId,
                               double speed, double stability, double similarityBoost) throws IOException, InterruptedException {
        Map<String, Object> payload = Map.of(
            "text", text,
            "voice_id", voiceId,
            "model_id", modelId,
            "speed", speed,
            "stability", stability,
            "similarity_boost", similarityBoost
        );

        return makeRequest("POST", "/tts/submit/", payload, TTSJob.class);
    }

    /**
     * Get the status of a TTS job
     *
     * @param jobId The job ID
     * @return The job status
     */
    public JobStatusResponse getJobStatus(String jobId) throws IOException, InterruptedException {
        return makeRequest("GET", "/tts/job/" + jobId + "/", null, JobStatusResponse.class);
    }

    /**
     * Wait for a job to complete
     *
     * @param jobId The job ID
     * @param timeout Maximum time to wait in seconds
     * @param pollInterval How often to check status in seconds
     * @return The final job status
     */
    public JobStatusResponse waitForJob(String jobId, int timeout, int pollInterval) throws IOException, InterruptedException {
        long startTime = System.currentTimeMillis();
        long timeoutMs = timeout * 1000L;
        long pollIntervalMs = pollInterval * 1000L;

        while (System.currentTimeMillis() - startTime < timeoutMs) {
            JobStatusResponse status = getJobStatus(jobId);

            if ("completed".equals(status.status) ||
                "delivered".equals(status.status) ||
                "failed".equals(status.status) ||
                "cancelled".equals(status.status)) {
                return status;
            }

            System.out.println("Job " + jobId + " status: " + status.status);
            Thread.sleep(pollIntervalMs);
        }

        throw new IOException("Job " + jobId + " did not complete within " + timeout + " seconds");
    }

    /**
     * Wait for a job to complete with default timeout (300s) and poll interval (2s)
     */
    public JobStatusResponse waitForJob(String jobId) throws IOException, InterruptedException {
        return waitForJob(jobId, 300, 2);
    }

    /**
     * Get recent TTS jobs
     *
     * @param limit Maximum number of jobs to return
     * @return List of recent jobs
     */
    public RecentJobsResponse getRecentJobs(int limit) throws IOException, InterruptedException {
        return makeRequest("GET", "/tts/jobs/?limit=" + limit, null, RecentJobsResponse.class);
    }

    /**
     * Get recent TTS jobs (default limit: 10)
     */
    public RecentJobsResponse getRecentJobs() throws IOException, InterruptedException {
        return getRecentJobs(10);
    }

    /**
     * Example usage demonstrating all features
     */
    public static void main(String[] args) {
        String apiKey = System.getenv("CREOLECENTRIC_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("Error: CREOLECENTRIC_API_KEY environment variable not set");
            System.exit(1);
        }

        try {
            CreoleCentricAPI client = new CreoleCentricAPI(apiKey);

            // 1. Health Check
            System.out.println("=== Health Check ===");
            HealthCheckResponse health = client.checkHealth();
            System.out.println("Status: " + health.status);
            System.out.println("Service: " + health.service);
            System.out.println("Version: " + health.version);
            System.out.println();

            // 2. Credit Balance
            System.out.println("=== Credit Balance ===");
            CreditBalanceResponse balance = client.getCreditBalance();
            System.out.println("Total Credits: " + balance.totalCredits);
            System.out.println("Used Credits: " + balance.usedCredits);
            System.out.println("Available Credits: " + balance.availableCredits);
            System.out.println();

            // 3. List Voices
            System.out.println("=== Available Voices ===");
            VoicesResponse voicesResponse = client.getVoices();
            List<Voice> voices = voicesResponse.voices;
            System.out.println("Found " + voicesResponse.count + " voices (source: " + voicesResponse.source + "):");
            for (int i = 0; i < Math.min(5, voices.size()); i++) {
                Voice voice = voices.get(i);
                System.out.println("  - " + voice.name + " (" + voice.voiceId + ")");
                System.out.println("    Region: " + voice.region + ", Gender: " + voice.gender);
            }
            System.out.println();

            // 4. List Models
            System.out.println("=== Available Models ===");
            ModelsResponse modelsResponse = client.getModels();
            List<Model> models = modelsResponse.models;
            System.out.println("Found " + modelsResponse.count + " models:");
            for (Model model : models) {
                System.out.println("  - " + model.name + " (" + model.id + ")");
                System.out.println("    " + model.description);
            }
            System.out.println();

            // 5. Create TTS Job
            String voiceId = "i4mRPwKM2yHwXhbmkN514";  // Xavier Bruneau
            String modelId = "ccl_ht_v100";

            if (!voices.isEmpty() &&
                !"voice_1".equals(voices.get(0).voiceId) &&
                !"voice_2".equals(voices.get(0).voiceId)) {
                voiceId = voices.get(0).voiceId;
            }
            if (!models.isEmpty()) {
                modelId = models.get(0).id;
            }

            System.out.println("=== Creating TTS Job ===");
            String text = "Bonjou! Sa se yon egzanp nan itilizasyon API CreoleCentric pou konvèti tèks an Kreyòl Ayisyen an lapawòl.";
            System.out.println("Text: " + text);
            System.out.println("Voice ID: " + voiceId);
            System.out.println("Model ID: " + modelId);

            TTSJob job = client.createTTSJob(text, voiceId, modelId);
            System.out.println("Job created: " + job.id);
            System.out.println("Status: " + job.status);
            System.out.println();

            // 6. Wait for Completion
            System.out.println("=== Waiting for Job Completion ===");
            JobStatusResponse finalStatus = client.waitForJob(job.id, 60, 2);
            System.out.println("Job " + finalStatus.id + " " + finalStatus.status);

            if ("completed".equals(finalStatus.status) || "delivered".equals(finalStatus.status)) {
                System.out.println("Audio URL: " + finalStatus.audioUrl);
            } else if ("failed".equals(finalStatus.status)) {
                System.out.println("Error: " + finalStatus.error);
            }
            System.out.println();

            // 7. Recent Jobs
            System.out.println("=== Recent Jobs ===");
            RecentJobsResponse recentJobs = client.getRecentJobs(5);
            System.out.println("Found " + recentJobs.count + " recent jobs:");
            for (JobStatusResponse recentJob : recentJobs.jobs) {
                System.out.println("  - Job " + recentJob.id + ": " + recentJob.status);
                if (recentJob.audioUrl != null) {
                    System.out.println("    Audio: " + recentJob.audioUrl);
                }
            }

        } catch (IOException | InterruptedException e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
