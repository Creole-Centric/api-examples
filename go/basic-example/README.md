# CreoleCentric TTS Go Example

This example demonstrates how to integrate the CreoleCentric Text-to-Speech API with Go using the standard `net/http` package.

## Features

- **Native HTTP Client**: Uses Go's standard `net/http` package
- **Strongly Typed**: Full struct definitions for all API responses
- **Error Handling**: Comprehensive error handling with custom types
- **Job Polling**: Built-in `WaitForJob()` method
- **JSON Marshaling**: Native `encoding/json` for serialization
- **Module Support**: Go modules for dependency management

## Prerequisites

- Go 1.18 or higher
- CreoleCentric API key (get one at https://creolecentric.com)

## Setup

1. **Clone this example**:
   ```bash
   git clone https://github.com/Creole-Centric/api-examples.git
   cd api-examples/go/basic-example
   ```

2. **Install dependencies**:
   ```bash
   go mod download
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API credentials:
   ```env
   CREOLECENTRIC_API_KEY=cc_your_api_key_here
   CREOLECENTRIC_API_URL=https://api.creolecentric.com/v1
   ```

4. **Run the example**:
   ```bash
   go run creolecentric_api.go
   ```

## Usage

### Basic TTS Job

```go
package main

import (
    "fmt"
    "log"
    "os"
)

func main() {
    apiKey := os.Getenv("CREOLECENTRIC_API_KEY")
    client := NewCreoleCentricAPI(apiKey)

    // Create a TTS job
    job, err := client.CreateTTSJob(
        "Bonjou! Kijan ou ye?",
        "i4mRPwKM2yHwXhbmkN514",  // Xavier Bruneau
        "ccl_ht_v100",
    )
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Job created: %s\n", job.ID)

    // Wait for completion
    finalStatus, err := client.WaitForJob(job.ID, 60, 2)
    if err != nil {
        log.Fatal(err)
    }

    if finalStatus.AudioURL != "" {
        fmt.Printf("Audio ready: %s\n", finalStatus.AudioURL)
    }
}
```

### Using as a Package

You can import the API client in your own Go projects:

```go
package main

import (
    "fmt"
    "log"
)

func main() {
    client := NewCreoleCentricAPI("cc_your_key_here")

    // Check API health
    health, err := client.CheckHealth()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("API Status: %s\n", health.Status)

    // Get credit balance
    balance, err := client.GetCreditBalance()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Total Credits: %d\n", balance.TotalCredits)

    // Get available voices
    voices, err := client.GetVoices()
    if err != nil {
        log.Fatal(err)
    }
    for _, voice := range voices.Voices {
        fmt.Printf("Voice: %s (ID: %s)\n", voice.Name, voice.VoiceID)
    }

    // Get available models
    models, err := client.GetModels()
    if err != nil {
        log.Fatal(err)
    }
    for _, model := range models.Models {
        fmt.Printf("Model: %s (ID: %s)\n", model.DisplayName, model.ID)
    }
}
```

## API Client Features

The `CreoleCentricAPI` struct includes:

### Type Definitions
- `HealthResponse` - API health status
- `CreditBalance` - Credit balance information
- `Voice` - Voice details
- `VoicesResponse` - List of voices
- `Model` - TTS model details
- `ModelsResponse` - List of models
- `TTSJob` - TTS job details
- `JobStatusResponse` - Job status
- `JobListResponse` - List of jobs

### Methods

#### Health & Credits
- `CheckHealth() (*HealthResponse, error)` - Check API health
- `GetCreditBalance() (*CreditBalance, error)` - Get credit balance

#### Voices & Models
- `GetVoices() (*VoicesResponse, error)` - Get available voices
- `GetModels() (*ModelsResponse, error)` - Get available TTS models

#### TTS Jobs
- `CreateTTSJob(text, voiceID, modelID string) (*TTSJob, error)` - Create a new TTS job
- `GetJobStatus(jobID string) (*JobStatusResponse, error)` - Get job status
- `ListJobs(limit int) (*JobListResponse, error)` - List recent jobs
- `WaitForJob(jobID string, timeout, pollInterval int) (*JobStatusResponse, error)` - Poll until job completes

## Error Handling

The client returns standard Go errors:

```go
job, err := client.CreateTTSJob("Hello", "voice_id", "model_id")
if err != nil {
    fmt.Printf("Error creating job: %v\n", err)
    return
}

// Check HTTP errors
if strings.Contains(err.Error(), "HTTP") {
    // Handle HTTP error
}
```

## Advanced Usage

### Custom Timeout and Polling

```go
// Wait for job with custom settings
finalStatus, err := client.WaitForJob(
    job.ID,
    300,  // 5 minutes timeout
    3,    // Check every 3 seconds
)
```

### List Jobs with Limit

```go
// Get recent jobs
jobList, err := client.ListJobs(20)
if err != nil {
    log.Fatal(err)
}

for _, job := range jobList.Results {
    fmt.Printf("Job %s: %s\n", job.ID, job.Status)
}
```

### Custom Base URL

```go
// Use custom API URL
client := NewCreoleCentricAPI(
    "cc_your_key",
    "https://custom-api.example.com/api/v1",
)
```

## Building

### Build Binary

```bash
go build -o creolecentric creolecentric_api.go
./creolecentric
```

### Cross-Compile

```bash
# Linux
GOOS=linux GOARCH=amd64 go build -o creolecentric-linux

# Windows
GOOS=windows GOARCH=amd64 go build -o creolecentric.exe

# macOS
GOOS=darwin GOARCH=amd64 go build -o creolecentric-macos
```

## Testing

Run the example to test all functionality:

```bash
go run creolecentric_api.go
```

This will:
1. Check API health
2. Get credit balance
3. List available voices
4. List available models
5. Create a TTS job
6. Wait for job completion
7. List recent jobs

## Dependencies

This example uses minimal dependencies:

- `github.com/joho/godotenv` - Environment variable loading

Install with:
```bash
go get github.com/joho/godotenv
```

## Learn More

- [CreoleCentric API Documentation](https://creolecentric.com/developer)
- [Go Documentation](https://golang.org/doc)
- [Go HTTP Package](https://pkg.go.dev/net/http)

## Support

For questions or issues:
- Email: support@creolecentric.com
- GitHub: https://github.com/Creole-Centric/api-examples/issues

## License

MIT
