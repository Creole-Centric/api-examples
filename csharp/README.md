# CreoleCentric TTS API - C# Example

.NET client for the CreoleCentric Text-to-Speech API. Works with .NET 6.0+, .NET Core 3.1+, and .NET Framework 4.7.2+.

## Features

- ✅ .NET 6.0+ with async/await
- ✅ System.Text.Json for serialization
- ✅ Strongly typed with modern C# features
- ✅ ASP.NET Core integration support
- ✅ Xamarin/MAUI support
- ✅ IDisposable pattern for proper resource cleanup

## Requirements

- .NET SDK 6.0 or higher
- Or .NET Core 3.1+
- Or .NET Framework 4.7.2+ (with System.Text.Json NuGet package)

## Installation

### .NET CLI

```bash
dotnet add package System.Text.Json
```

Copy `CreoleCentricAPI.cs` into your project.

### NuGet Package Manager

```powershell
Install-Package System.Text.Json
```

### As a Project Reference

Add to your `.csproj`:

```xml
<ItemGroup>
  <PackageReference Include="System.Text.Json" Version="8.0.0" />
</ItemGroup>
```

## Quick Start

### Running the Example

```bash
cd csharp
export CREOLECENTRIC_API_KEY='cc_your_key_here'  # Linux/macOS
# OR
set CREOLECENTRIC_API_KEY=cc_your_key_here       # Windows CMD
# OR
$env:CREOLECENTRIC_API_KEY='cc_your_key_here'    # Windows PowerShell

dotnet run
```

### Build and Run Executable

```bash
dotnet build
dotnet run

# Or build as release
dotnet build -c Release
dotnet bin/Release/net6.0/CreoleCentricAPI.dll
```

## Usage Examples

### Basic Usage

```csharp
using CreoleCentric.Api;

class Program
{
    static async Task Main(string[] args)
    {
        using var client = new CreoleCentricAPI("cc_your_api_key_here");

        // Check health
        var health = await client.CheckHealthAsync();
        Console.WriteLine($"API Version: {health.Version}");

        // Get credit balance
        var balance = await client.GetCreditBalanceAsync();
        Console.WriteLine($"Available Credits: {balance.AvailableCredits}");

        // Create TTS job
        var job = await client.CreateTTSJobAsync(
            "Bonjou! Sa se yon egzanp.",
            "i4mRPwKM2yHwXhbmkN514",  // Xavier Bruneau
            "ccl_ht_v100"
        );

        // Wait for completion
        var status = await client.WaitForJobAsync(job.Id);

        if (status.Status == "completed" || status.Status == "delivered")
        {
            Console.WriteLine($"Audio URL: {status.AudioUrl}");
        }
    }
}
```

### ASP.NET Core Integration

#### Startup Configuration (Program.cs)

```csharp
using CreoleCentric.Api;

var builder = WebApplication.CreateBuilder(args);

// Register CreoleCentricAPI as a singleton
builder.Services.AddSingleton(sp =>
{
    var apiKey = builder.Configuration["CreoleCentric:ApiKey"];
    return new CreoleCentricAPI(apiKey);
});

builder.Services.AddControllers();

var app = builder.Build();
app.MapControllers();
app.Run();
```

#### appsettings.json

```json
{
  "CreoleCentric": {
    "ApiKey": "cc_your_api_key_here"
  }
}
```

#### API Controller

