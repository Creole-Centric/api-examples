package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// ============== Type Definitions ==============

type HealthResponse struct {
	Status   string `json:"status"`
	Service  string `json:"service"`
	Database string `json:"database"`
	Version  string `json:"version"`
}

type CreditBalance struct {
	TotalCredits        int    `json:"total_credits"`
	SubscriptionCredits int    `json:"subscription_credits"`
	PurchasedCredits    int    `json:"purchased_credits"`
	SubscriptionPlan    string `json:"subscription_plan,omitempty"`
}

type Voice struct {
	ID                    string   `json:"id"`
	VoiceID               string   `json:"voice_id"`
	Name                  string   `json:"name"`
	Description           string   `json:"description"`
	Gender                string   `json:"gender"`
	Region                string   `json:"region"`
	RegionCode            string   `json:"region_code,omitempty"`
	Accent                string   `json:"accent,omitempty"`
	Style                 string   `json:"style,omitempty"`
	QualityLevel          string   `json:"quality_level,omitempty"`
	AgeGroup              string   `json:"age_group,omitempty"`
	LanguageCode          string   `json:"language_code"`
	IsActive              bool     `json:"is_active"`
	IsDefault             bool     `json:"is_default"`
	IsFeatured            bool     `json:"is_featured"`
	IsPremium             bool     `json:"is_premium"`
	PreviewURL            string   `json:"preview_url,omitempty"`
	PreviewText           string   `json:"preview_text,omitempty"`
	Tags                  []string `json:"tags,omitempty"`
	DefaultStability      float64  `json:"default_stability,omitempty"`
	DefaultSimilarityBoost float64 `json:"default_similarity_boost,omitempty"`
}

type VoicesResponse struct {
	Success bool    `json:"success"`
	Voices  []Voice `json:"voices"`
	Count   int     `json:"count"`
	Source  string  `json:"source"`
}

type Model struct {
	ID                 string   `json:"id"`
	Name               string   `json:"name"`
	DisplayName        string   `json:"display_name,omitempty"`
	Description        string   `json:"description"`
	Version            string   `json:"version,omitempty"`
	QualityScore       float64  `json:"quality_score,omitempty"`
	IsDefault          bool     `json:"is_default,omitempty"`
	IsPremium          bool     `json:"is_premium,omitempty"`
	SupportedLanguages []string `json:"supported_languages,omitempty"`
}

type ModelsResponse struct {
	Success bool    `json:"success"`
	Models  []Model `json:"models"`
	Count   int     `json:"count"`
}

type TTSJob struct {
	ID                  string  `json:"id"`
	Text                string  `json:"text"`
	VoiceID             string  `json:"voice_id"`
	VoiceName           string  `json:"voice_name,omitempty"`
	ModelID             string  `json:"model_id"`
	Status              string  `json:"status"`
	CreatedAt           string  `json:"created_at"`
	StartedAt           string  `json:"started_at,omitempty"`
	CompletedAt         string  `json:"completed_at,omitempty"`
	AudioFileURL        string  `json:"audio_file_url,omitempty"`
	DurationSeconds     float64 `json:"duration_seconds,omitempty"`
	DurationFormatted   string  `json:"duration_formatted,omitempty"`
	CreditsUsed         int     `json:"credits_used"`
	CharactersProcessed int     `json:"characters_processed,omitempty"`
	ErrorMessage        string  `json:"error_message,omitempty"`
}

type JobStatusResponse struct {
	Status          string  `json:"status"`
	AudioURL        string  `json:"audio_url,omitempty"`
	DurationSeconds float64 `json:"duration_seconds,omitempty"`
	ErrorMessage    string  `json:"error_message,omitempty"`
}

type JobListResponse struct {
	Results  []TTSJob `json:"results"`
	Count    int      `json:"count"`
	Next     string   `json:"next,omitempty"`
	Previous string   `json:"previous,omitempty"`
}

// ============== API Client ==============

type CreoleCentricAPI struct {
	APIKey  string
	BaseURL string
	Client  *http.Client
}

func NewCreoleCentricAPI(apiKey string, baseURL ...string) *CreoleCentricAPI {
	url := "https://api.creolecentric.com/v1"
	if len(baseURL) > 0 {
		url = strings.TrimSuffix(baseURL[0], "/")
	}

	return &CreoleCentricAPI{
		APIKey:  apiKey,
		BaseURL: url,
		Client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (api *CreoleCentricAPI) makeRequest(method, endpoint string, body interface{}) ([]byte, error) {
	url := api.BaseURL + endpoint

	var reqBody io.Reader
	if body != nil {
		jsonData, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonData)
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("ApiKey %s", api.APIKey))
	req.Header.Set("Content-Type", "application/json")

	resp, err := api.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(data))
	}

	return data, nil
}

