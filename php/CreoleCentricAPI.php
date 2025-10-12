<?php
/**
 * CreoleCentric TTS API Client Example
 * =====================================
 * This example demonstrates how to use the CreoleCentric Text-to-Speech API.
 *
 * Requirements:
 *     composer require guzzlehttp/guzzle vlucas/phpdotenv
 */

require_once __DIR__ . '/vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

/**
 * Client for interacting with CreoleCentric TTS API
 */
class CreoleCentricAPI
{
    private string $apiKey;
    private string $baseUrl;
    private Client $client;
    private array $headers;

    /**
     * Initialize the API client
     *
     * @param string $apiKey Your API key starting with 'cc_'
     * @param string $baseUrl Base URL for the API (default: production URL)
     */
    public function __construct(string $apiKey, string $baseUrl = 'https://creolecentric.com/api/v1')
    {
        $this->apiKey = $apiKey;
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->headers = [
            'Authorization' => "ApiKey {$apiKey}",
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ];

        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout' => 30.0,
            'headers' => $this->headers
        ]);
    }

    /**
     * Make an HTTP request to the API
     *
     * @param string $method HTTP method (GET, POST, etc.)
     * @param string $endpoint API endpoint (e.g., '/tts/jobs/')
     * @param array|null $data JSON data for POST requests
     * @param array|null $params Query parameters
     * @return array Response JSON data
     * @throws GuzzleException If the request fails
     */
    private function makeRequest(string $method, string $endpoint, ?array $data = null, ?array $params = null): array
    {
        try {
            $options = [];

            if ($data !== null) {
                $options['json'] = $data;
            }

            if ($params !== null) {
                $options['query'] = $params;
            }

            $response = $this->client->request($method, $endpoint, $options);
            $body = (string) $response->getBody();

            return $body ? json_decode($body, true) : [];
        } catch (GuzzleException $e) {
            echo "HTTP Error: " . $e->getMessage() . "\n";
            if ($e->hasResponse()) {
                echo "Response: " . $e->getResponse()->getBody() . "\n";
            }
            throw $e;
        }
    }

    // ============== Health Check ==============

    /**
     * Check API health status
     *
     * @return array Health status information
     */
    public function checkHealth(): array
    {
        return $this->makeRequest('GET', '/health/');
    }

    // ============== User & Credits ==============

    /**
     * Get current user information
     *
     * @return array User profile data
     */
    public function getUserInfo(): array
    {
        return $this->makeRequest('GET', '/users/profile/');
    }

    /**
     * Get current credit balance
     *
     * @return array Credit balance information
     */
    public function getCreditBalance(): array
    {
        return $this->makeRequest('GET', '/credits/balance/');
    }

    // ============== Voices & Models ==============

    /**
     * Get list of available voices
     *
     * @return array Dictionary containing:
     *   - success: bool
     *   - voices: array of voice dictionaries
     *   - count: number of voices
     *   - source: data source (infer or local)
     */
    public function getVoices(): array
    {
        return $this->makeRequest('GET', '/tts/voices/');
    }

    /**
     * Get list of available TTS models
     *
     * @return array Dictionary containing:
     *   - success: bool
     *   - models: array of model dictionaries
     *   - count: number of models
     */
    public function getModels(): array
    {
        return $this->makeRequest('GET', '/tts/models/');
    }

    /**
     * Get voice settings configuration
     *
     * @return array Voice settings data
     */
    public function getVoiceSettings(): array
    {
        return $this->makeRequest('GET', '/tts/voice-settings/');
    }

    // ============== TTS Jobs ==============

    /**
     * Create a new TTS job
     *
     * @param string $text Text to convert to speech
     * @param string $voiceId ID of the voice to use
     * @param string $modelId ID of the model to use
     * @param array $options Additional parameters (speed, pitch, webhook_url, etc.)
     * @return array Job details including job_id
     */
    public function createTtsJob(
        string $text,
        string $voiceId = 'qW6MAd7f5iuYw7bAH96wC',
        string $modelId = 'ccl_ht_v100',
        array $options = []
    ): array {
        $data = array_merge([
            'text' => $text,
            'voice_id' => $voiceId,
            'model_id' => $modelId
        ], $options);

        return $this->makeRequest('POST', '/tts/jobs/', $data);
    }

    /**
     * Get status of a TTS job
     *
     * @param string $jobId UUID of the job
     * @return array Job status and details
     */
    public function getJobStatus(string $jobId): array
    {
        return $this->makeRequest('GET', "/tts/jobs/{$jobId}/status/");
    }

    /**
     * Get full details of a TTS job
     *
     * @param string $jobId UUID of the job
     * @return array Complete job information
     */
    public function getJobDetails(string $jobId): array
    {
        return $this->makeRequest('GET', "/tts/jobs/{$jobId}/");
    }

    /**
     * List TTS jobs for the current user
     *
     * @param int $limit Number of jobs to return
     * @param int $offset Pagination offset
     * @return array List of jobs with pagination info
     */
    public function listJobs(int $limit = 10, int $offset = 0): array
    {
        return $this->makeRequest('GET', '/tts/jobs/list/', null, [
            'limit' => $limit,
            'offset' => $offset
        ]);
    }

    /**
     * Cancel a pending or processing TTS job
     *
     * @param string $jobId UUID of the job to cancel
     * @return array Cancellation status
     */
    public function cancelJob(string $jobId): array
    {
        return $this->makeRequest('POST', "/tts/jobs/{$jobId}/cancel/");
    }

    // ============== Express TTS ==============

    /**
     * Use express TTS for immediate audio generation (shorter texts)
     *
     * @param string $text Text to convert (max 500 characters recommended)
     * @param string $voiceId Voice to use
     * @return string Audio data as binary string
     * @throws GuzzleException
     */
    public function expressTts(string $text, string $voiceId = 'qW6MAd7f5iuYw7bAH96wC'): string
    {
        $data = [
            'text' => $text,
            'voice_id' => $voiceId
        ];

        $response = $this->client->post('/tts/express/', [
            'json' => $data
        ]);

        return (string) $response->getBody();
    }
}

