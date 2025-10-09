# CreoleCentric TTS API - Swift Example

Swift example client for the CreoleCentric Text-to-Speech API. Works with both iOS and macOS.

## Features

- ✅ Native Swift with async/await
- ✅ Full type safety with Codable
- ✅ iOS 16+ and macOS 13+ support
- ✅ Proper error handling
- ✅ No external dependencies
- ✅ Works with UIKit and SwiftUI

## Requirements

- Swift 5.9+
- iOS 16.0+ / macOS 13.0+
- Xcode 15.0+

## Installation

### Swift Package Manager

Add to your `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/Creole-Centric/api-examples", from: "1.0.0")
]
```

### CocoaPods

```ruby
pod 'CreoleCentricAPI'
```

### Manual

Copy `CreoleCentricAPI.swift` into your Xcode project.

## Quick Start

### Command Line Usage

```bash
# Set your API key
export CREOLECENTRIC_API_KEY='cc_your_key_here'

# Run the example
swift run
```

### iOS/SwiftUI Integration

```swift
import SwiftUI

struct ContentView: View {
    @State private var audioURL: String?
    @State private var isLoading = false
    @State private var errorMessage: String?

    private let apiKey = "cc_your_api_key_here"

    var body: some View {
        VStack(spacing: 20) {
            Text("CreoleCentric TTS")
                .font(.largeTitle)

            if isLoading {
                ProgressView("Generating speech...")
            }

            if let url = audioURL {
                Text("Audio ready!")
                    .foregroundColor(.green)

                Button("Play Audio") {
                    playAudio(from: url)
                }
                .buttonStyle(.borderedProminent)
            }

            if let error = errorMessage {
                Text(error)
                    .foregroundColor(.red)
            }

            Button("Generate Speech") {
                Task {
                    await generateSpeech()
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(isLoading)
        }
        .padding()
    }

    func generateSpeech() async {
        isLoading = true
        errorMessage = nil
        audioURL = nil

        let client = CreoleCentricAPI(apiKey: apiKey)

        do {
            // Create TTS job
            let job = try await client.createTTSJob(
                text: "Bonjou! Mwen se yon egzanp pou iOS.",
                voiceId: "i4mRPwKM2yHwXhbmkN514",
                modelId: "ccl_ht_v100"
            )

            // Wait for completion
            let status = try await client.waitForJob(jobId: job.id, timeout: 60)

            if let url = status.audioUrl {
                audioURL = url
            }

        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func playAudio(from urlString: String) {
        guard let url = URL(string: urlString) else { return }

        // Use AVPlayer or AVAudioPlayer to play the audio
        // Implementation depends on your needs
    }
}
```

### UIKit Integration

```swift
import UIKit

class TTSViewController: UIViewController {
    private let client: CreoleCentricAPI
    private let activityIndicator = UIActivityIndicatorView(style: .large)

    init(apiKey: String) {
        self.client = CreoleCentricAPI(apiKey: apiKey)
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }

    private func setupUI() {
        view.backgroundColor = .systemBackground

        let button = UIButton(type: .system)
        button.setTitle("Generate Speech", for: .normal)
        button.addTarget(self, action: #selector(generateSpeech), for: .touchUpInside)

        // Layout code...
    }

    @objc private func generateSpeech() {
        activityIndicator.startAnimating()

        Task {
            do {
                let job = try await client.createTTSJob(
                    text: "Bonjou! Mwen se yon egzanp pou iOS.",
                    voiceId: "i4mRPwKM2yHwXhbmkN514",
                    modelId: "ccl_ht_v100"
                )

                let status = try await client.waitForJob(jobId: job.id)

                await MainActor.run {
                    activityIndicator.stopAnimating()
                    if let audioUrl = status.audioUrl {
                        print("Audio ready: \(audioUrl)")
                        // Play or download audio
                    }
                }

            } catch {
                await MainActor.run {
                    activityIndicator.stopAnimating()
                    showError(error.localizedDescription)
                }
            }
        }
    }

    private func showError(_ message: String) {
        let alert = UIAlertController(
            title: "Error",
            message: message,
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}
```

## API Reference

### Initialization

```swift
let client = CreoleCentricAPI(
    apiKey: "cc_your_key_here",
    baseURL: "https://creolecentric.com/api/v1"  // Optional
)
```

### Health Check

```swift
let health = try await client.checkHealth()
print("API Version: \(health.version)")
```

### Get Credit Balance

```swift
let balance = try await client.getCreditBalance()
print("Available credits: \(balance.totalCredits)")
```

### List Voices

```swift
let voicesResponse = try await client.getVoices()
for voice in voicesResponse.voices {
    print("\(voice.name): \(voice.voiceId)")
}
```

### Create TTS Job

```swift
let job = try await client.createTTSJob(
    text: "Your text here",
    voiceId: "i4mRPwKM2yHwXhbmkN514",
    modelId: "ccl_ht_v100",
    speed: 1.0,  // Optional
    stability: 0.5,  // Optional
    similarityBoost: 0.75  // Optional
)
```

### Wait for Job Completion

```swift
let status = try await client.waitForJob(
    jobId: job.id,
    timeout: 60,  // seconds
    pollInterval: 2  // seconds
)

if let audioUrl = status.audioUrl {
    // Download or play audio
}
```

### Express TTS (Quick Generation)

```swift
let audioData = try await client.expressTTS(
    text: "Short text",
    voiceId: "i4mRPwKM2yHwXhbmkN514"
)
// audioData is ready to play immediately
```

## Error Handling

```swift
do {
    let job = try await client.createTTSJob(...)
} catch CreoleCentricError.httpError(let statusCode, let message) {
    print("HTTP \(statusCode): \(message)")
} catch CreoleCentricError.timeout {
    print("Request timed out")
} catch CreoleCentricError.decodingError(let error) {
    print("Failed to decode: \(error)")
} catch {
    print("Error: \(error.localizedDescription)")
}
```

## Common Use Cases

### Background Audio Generation

```swift
Task.detached(priority: .background) {
    let client = CreoleCentricAPI(apiKey: apiKey)
    let job = try await client.createTTSJob(...)
    let status = try await client.waitForJob(jobId: job.id)
    // Handle completion
}
```

### Batch Processing

```swift
let texts = ["Text 1", "Text 2", "Text 3"]

await withTaskGroup(of: TTSJob?.self) { group in
    for text in texts {
        group.addTask {
            try? await client.createTTSJob(
                text: text,
                voiceId: voiceId,
                modelId: modelId
            )
        }
    }

    for await job in group {
        if let job = job {
            print("Job \(job.id) created")
        }
    }
}
```

## Best Practices

1. **Store API Key Securely**
   - Use Keychain for iOS/macOS
   - Never commit keys to version control

2. **Handle Errors Gracefully**
   - Show user-friendly error messages
   - Implement retry logic for network errors

3. **Monitor Credits**
   - Check balance before large operations
   - Alert users when credits are low

4. **Cache Audio**
   - Download and cache generated audio
   - Reduce API calls and costs

## Support

- Documentation: https://creolecentric.com/docs
- GitHub: https://github.com/Creole-Centric/api-examples
- Email: support@creolecentric.com

## License

MIT License - See LICENSE file for details