// ============== Health Check ==============

func (api *CreoleCentricAPI) CheckHealth() (*HealthResponse, error) {
	data, err := api.makeRequest("GET", "/health/", nil)
	if err != nil {
		return nil, err
	}

	var health HealthResponse
	if err := json.Unmarshal(data, &health); err != nil {
		return nil, fmt.Errorf("failed to parse health response: %w", err)
	}

	return &health, nil
}

// ============== User & Credits ==============

func (api *CreoleCentricAPI) GetCreditBalance() (*CreditBalance, error) {
	data, err := api.makeRequest("GET", "/credits/balance/", nil)
	if err != nil {
		return nil, err
	}

	var balance CreditBalance
	if err := json.Unmarshal(data, &balance); err != nil {
		return nil, fmt.Errorf("failed to parse credit balance: %w", err)
	}

	return &balance, nil
}

// ============== Voices & Models ==============

func (api *CreoleCentricAPI) GetVoices() (*VoicesResponse, error) {
	data, err := api.makeRequest("GET", "/tts/voices/", nil)
	if err != nil {
		return nil, err
	}

	var voicesResp VoicesResponse
	if err := json.Unmarshal(data, &voicesResp); err != nil {
		return nil, fmt.Errorf("failed to parse voices response: %w", err)
	}

	return &voicesResp, nil
}

func (api *CreoleCentricAPI) GetModels() (*ModelsResponse, error) {
	data, err := api.makeRequest("GET", "/tts/models/", nil)
	if err != nil {
		return nil, err
	}

	var modelsResp ModelsResponse
	if err := json.Unmarshal(data, &modelsResp); err != nil {
		return nil, fmt.Errorf("failed to parse models response: %w", err)
	}

	return &modelsResp, nil
}

// ============== TTS Jobs ==============

type CreateJobRequest struct {
	Text               string  `json:"text"`
	VoiceID            string  `json:"voice_id"`
	ModelID            string  `json:"model_id"`
	WebhookURL         string  `json:"webhook_url,omitempty"`
	Speed              float64 `json:"speed,omitempty"`
	Stability          float64 `json:"stability,omitempty"`
	SimilarityBoost    float64 `json:"similarity_boost,omitempty"`
	Style              float64 `json:"style,omitempty"`
	UseSpeakerBoost    bool    `json:"use_speaker_boost,omitempty"`
}

func (api *CreoleCentricAPI) CreateTTSJob(text, voiceID, modelID string) (*TTSJob, error) {
	reqBody := CreateJobRequest{
		Text:    text,
		VoiceID: voiceID,
		ModelID: modelID,
	}

	data, err := api.makeRequest("POST", "/tts/jobs/", reqBody)
	if err != nil {
		return nil, err
	}

	var job TTSJob
	if err := json.Unmarshal(data, &job); err != nil {
		return nil, fmt.Errorf("failed to parse job response: %w", err)
	}

	return &job, nil
}

func (api *CreoleCentricAPI) GetJobStatus(jobID string) (*JobStatusResponse, error) {
	data, err := api.makeRequest("GET", fmt.Sprintf("/tts/jobs/%s/status/", jobID), nil)
	if err != nil {
		return nil, err
	}

	var status JobStatusResponse
	if err := json.Unmarshal(data, &status); err != nil {
		return nil, fmt.Errorf("failed to parse job status: %w", err)
	}

	return &status, nil
}

func (api *CreoleCentricAPI) ListJobs(limit int) (*JobListResponse, error) {
	endpoint := fmt.Sprintf("/tts/jobs/list/?limit=%d", limit)
	data, err := api.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}

	var jobList JobListResponse
	if err := json.Unmarshal(data, &jobList); err != nil {
		return nil, fmt.Errorf("failed to parse job list: %w", err)
	}

	return &jobList, nil
}


// ============== Example Usage ==============

