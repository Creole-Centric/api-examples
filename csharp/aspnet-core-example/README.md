# CreoleCentric TTS ASP.NET Core Example

This example demonstrates how to integrate the CreoleCentric Text-to-Speech API with an ASP.NET Core Web API using C#.

## Features

- **Type-Safe API Integration**: C# client with strong typing
- **RESTful API Endpoints**: ASP.NET Core controllers for TTS operations
- **Server-Side API Key**: Securely stores API credentials on the backend
- **Error Handling**: Comprehensive exception handling middleware
- **JSON Serialization**: System.Text.Json for request/response mapping
- **Configuration**: appsettings.json and environment variables

## Prerequisites

- .NET 8.0 SDK or higher
- Visual Studio 2022, VS Code, or JetBrains Rider (optional)
- CreoleCentric API key (get one at https://creolecentric.com)

## Setup

1. **Clone this example**:
   ```bash
   git clone https://github.com/Creole-Centric/api-examples.git
   cd api-examples/csharp/aspnet-core-example
   ```

2. **Restore dependencies**:
   ```bash
   dotnet restore
   ```

3. **Configure application settings**:
   Edit `appsettings.json`:
   ```json
   {
     "CreoleCentric": {
       "ApiKey": "cc_your_api_key_here",
       "ApiUrl": "https://api.creolecentric.com/v1"
     }
   }
   ```

   Or use environment variables:
   ```bash
   export CreoleCentric__ApiKey=cc_your_api_key_here
   export CreoleCentric__ApiUrl=https://api.creolecentric.com/v1
   ```

4. **Run the application**:
   ```bash
   dotnet run
   ```

   The API will be available at [http://localhost:5000](http://localhost:5000)

## Project Structure

```
aspnet-core-example/
├── Controllers/
│   └── TTSController.cs            # REST API controllers
├── Services/
│   └── CreoleCentricClient.cs      # API client service
├── Models/
│   ├── TTSJob.cs                    # Job model
│   ├── TTSJobRequest.cs             # Request model
│   └── Voice.cs                     # Voice model
├── Exceptions/
│   └── CreoleCentricException.cs   # Custom exception
├── Program.cs                       # Application entry point
├── appsettings.json                 # Configuration
├── CreoleCentricExample.csproj      # Project file
└── README.md                        # This file
```

## API Endpoints

### Create TTS Job
```http
POST /api/tts/jobs
Content-Type: application/json

{
  "text": "Bonjou! Kijan ou ye?",
  "voiceId": "i4mRPwKM2yHwXhbmkN514",
  "modelId": "ccl_ht_v100",
  "speed": 1.0,
  "pitch": 1.0
}
```

### Get Job Status
```http
GET /api/tts/jobs/{jobId}
```

### Get Available Voices (if implemented)
```http
GET /api/tts/voices
```

### Health Check
```http
GET /api/health
```

## Usage Examples

### Using curl

```bash
# Create a TTS job
curl -X POST http://localhost:5000/api/tts/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bonjou! Kijan ou ye?",
    "voiceId": "i4mRPwKM2yHwXhbmkN514",
    "modelId": "ccl_ht_v100"
  }'

# Check job status
curl http://localhost:5000/api/tts/jobs/{jobId}
```

### Using C# (HttpClient)

```csharp
using System.Net.Http.Json;

var client = new HttpClient { BaseAddress = new Uri("http://localhost:5000") };

// Create a TTS job
var request = new TTSJobRequest
{
    Text = "Bonjou! Kijan ou ye?",
    VoiceId = "i4mRPwKM2yHwXhbmkN514",
    ModelId = "ccl_ht_v100"
};

var response = await client.PostAsJsonAsync("/api/tts/jobs", request);
var job = await response.Content.ReadFromJsonAsync<TTSJob>();

Console.WriteLine($"Job created: {job.Id}");

// Poll for completion
while (job.Status != "delivered")
{
    await Task.Delay(2000);
    job = await client.GetFromJsonAsync<TTSJob>($"/api/tts/jobs/{job.Id}");
}

Console.WriteLine($"Audio ready: {job.AudioUrl}");
```

## Development

### Building the Project

```bash
dotnet build
```

### Running Tests

```bash
dotnet test
```

### Publishing for Production

```bash
dotnet publish -c Release -o ./publish
```

## Deployment

This ASP.NET Core API can be deployed to:
- **Azure App Service**: Right-click project → Publish → Azure
- **AWS Elastic Beanstalk**: Package and deploy
- **Docker**: Create Dockerfile with .NET runtime
- **IIS**: Publish and configure IIS
- **Kubernetes**: Create Deployment with .NET image

### Docker Deployment

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["CreoleCentricExample.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CreoleCentricExample.dll"]
```

```bash
docker build -t creolecentric-tts .
docker run -p 5000:80 \
  -e CreoleCentric__ApiKey=your_key \
  -e CreoleCentric__ApiUrl=https://api.creolecentric.com/v1 \
  creolecentric-tts
```

## Configuration

### appsettings.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "CreoleCentric": {
    "ApiKey": "cc_your_api_key_here",
    "ApiUrl": "https://api.creolecentric.com/v1"
  }
}
```

### Environment Variables

- `CreoleCentric__ApiKey` - Your API key
- `CreoleCentric__ApiUrl` - API base URL
- `ASPNETCORE_URLS` - Server URLs (default: http://localhost:5000)

## Security Considerations

- API key is stored securely on the backend
- Input validation on all endpoints
- Rate limiting recommended for production
- CORS configured - update for production
- Error messages sanitized

## Learn More

- [CreoleCentric API Documentation](https://creolecentric.com/developer)
- [ASP.NET Core Documentation](https://docs.microsoft.com/aspnet/core)
- [C# Documentation](https://docs.microsoft.com/dotnet/csharp)

## Support

For questions or issues:
- Email: support@creolecentric.com
- GitHub: https://github.com/Creole-Centric/api-examples/issues

## License

MIT
