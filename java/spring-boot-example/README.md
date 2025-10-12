# CreoleCentric TTS Spring Boot Example

This example demonstrates how to integrate the CreoleCentric Text-to-Speech API with a Spring Boot application using Java.

## Features

- **Type-Safe API Integration**: Java client with strong typing
- **RESTful API Endpoints**: Spring Boot controllers for TTS operations
- **Server-Side API Key**: Securely stores API credentials on the backend
- **Error Handling**: Comprehensive exception handling
- **JSON Serialization**: Jackson for request/response mapping
- **Configuration**: Spring properties for environment configuration

## Prerequisites

- Java 17 or higher
- Maven 3.6+ or Gradle 7.0+
- CreoleCentric API key (get one at https://creolecentric.com)

## Setup

1. **Clone this example**:
   ```bash
   git clone https://github.com/Creole-Centric/api-examples.git
   cd api-examples/java/spring-boot-example
   ```

2. **Install dependencies**:
   ```bash
   ./mvnw clean install
   ```

3. **Configure application properties**:
   Edit `src/main/resources/application.properties`:
   ```properties
   server.port=8080
   creolecentric.api.key=cc_your_api_key_here
   creolecentric.api.url=https://api.creolecentric.com/v1
   ```

   Or use environment variables:
   ```bash
   export CREOLECENTRIC_API_KEY=cc_your_api_key_here
   export CREOLECENTRIC_API_URL=https://api.creolecentric.com/v1
   ```

4. **Run the application**:
   ```bash
   ./mvnw spring-boot:run
   ```

   The API will be available at [http://localhost:8080](http://localhost:8080)

## Project Structure

```
spring-boot-example/
├── src/main/java/com/creolecentric/example/
│   ├── CreoleCentricApplication.java    # Main application
│   ├── config/
│   │   └── CreoleCentricConfig.java     # Configuration
│   ├── client/
│   │   └── CreoleCentricClient.java     # API client
│   ├── controller/
│   │   └── TTSController.java           # REST controllers
│   ├── model/
│   │   ├── TTSJob.java                   # Job model
│   │   ├── Voice.java                    # Voice model
│   │   └── ...                           # Other models
│   └── exception/
│       └── CreoleCentricException.java  # Custom exception
├── src/main/resources/
│   └── application.properties            # Configuration
├── pom.xml                               # Maven dependencies
└── README.md                             # This file
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

### Get Available Voices
```http
GET /api/tts/voices
```

### Get Available Models
```http
GET /api/tts/models
```

### Get Credit Balance
```http
GET /api/credits/balance
```

### Health Check
```http
GET /api/health
```

## Usage Examples

### Using curl

```bash
# Create a TTS job
curl -X POST http://localhost:8080/api/tts/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bonjou! Kijan ou ye?",
    "voiceId": "i4mRPwKM2yHwXhbmkN514",
    "modelId": "ccl_ht_v100"
  }'

# Check job status
curl http://localhost:8080/api/tts/jobs/{jobId}

# Get voices
curl http://localhost:8080/api/tts/voices
```

### Using Java

```java
import org.springframework.web.client.RestTemplate;

// Create a TTS job
RestTemplate restTemplate = new RestTemplate();

TTSJobRequest request = new TTSJobRequest();
request.setText("Bonjou! Kijan ou ye?");
request.setVoiceId("i4mRPwKM2yHwXhbmkN514");
request.setModelId("ccl_ht_v100");

TTSJob job = restTemplate.postForObject(
    "http://localhost:8080/api/tts/jobs",
    request,
    TTSJob.class
);

System.out.println("Job created: " + job.getId());

// Poll for completion
while (!job.getStatus().equals("delivered")) {
    Thread.sleep(2000);
    job = restTemplate.getForObject(
        "http://localhost:8080/api/tts/jobs/" + job.getId(),
        TTSJob.class
    );
}

System.out.println("Audio ready: " + job.getAudioUrl());
```

## Development

### Building the Project

```bash
# Maven
./mvnw clean package

# Gradle
./gradlew build
```

### Running Tests

```bash
# Maven
./mvnw test

# Gradle
./gradlew test
```

### Creating a JAR

```bash
./mvnw clean package
java -jar target/creolecentric-spring-boot-example-1.0.0.jar
```

## Deployment

This Spring Boot application can be deployed to:
- **AWS Elastic Beanstalk**: Upload JAR file
- **Heroku**: Add `Procfile` with `web: java -jar target/*.jar`
- **Google Cloud Run**: Package as Docker container
- **Azure App Service**: Deploy JAR via Maven plugin
- **Kubernetes**: Create Deployment and Service

### Docker Deployment

```dockerfile
FROM openjdk:17-jdk-slim
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

```bash
docker build -t creolecentric-tts .
docker run -p 8080:8080 \
  -e CREOLECENTRIC_API_KEY=your_key \
  -e CREOLECENTRIC_API_URL=https://api.creolecentric.com/v1 \
  creolecentric-tts
```

## Configuration

### Application Properties

```properties
# Server
server.port=8080

# CreoleCentric API
creolecentric.api.key=${CREOLECENTRIC_API_KEY:cc_your_api_key_here}
creolecentric.api.url=${CREOLECENTRIC_API_URL:https://api.creolecentric.com/v1}

# Logging
logging.level.com.creolecentric=DEBUG
```

### Environment Variables

- `CREOLECENTRIC_API_KEY` - Your API key
- `CREOLECENTRIC_API_URL` - API base URL
- `SERVER_PORT` - Server port (default: 8080)

## Security Considerations

- API key is stored securely on the backend
- Input validation on all endpoints
- Rate limiting recommended for production
- CORS configured - update for production
- Error messages sanitized

## Learn More

- [CreoleCentric API Documentation](https://creolecentric.com/developer)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Java Documentation](https://docs.oracle.com/en/java/)

## Support

For questions or issues:
- Email: support@creolecentric.com
- GitHub: https://github.com/Creole-Centric/api-examples/issues

## License

MIT