```csharp
using Microsoft.AspNetCore.Mvc;
using CreoleCentric.Api;

[ApiController]
[Route("api/[controller]")]
public class TTSController : ControllerBase
{
    private readonly CreoleCentricAPI _ttsClient;
    private readonly ILogger<TTSController> _logger;

    public TTSController(CreoleCentricAPI ttsClient, ILogger<TTSController> logger)
    {
        _ttsClient = ttsClient;
        _logger = logger;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateSpeech([FromBody] GenerateSpeechRequest request)
    {
        try
        {
            var job = await _ttsClient.CreateTTSJobAsync(
                request.Text,
                request.VoiceId,
                request.ModelId
            );

            var status = await _ttsClient.WaitForJobAsync(job.Id, 60, 2);

            if (status.Status == "completed" || status.Status == "delivered")
            {
                return Ok(new { audioUrl = status.AudioUrl, jobId = job.Id });
            }

            return BadRequest(new { error = status.Error });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating speech");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("voices")]
    public async Task<IActionResult> GetVoices()
    {
        var voicesResponse = await _ttsClient.GetVoicesAsync();
        return Ok(voicesResponse);
    }

    [HttpGet("balance")]
    public async Task<IActionResult> GetBalance()
    {
        var balance = await _ttsClient.GetCreditBalanceAsync();
        return Ok(balance);
    }
}

public record GenerateSpeechRequest(string Text, string VoiceId, string ModelId);
```

### Xamarin.Forms / .NET MAUI Integration

```csharp
using CreoleCentric.Api;

namespace MyMauiApp.ViewModels
{
    public class TTSViewModel : INotifyPropertyChanged
    {
        private readonly CreoleCentricAPI _client;
        private string _audioUrl;
        private bool _isLoading;

        public string AudioUrl
        {
            get => _audioUrl;
            set
            {
                _audioUrl = value;
                OnPropertyChanged();
            }
        }

        public bool IsLoading
        {
            get => _isLoading;
            set
            {
                _isLoading = value;
                OnPropertyChanged();
            }
        }

        public ICommand GenerateSpeechCommand { get; }

        public TTSViewModel()
        {
            _client = new CreoleCentricAPI("cc_your_api_key_here");
            GenerateSpeechCommand = new Command(async () => await GenerateSpeechAsync());
        }

        private async Task GenerateSpeechAsync()
        {
            IsLoading = true;
            try
            {
                var job = await _client.CreateTTSJobAsync(
                    "Bonjou! Mwen se yon egzanp pou MAUI.",
                    "i4mRPwKM2yHwXhbmkN514",
                    "ccl_ht_v100"
                );

                var status = await _client.WaitForJobAsync(job.Id);

                if (status.Status == "completed" || status.Status == "delivered")
                {
                    AudioUrl = status.AudioUrl;
                    await PlayAudioAsync(status.AudioUrl);
                }
            }
            catch (Exception ex)
            {
                await Application.Current.MainPage.DisplayAlert(
                    "Error",
                    ex.Message,
                    "OK"
                );
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task PlayAudioAsync(string url)
        {
            // Use MediaManager.CrossMediaManager or similar plugin
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected void OnPropertyChanged([CallerMemberName] string name = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        }
    }
}
```

### Blazor WebAssembly Integration

```razor
@page "/tts"
@using CreoleCentric.Api
@inject CreoleCentricAPI TTSClient

<h3>Text-to-Speech Generator</h3>

@if (isLoading)
{
    <p>Generating speech...</p>
    <progress />
}
else if (!string.IsNullOrEmpty(audioUrl))
{
    <p>Audio ready!</p>
    <audio controls src="@audioUrl"></audio>
}

<div>
    <textarea @bind="text" rows="5" cols="50"></textarea>
    <br />
    <button @onclick="GenerateSpeech" disabled="@isLoading">
        Generate Speech
    </button>
</div>

@code {
    private string text = "Bonjou! Sa se yon egzanp nan Blazor.";
    private string audioUrl;
    private bool isLoading;

    private async Task GenerateSpeech()
    {
        isLoading = true;
        audioUrl = null;

        try
        {
            var job = await TTSClient.CreateTTSJobAsync(
                text,
                "i4mRPwKM2yHwXhbmkN514",
                "ccl_ht_v100"
            );

            var status = await TTSClient.WaitForJobAsync(job.Id, 60, 2);

            if (status.Status == "completed" || status.Status == "delivered")
            {
                audioUrl = status.AudioUrl;
            }
        }
        catch (Exception ex)
        {
            // Handle error
            Console.WriteLine($"Error: {ex.Message}");
        }
        finally
        {
            isLoading = false;
        }
    }
}
```

## API Reference

### Initialization

