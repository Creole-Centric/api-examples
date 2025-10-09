# CreoleCentric TTS API - Java Example

Java client for the CreoleCentric Text-to-Speech API. Works with Java 11+.

## Features

- ✅ Java 11+ with native HttpClient
- ✅ Type-safe with proper POJOs
- ✅ Gson for JSON serialization
- ✅ Maven and Gradle support
- ✅ No complex dependencies
- ✅ Thread-safe implementation

## Requirements

- Java 11 or higher
- Maven 3.6+ or Gradle 7.0+

## Installation

### Maven

Add to your `pom.xml`:

```xml
<dependencies>
    <dependency>
        <groupId>com.google.code.gson</groupId>
        <artifactId>gson</artifactId>
        <version>2.10.1</version>
    </dependency>
</dependencies>
```

Copy `CreoleCentricAPI.java` into your project at `src/main/java/com/creolecentric/api/`.

### Gradle

Add to your `build.gradle`:

```gradle
dependencies {
    implementation 'com.google.code.gson:gson:2.10.1'
}
```

Copy `CreoleCentricAPI.java` into your project at `src/main/java/com/creolecentric/api/`.

## Quick Start

### Running the Example

#### With Maven:
```bash
cd java
export CREOLECENTRIC_API_KEY='cc_your_key_here'
mvn clean compile exec:java
```

#### With Gradle:
```bash
cd java
export CREOLECENTRIC_API_KEY='cc_your_key_here'
gradle run
```

#### As a standalone JAR:
```bash
# Build with Maven
mvn clean package
java -jar target/creolecentric-api-1.0.0-jar-with-dependencies.jar

# Or with Gradle
gradle jar
java -jar build/libs/creolecentric-api-1.0.0.jar
```

## Usage Examples

### Basic Usage

```java
import com.creolecentric.api.CreoleCentricAPI;
import com.creolecentric.api.CreoleCentricAPI.*;

public class Example {
    public static void main(String[] args) throws Exception {
        // Initialize client
        CreoleCentricAPI client = new CreoleCentricAPI("cc_your_api_key_here");

        // Check health
        HealthCheckResponse health = client.checkHealth();
        System.out.println("API Version: " + health.version);

        // Get credit balance
        CreditBalanceResponse balance = client.getCreditBalance();
        System.out.println("Available Credits: " + balance.availableCredits);

        // Create TTS job
        TTSJob job = client.createTTSJob(
            "Bonjou! Sa se yon egzanp.",
            "i4mRPwKM2yHwXhbmkN514",  // Xavier Bruneau
            "ccl_ht_v100"
        );

        // Wait for completion
        JobStatusResponse status = client.waitForJob(job.id);

        if ("completed".equals(status.status) || "delivered".equals(status.status)) {
            System.out.println("Audio URL: " + status.audioUrl);
        }
    }
}
```

### Spring Boot Integration

```java
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.creolecentric.api.CreoleCentricAPI;

@Service
public class TTSService {
    private final CreoleCentricAPI client;

    public TTSService(@Value("${creolecentric.api.key}") String apiKey) {
        this.client = new CreoleCentricAPI(apiKey);
    }

    public String generateSpeech(String text, String voiceId) throws Exception {
        TTSJob job = client.createTTSJob(text, voiceId, "ccl_ht_v100");
        JobStatusResponse status = client.waitForJob(job.id, 60, 2);

        if ("completed".equals(status.status) || "delivered".equals(status.status)) {
            return status.audioUrl;
        }

        throw new RuntimeException("TTS job failed: " + status.error);
    }
}
```

Add to `application.properties`:
```properties
creolecentric.api.key=${CREOLECENTRIC_API_KEY}
```

### Android Integration