/**
 * Example usage of the CreoleCentric API client
 */
function main(): void
{
    // Load environment variables from .env file
    if (file_exists(__DIR__ . '/.env')) {
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
        $dotenv->load();
    }

    // Load API key from environment variable
    $apiKey = $_ENV['CREOLECENTRIC_API_KEY'] ?? getenv('CREOLECENTRIC_API_KEY');

    if (!$apiKey) {
        echo "Error: CREOLECENTRIC_API_KEY environment variable not set\n";
        echo "Please set it with your API key: export CREOLECENTRIC_API_KEY='cc_your_key_here'\n";
        return;
    }

    try {
        // Initialize client
        $client = new CreoleCentricAPI($apiKey);

        // 1. Check API health
        echo str_repeat('=', 50) . "\n";
        echo "1. Checking API Health\n";
        echo str_repeat('=', 50) . "\n";
        $health = $client->checkHealth();
        echo "API Status: " . ($health['status'] ?? 'unknown') . "\n";
        echo "Version: " . ($health['version'] ?? 'unknown') . "\n";
        echo "\n";

        // 2. Get credit balance
        echo str_repeat('=', 50) . "\n";
        echo "2. Credit Balance\n";
        echo str_repeat('=', 50) . "\n";
        $balance = $client->getCreditBalance();
        echo "Total Credits: " . number_format($balance['total_credits'] ?? 0) . "\n";
        echo "Subscription Credits: " . number_format($balance['subscription_credits'] ?? 0) . "\n";
        echo "Purchased Credits: " . number_format($balance['purchased_credits'] ?? 0) . "\n";
        echo "\n";

        // 3. Get available voices
        echo str_repeat('=', 50) . "\n";
        echo "3. Available Voices\n";
        echo str_repeat('=', 50) . "\n";
        $voicesResponse = $client->getVoices();
        $voices = $voicesResponse['voices'] ?? [];
        $count = $voicesResponse['count'] ?? count($voices);
        $source = $voicesResponse['source'] ?? 'unknown';
        echo "Found {$count} voices (source: {$source}):\n";
        foreach (array_slice($voices, 0, 5) as $voice) {
            echo "  - " . ($voice['name'] ?? 'Unknown') . " (ID: " . ($voice['voice_id'] ?? 'N/A') . ")\n";
            echo "    Region: " . ($voice['region'] ?? 'N/A') . ", Gender: " . ($voice['gender'] ?? 'N/A') . "\n";
        }
        echo "\n";

        // 4. Get available models
        echo str_repeat('=', 50) . "\n";
        echo "4. Available Models\n";
        echo str_repeat('=', 50) . "\n";
        $modelsResponse = $client->getModels();
        $models = $modelsResponse['models'] ?? [];
        $count = $modelsResponse['count'] ?? count($models);
        echo "Found {$count} models:\n";
        foreach ($models as $model) {
            $name = $model['display_name'] ?? $model['name'] ?? 'Unknown';
            echo "  - {$name} (ID: " . ($model['id'] ?? 'N/A') . ")\n";
            echo "    Description: " . ($model['description'] ?? 'N/A') . "\n";
        }
        echo "\n";

        // 5. Create a TTS job
        echo str_repeat('=', 50) . "\n";
        echo "5. Creating TTS Job\n";
        echo str_repeat('=', 50) . "\n";

        $text = 'Bonjou! Mwen se yon egzanp API pou CreoleCentric. Mwen ka pale Kreyòl ayisyen.';
        echo "Text: {$text}\n";

        // Use Xavier Bruneau voice and default Haitian Creole model
        // To find voice IDs: Go to Voice Library page, click "More" (...) on any voice card
        // To find model IDs: In TTS interface, go to Speech Options tab, click Model field

        // Use a real voice ID - don't rely on voices list which may contain placeholders
        $voiceId = 'i4mRPwKM2yHwXhbmkN514';  // Xavier Bruneau
        $modelId = 'ccl_ht_v100';  // Default Haitian Creole model

        // If you want to use a voice from the list, make sure it's not a placeholder
        if (!empty($voices) && !in_array($voices[0]['voice_id'] ?? '', ['voice_1', 'voice_2'])) {
            $voiceId = $voices[0]['voice_id'];
        }
        if (!empty($models)) {
            $modelId = $models[0]['id'];
        }

        // To use webhooks, add webhook_url parameter:
        $job = $client->createTtsJob(
            $text,
            $voiceId,
            $modelId,
            ['webhook_url' => 'https://your-app.com/webhooks/tts']  // Your webhook endpoint
        );

        $jobId = $job['id'] ?? 'N/A';
        echo "Job created successfully!\n";
        echo "Job ID: {$jobId}\n";
        echo "Status: " . ($job['status'] ?? 'unknown') . "\n";
        echo "Credits used: " . ($job['credits_used'] ?? 0) . "\n";
        echo "\n";
        echo "📢 Webhook notifications will be sent to your endpoint:\n";
        echo "   - tts_queued → tts_started → tts_synthesized → tts_uploaded → tts_delivered\n";
        echo "   See examples/webhook_server.php for webhook handling example\n";
        echo "\n";

        // 6. List recent jobs
        echo str_repeat('=', 50) . "\n";
        echo "6. Recent Jobs\n";
        echo str_repeat('=', 50) . "\n";

        $jobs = $client->listJobs(5);
        $results = $jobs['results'] ?? [];
        echo "Recent " . count($results) . " jobs:\n";

        foreach ($results as $job) {
            $created = $job['created_at'] ?? '';
            $jobId = $job['id'] ?? '';
            $jobIdDisplay = $jobId ? substr($jobId, 0, 8) . '...' : 'N/A';
            echo "  - Job {$jobIdDisplay}\n";
            echo "    Created: {$created}\n";
            echo "    Status: " . ($job['status'] ?? 'unknown') . "\n";
            $textPreview = $job['text'] ?? '';
            if ($textPreview) {
                $preview = strlen($textPreview) > 50 ? substr($textPreview, 0, 50) . '...' : $textPreview;
                echo "    Text: {$preview}\n";
            }
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
        echo $e->getTraceAsString() . "\n";
    }
}

// Run main function if this file is executed directly
if (php_sapi_name() === 'cli' && basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'])) {
    main();
}