```csharp
// Basic initialization
var client = new CreoleCentricAPI("cc_your_api_key_here");

// With custom base URL
var client = new CreoleCentricAPI(
    "cc_your_api_key_here",
    "https://creolecentric.com/api/v1"
);

// Don't forget to dispose when done
client.Dispose();

// Or use 'using' statement
using var client = new CreoleCentricAPI("cc_your_api_key_here");
```

### Health Check

```csharp
var health = await client.CheckHealthAsync();
Console.WriteLine($"Status: {health.Status}");
Console.WriteLine($"Version: {health.Version}");
```

### Credit Balance

```csharp
var balance = await client.GetCreditBalanceAsync();
Console.WriteLine($"Available: {balance.AvailableCredits}");
Console.WriteLine($"Used: {balance.UsedCredits}");
Console.WriteLine($"Total: {balance.TotalCredits}");
```

### List Voices

```csharp
var voicesResponse = await client.GetVoicesAsync();
var voices = voicesResponse.Voices;

foreach (var voice in voices)
{
    Console.WriteLine($"{voice.Name} ({voice.VoiceId})");
    Console.WriteLine($"Region: {voice.Region}, Gender: {voice.Gender}");
}
```

### List Models

```csharp
var modelsResponse = await client.GetModelsAsync();
foreach (var model in modelsResponse.Models)
{
    Console.WriteLine($"{model.Name} ({model.Id})");
}
```

### Create TTS Job

```csharp
// Basic usage
var job = await client.CreateTTSJobAsync(
    "Your text here",
    "i4mRPwKM2yHwXhbmkN514",  // Voice ID
    "ccl_ht_v100"             // Model ID
);

// With custom parameters
var job = await client.CreateTTSJobAsync(
    text: "Your text here",
    voiceId: "i4mRPwKM2yHwXhbmkN514",
    modelId: "ccl_ht_v100",
    speed: 1.0,              // 0.5 to 2.0
    stability: 0.5,          // 0.0 to 1.0
    similarityBoost: 0.75    // 0.0 to 1.0
);
```

### Wait for Job Completion

```csharp
// Default timeout (300s) and poll interval (2s)
var status = await client.WaitForJobAsync(jobId);

// Custom timeout and poll interval
var status = await client.WaitForJobAsync(
    jobId,
    timeout: 60,        // seconds
    pollInterval: 2     // seconds
);

if (status.Status == "completed" || status.Status == "delivered")
{
    Console.WriteLine($"Audio URL: {status.AudioUrl}");
}
else if (status.Status == "failed")
{
    Console.WriteLine($"Error: {status.Error}");
}
```

### Get Recent Jobs

```csharp
// Get last 10 jobs (default)
var recentJobs = await client.GetRecentJobsAsync();

// Get specific number of jobs
var recentJobs = await client.GetRecentJobsAsync(20);

foreach (var job in recentJobs.Jobs)
{
    Console.WriteLine($"Job {job.Id}: {job.Status}");
}
```

## Error Handling

```csharp
using System.Net.Http;

try
{
    var job = await client.CreateTTSJobAsync(text, voiceId, modelId);
    var status = await client.WaitForJobAsync(job.Id);
}
catch (HttpRequestException ex) when (ex.Message.Contains("HTTP 401"))
{
    Console.WriteLine("Invalid API key");
}
catch (HttpRequestException ex) when (ex.Message.Contains("HTTP 402"))
{
    Console.WriteLine("Insufficient credits");
}
catch (HttpRequestException ex) when (ex.Message.Contains("HTTP 429"))
{
    Console.WriteLine("Rate limit exceeded");
}
catch (TimeoutException ex)
{
    Console.WriteLine($"Job timed out: {ex.Message}");
}
catch (Exception ex)
{
    Console.WriteLine($"Error: {ex.Message}");
}
```

## Common Use Cases

### Parallel Job Processing