```java
import android.os.AsyncTask;
import com.creolecentric.api.CreoleCentricAPI;

public class TTSActivity extends AppCompatActivity {
    private CreoleCentricAPI client;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        client = new CreoleCentricAPI("cc_your_api_key_here");
    }

    private void generateSpeech(String text) {
        new AsyncTask<String, Void, String>() {
            @Override
            protected String doInBackground(String... params) {
                try {
                    TTSJob job = client.createTTSJob(
                        params[0],
                        "i4mRPwKM2yHwXhbmkN514",
                        "ccl_ht_v100"
                    );

                    JobStatusResponse status = client.waitForJob(job.id);
                    return status.audioUrl;

                } catch (Exception e) {
                    e.printStackTrace();
                    return null;
                }
            }

            @Override
            protected void onPostExecute(String audioUrl) {
                if (audioUrl != null) {
                    playAudio(audioUrl);
                } else {
                    showError("Failed to generate speech");
                }
            }
        }.execute(text);
    }

    private void playAudio(String url) {
        // Use MediaPlayer or ExoPlayer to play the audio
    }
}
```

**Note:** For Android API 30+, consider using Kotlin coroutines instead of AsyncTask.

### Kotlin Integration

```kotlin
import com.creolecentric.api.CreoleCentricAPI
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class TTSRepository(private val apiKey: String) {
    private val client = CreoleCentricAPI(apiKey)

    suspend fun generateSpeech(text: String, voiceId: String): String? {
        return withContext(Dispatchers.IO) {
            try {
                val job = client.createTTSJob(text, voiceId, "ccl_ht_v100")
                val status = client.waitForJob(job.id)

                if (status.status == "completed" || status.status == "delivered") {
                    status.audioUrl
                } else {
                    null
                }
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }
    }
}

// Usage in ViewModel
class TTSViewModel : ViewModel() {
    private val repository = TTSRepository("cc_your_api_key_here")

    fun generateSpeech(text: String) {
        viewModelScope.launch {
            val audioUrl = repository.generateSpeech(text, "i4mRPwKM2yHwXhbmkN514")
            audioUrl?.let { playAudio(it) }
        }
    }
}
```

## API Reference

### Initialization

```java
// Basic initialization
CreoleCentricAPI client = new CreoleCentricAPI("cc_your_api_key_here");

// With custom base URL
CreoleCentricAPI client = new CreoleCentricAPI(
    "cc_your_api_key_here",
    "https://creolecentric.com/api/v1"
);
```

### Health Check

```java
HealthCheckResponse health = client.checkHealth();
System.out.println("Status: " + health.status);
System.out.println("Version: " + health.version);
```

### Credit Balance

```java
CreditBalanceResponse balance = client.getCreditBalance();
System.out.println("Available: " + balance.availableCredits);
System.out.println("Used: " + balance.usedCredits);
System.out.println("Total: " + balance.totalCredits);
```

### List Voices

```java
VoicesResponse voicesResponse = client.getVoices();
List<Voice> voices = voicesResponse.voices;

for (Voice voice : voices) {
    System.out.println(voice.name + " (" + voice.voiceId + ")");
    System.out.println("Region: " + voice.region + ", Gender: " + voice.gender);
}
```

### List Models

```java
ModelsResponse modelsResponse = client.getModels();
for (Model model : modelsResponse.models) {
    System.out.println(model.name + " (" + model.id + ")");
}
```

### Create TTS Job

```java
// Basic usage
TTSJob job = client.createTTSJob(
    "Your text here",
    "i4mRPwKM2yHwXhbmkN514",  // Voice ID
    "ccl_ht_v100"             // Model ID
);

// With custom parameters
TTSJob job = client.createTTSJob(
    "Your text here",
    "i4mRPwKM2yHwXhbmkN514",
    "ccl_ht_v100",
    1.0,    // speed (0.5 to 2.0)
    0.5,    // stability (0.0 to 1.0)
    0.75    // similarityBoost (0.0 to 1.0)
);
```

### Wait for Job Completion

```java
// Default timeout (300s) and poll interval (2s)
JobStatusResponse status = client.waitForJob(jobId);

// Custom timeout and poll interval
JobStatusResponse status = client.waitForJob(
    jobId,
    60,  // timeout in seconds
    2    // poll interval in seconds
);

if ("completed".equals(status.status) || "delivered".equals(status.status)) {
    System.out.println("Audio URL: " + status.audioUrl);
} else if ("failed".equals(status.status)) {
    System.out.println("Error: " + status.error);
}
```

