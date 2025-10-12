# CreoleCentric TTS SwiftUI Example

This example demonstrates how to integrate the CreoleCentric Text-to-Speech API with a SwiftUI iOS/macOS application using Swift.

## Features

- **Type-Safe API Integration**: Swift client with strong typing and Codable
- **SwiftUI Interface**: Modern declarative UI for TTS job creation
- **Audio Playback**: AVFoundation integration for playing generated speech
- **Async/Await**: Modern Swift concurrency for API calls
- **Error Handling**: Comprehensive error handling with Result types

## Prerequisites

- Xcode 15.0 or higher
- iOS 17.0+ / macOS 14.0+ target
- Swift 5.9 or higher
- CreoleCentric API key (get one at https://creolecentric.com)

## Setup

1. **Clone this example**:
   ```bash
   git clone https://github.com/Creole-Centric/api-examples.git
   cd api-examples/swift/swiftui-example
   ```

2. **Open in Xcode**:
   ```bash
   open CreoleCentricExample.xcodeproj
   ```

3. **Configure API credentials**:

   Edit `CreoleCentricClient.swift` and update the API key:
   ```swift
   private let apiKey = "cc_your_api_key_here"
   ```

   Or use environment variables in the scheme settings:
   - Product → Scheme → Edit Scheme
   - Run → Arguments → Environment Variables
   - Add: `CREOLECENTRIC_API_KEY` = `cc_your_api_key_here`

4. **Build and run**:
   - Select your target device/simulator
   - Press ⌘R to build and run

## Project Structure

```
swiftui-example/
├── Models/
│   ├── TTSJob.swift                  # Job model
│   ├── TTSJobRequest.swift           # Request model
│   └── Voice.swift                   # Voice model
├── Services/
│   └── CreoleCentricClient.swift    # API client
├── Views/
│   ├── ContentView.swift            # Main TTS interface
│   └── JobStatusView.swift          # Job status display
├── CreoleCentricExampleApp.swift   # App entry point
└── README.md                        # This file
```

## Usage

### Basic TTS Job

```swift
import Foundation

let client = CreoleCentricClient()

// Create a TTS job
let request = TTSJobRequest(
    text: "Bonjou! Kijan ou ye?",
    voiceId: "i4mRPwKM2yHwXhbmkN514",
    modelId: "ccl_ht_v100"
)

Task {
    do {
        let job = try await client.createTTSJob(request: request)
        print("Job created: \(job.id)")

        // Wait for completion
        let completedJob = try await client.waitForJob(jobId: job.id)

        if let audioUrl = completedJob.audioUrl {
            print("Audio ready: \(audioUrl)")
            // Play audio using AVFoundation
        }
    } catch {
        print("Error: \(error)")
    }
}
```

### SwiftUI Integration

The included `ContentView.swift` provides a complete UI for:
- Text input for Haitian Creole text
- Voice and model selection
- Speed and pitch adjustment
- Job status display
- Audio playback

## API Client Features

The Swift API client (`CreoleCentricClient.swift`) includes:

- **Async/Await**: Modern Swift concurrency for all API calls
- **Codable Models**: Type-safe JSON encoding/decoding
- **Error Handling**: Custom error types with detailed messages
- **Job Polling**: Built-in `waitForJob()` method with configurable timeout
- **URLSession**: Native networking without third-party dependencies

## Development

### Building the Project

```bash
xcodebuild -project CreoleCentricExample.xcodeproj \
           -scheme CreoleCentricExample \
           -destination 'platform=iOS Simulator,name=iPhone 15' \
           build
```

### Running Tests

```bash
xcodebuild test -project CreoleCentricExample.xcodeproj \
                -scheme CreoleCentricExample \
                -destination 'platform=iOS Simulator,name=iPhone 15'
```

## Deployment

### iOS App Store

1. Archive the app: Product → Archive
2. Distribute via App Store Connect
3. Submit for review

### TestFlight Beta

1. Archive the app
2. Upload to App Store Connect
3. Enable TestFlight
4. Add internal/external testers

### Enterprise Distribution

1. Configure enterprise provisioning profile
2. Archive with enterprise certificate
3. Distribute IPA to enterprise users

## Configuration

### API Configuration

```swift
struct CreoleCentricConfig {
    static let apiKey = ProcessInfo.processInfo.environment["CREOLECENTRIC_API_KEY"]
                        ?? "cc_your_api_key_here"
    static let apiUrl = "https://api.creolecentric.com/v1"
}
```

### Info.plist Settings

Add if using audio playback:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to play generated audio</string>
```

## Security Considerations

- **Never commit API keys**: Use environment variables or secure storage
- **Keychain Storage**: Store API keys in iOS Keychain for production
- **App Transport Security**: HTTPS required for API calls
- **Code obfuscation**: Consider obfuscating API keys in release builds

## Platform Support

- **iOS**: 17.0+
- **macOS**: 14.0+ (with minor UI adjustments)
- **iPadOS**: Fully supported with adaptive UI
- **watchOS**: Not currently supported (limited by API requirements)

## Learn More

- [CreoleCentric API Documentation](https://creolecentric.com/developer)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [Swift Documentation](https://docs.swift.org)

## Support

For questions or issues:
- Email: support@creolecentric.com
- GitHub: https://github.com/Creole-Centric/api-examples/issues

## License

MIT