```csharp
var texts = new[] { "Text 1", "Text 2", "Text 3" };
var voiceId = "i4mRPwKM2yHwXhbmkN514";
var modelId = "ccl_ht_v100";

var tasks = texts.Select(async text =>
{
    var job = await client.CreateTTSJobAsync(text, voiceId, modelId);
    return await client.WaitForJobAsync(job.Id);
});

var results = await Task.WhenAll(tasks);

foreach (var status in results)
{
    Console.WriteLine($"Job {status.Id}: {status.AudioUrl}");
}
```

### Retry Logic with Polly

```bash
dotnet add package Polly
```

```csharp
using Polly;
using Polly.Retry;

var retryPolicy = Policy
    .Handle<HttpRequestException>()
    .WaitAndRetryAsync(
        3,
        retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
        onRetry: (exception, timeSpan, retryCount, context) =>
        {
            Console.WriteLine($"Retry {retryCount} after {timeSpan.TotalSeconds}s");
        });

var status = await retryPolicy.ExecuteAsync(async () =>
{
    var job = await client.CreateTTSJobAsync(text, voiceId, modelId);
    return await client.WaitForJobAsync(job.Id);
});
```

### Background Service (ASP.NET Core)

```csharp
public class TTSBackgroundService : BackgroundService
{
    private readonly CreoleCentricAPI _client;
    private readonly ILogger<TTSBackgroundService> _logger;

    public TTSBackgroundService(CreoleCentricAPI client, ILogger<TTSBackgroundService> logger)
    {
        _client = client;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var balance = await _client.GetCreditBalanceAsync(stoppingToken);

                if (balance.AvailableCredits < 100)
                {
                    _logger.LogWarning("Low credits: {Credits}", balance.AvailableCredits);
                    // Send notification
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking credits");
            }

            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}

// Register in Program.cs
builder.Services.AddHostedService<TTSBackgroundService>();
```

### Cancellation Token Support

```csharp
var cts = new CancellationTokenSource();
cts.CancelAfter(TimeSpan.FromSeconds(30));

try
{
    var job = await client.CreateTTSJobAsync(
        text, voiceId, modelId,
        cancellationToken: cts.Token
    );

    var status = await client.WaitForJobAsync(
        job.Id, 60, 2,
        cancellationToken: cts.Token
    );
}
catch (OperationCanceledException)
{
    Console.WriteLine("Operation was cancelled");
}
```

## Best Practices

1. **Use Dependency Injection**
   - Register as singleton in ASP.NET Core
   - Share single instance across application
   - Properly dispose when application shuts down

2. **Store API Key Securely**
   - Use User Secrets in development
   - Use Azure Key Vault or similar in production
   - Never commit keys to version control

3. **Handle Errors Gracefully**
   - Use try-catch blocks
   - Check HTTP status codes
   - Implement retry logic for transient errors

4. **Monitor Credits**
   - Check balance before large operations
   - Implement alerting for low credits
   - Cache balance with reasonable TTL

5. **Use Cancellation Tokens**
   - Pass CancellationToken to all async methods
   - Respect user cancellation requests
   - Implement timeouts for long operations

6. **Dispose Properly**
   - Use `using` statements
   - Implement IDisposable in wrapper classes
   - Clean up HttpClient resources

## Thread Safety

The `CreoleCentricAPI` class uses `HttpClient` which is thread-safe. You can safely use a single instance across multiple threads:

```csharp
// ASP.NET Core - Singleton registration
services.AddSingleton<CreoleCentricAPI>(sp =>
{
    var apiKey = sp.GetRequiredService<IConfiguration>()["CreoleCentric:ApiKey"];
    return new CreoleCentricAPI(apiKey);
});
```

## Supported Platforms

- ✅ .NET 6.0+
- ✅ .NET Core 3.1+
- ✅ .NET Framework 4.7.2+
- ✅ ASP.NET Core
- ✅ Blazor (Server & WebAssembly)
- ✅ Xamarin.Forms
- ✅ .NET MAUI
- ✅ Unity (with .NET Standard 2.1+)

## Support

- Documentation: https://creolecentric.com/docs
- GitHub: https://github.com/Creole-Centric/api-examples
- Email: support@creolecentric.com

## License

MIT License - See LICENSE file for details