### Get Recent Jobs

```java
// Get last 10 jobs (default)
RecentJobsResponse recentJobs = client.getRecentJobs();

// Get specific number of jobs
RecentJobsResponse recentJobs = client.getRecentJobs(20);

for (JobStatusResponse job : recentJobs.jobs) {
    System.out.println("Job " + job.id + ": " + job.status);
}
```

## Error Handling

```java
import java.io.IOException;

try {
    TTSJob job = client.createTTSJob(text, voiceId, modelId);
    JobStatusResponse status = client.waitForJob(job.id);

} catch (IOException e) {
    if (e.getMessage().contains("HTTP 401")) {
        System.err.println("Invalid API key");
    } else if (e.getMessage().contains("HTTP 402")) {
        System.err.println("Insufficient credits");
    } else if (e.getMessage().contains("HTTP 429")) {
        System.err.println("Rate limit exceeded");
    } else {
        System.err.println("API error: " + e.getMessage());
    }
} catch (InterruptedException e) {
    System.err.println("Request interrupted");
    Thread.currentThread().interrupt();
}
```

## Common Use Cases

### Concurrent Job Processing

```java
import java.util.concurrent.*;
import java.util.List;
import java.util.ArrayList;

ExecutorService executor = Executors.newFixedThreadPool(5);
List<Future<JobStatusResponse>> futures = new ArrayList<>();

List<String> texts = List.of("Text 1", "Text 2", "Text 3");

for (String text : texts) {
    Future<JobStatusResponse> future = executor.submit(() -> {
        TTSJob job = client.createTTSJob(text, voiceId, modelId);
        return client.waitForJob(job.id);
    });
    futures.add(future);
}

for (Future<JobStatusResponse> future : futures) {
    JobStatusResponse status = future.get();
    System.out.println("Job " + status.id + " completed: " + status.audioUrl);
}

executor.shutdown();
```

### Retry Logic

```java
public JobStatusResponse createJobWithRetry(String text, String voiceId, String modelId, int maxRetries) {
    int retries = 0;

    while (retries < maxRetries) {
        try {
            TTSJob job = client.createTTSJob(text, voiceId, modelId);
            return client.waitForJob(job.id);

        } catch (IOException e) {
            retries++;
            if (retries >= maxRetries) {
                throw new RuntimeException("Failed after " + maxRetries + " retries", e);
            }

            try {
                Thread.sleep(1000 * retries); // Exponential backoff
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrupted during retry", ie);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted", e);
        }
    }

    throw new RuntimeException("Unreachable");
}
```

## Best Practices

1. **Store API Key Securely**
   - Use environment variables or secure configuration
   - Never commit keys to version control
   - Use Spring Boot's `@Value` or similar dependency injection

2. **Handle Errors Gracefully**
   - Check HTTP status codes
   - Implement retry logic for transient errors
   - Log errors for debugging

3. **Monitor Credits**
   - Check balance before large operations
   - Alert when credits are low
   - Cache credit balance with reasonable TTL

4. **Use Connection Pooling**
   - The HttpClient is thread-safe and reusable
   - Create one client instance per application
   - Don't create new clients for each request

5. **Implement Timeouts**
   - Set appropriate timeouts for your use case
   - Consider network latency and TTS processing time
   - Use async processing for long-running jobs

## Thread Safety

The `CreoleCentricAPI` class is thread-safe. You can safely share a single instance across multiple threads:

```java
// Application-wide singleton
public class TTSClientFactory {
    private static final CreoleCentricAPI INSTANCE =
        new CreoleCentricAPI(System.getenv("CREOLECENTRIC_API_KEY"));

    public static CreoleCentricAPI getInstance() {
        return INSTANCE;
    }
}
```

## Support

- Documentation: https://creolecentric.com/docs
- GitHub: https://github.com/Creole-Centric/api-examples
- Email: support@creolecentric.com

## License

MIT License - See LICENSE file for details