func main() {
	// Load environment variables
	godotenv.Load()

	apiKey := os.Getenv("CREOLECENTRIC_API_KEY")
	if apiKey == "" {
		fmt.Println("Error: CREOLECENTRIC_API_KEY environment variable not set")
		fmt.Println("Please set it with your API key: export CREOLECENTRIC_API_KEY='cc_your_key_here'")
		os.Exit(1)
	}

	client := NewCreoleCentricAPI(apiKey)

	// 1. Check API health
	fmt.Println(strings.Repeat("=", 50))
	fmt.Println("1. Checking API Health")
	fmt.Println(strings.Repeat("=", 50))
	health, err := client.CheckHealth()
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("API Status: %s\n", health.Status)
	fmt.Printf("Version: %s\n\n", health.Version)

	// 2. Get credit balance
	fmt.Println(strings.Repeat("=", 50))
	fmt.Println("2. Credit Balance")
	fmt.Println(strings.Repeat("=", 50))
	balance, err := client.GetCreditBalance()
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("Total Credits: %d\n", balance.TotalCredits)
	fmt.Printf("Subscription Credits: %d\n", balance.SubscriptionCredits)
	fmt.Printf("Purchased Credits: %d\n\n", balance.PurchasedCredits)

	// 3. Get available voices
	fmt.Println(strings.Repeat("=", 50))
	fmt.Println("3. Available Voices")
	fmt.Println(strings.Repeat("=", 50))
	voicesResp, err := client.GetVoices()
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("Found %d voices (source: %s):\n", voicesResp.Count, voicesResp.Source)
	for i, voice := range voicesResp.Voices {
		if i >= 5 {
			break
		}
		fmt.Printf("  - %s (ID: %s)\n", voice.Name, voice.VoiceID)
		fmt.Printf("    Region: %s, Gender: %s\n", voice.Region, voice.Gender)
	}
	fmt.Println()

	// 4. Get available models
	fmt.Println(strings.Repeat("=", 50))
	fmt.Println("4. Available Models")
	fmt.Println(strings.Repeat("=", 50))
	modelsResp, err := client.GetModels()
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("Found %d models:\n", modelsResp.Count)
	for _, model := range modelsResp.Models {
		displayName := model.DisplayName
		if displayName == "" {
			displayName = model.Name
		}
		fmt.Printf("  - %s (ID: %s)\n", displayName, model.ID)
		fmt.Printf("    Description: %s\n", model.Description)
	}
	fmt.Println()

	// 5. Create a TTS job
	fmt.Println(strings.Repeat("=", 50))
	fmt.Println("5. Creating TTS Job")
	fmt.Println(strings.Repeat("=", 50))

	text := "Bonjou! Mwen se yon egzanp API pou CreoleCentric. Mwen ka pale Kreyòl ayisyen."
	fmt.Printf("Text: %s\n", text)

	voiceID := "i4mRPwKM2yHwXhbmkN514" // Xavier Bruneau
	modelID := "ccl_ht_v100"

	if len(voicesResp.Voices) > 0 &&
	   voicesResp.Voices[0].VoiceID != "voice_1" &&
	   voicesResp.Voices[0].VoiceID != "voice_2" {
		voiceID = voicesResp.Voices[0].VoiceID
	}
	if len(modelsResp.Models) > 0 {
		modelID = modelsResp.Models[0].ID
	}

	job, err := client.CreateTTSJob(text, voiceID, modelID)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Job created successfully!")
	fmt.Printf("Job ID: %s\n", job.ID)
	fmt.Printf("Status: %s\n", job.Status)
	fmt.Printf("Credits used: %d\n\n", job.CreditsUsed)
	fmt.Println("📢 To receive webhook notifications, add webhook_url to CreateJobRequest:")
	fmt.Println("   Events: tts_queued → tts_started → tts_synthesized → tts_uploaded → tts_delivered")
	fmt.Println("   See examples/webhook_server.go for webhook handling example")
	fmt.Println()

	// 6. List recent jobs
	fmt.Println(strings.Repeat("=", 50))
	fmt.Println("6. Recent Jobs")
	fmt.Println(strings.Repeat("=", 50))

	jobList, err := client.ListJobs(5)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Recent %d jobs:\n", len(jobList.Results))
	for _, job := range jobList.Results {
		jobIDDisplay := job.ID
		if len(job.ID) > 8 {
			jobIDDisplay = job.ID[:8] + "..."
		}
		fmt.Printf("  - Job %s\n", jobIDDisplay)
		fmt.Printf("    Created: %s\n", job.CreatedAt)
		fmt.Printf("    Status: %s\n", job.Status)
		if job.Text != "" {
			textPreview := job.Text
			if len(textPreview) > 50 {
				textPreview = textPreview[:50] + "..."
			}
			fmt.Printf("    Text: %s\n", textPreview)
		}
	}
}
