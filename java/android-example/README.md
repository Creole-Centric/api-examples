# CreoleCentric TTS Android Example

This example demonstrates how to integrate the CreoleCentric Text-to-Speech API with an Android application using Java.

## Features

- **Native Android**: Built with Android SDK and Java
- **Material Design**: Modern UI following Material Design guidelines
- **Retrofit HTTP Client**: Type-safe REST client for Android
- **Audio Playback**: MediaPlayer for playing generated speech
- **Background Tasks**: AsyncTask/Coroutines for API calls
- **Error Handling**: Comprehensive error handling and user feedback

## Prerequisites

- Android Studio Arctic Fox (2020.3.1) or higher
- Android SDK API Level 21 (Lollipop) or higher
- JDK 11 or higher
- CreoleCentric API key (get one at https://creolecentric.com)

## Setup

1. **Clone this example**:
   ```bash
   git clone https://github.com/Creole-Centric/api-examples.git
   cd api-examples/java/android-example
   ```

2. **Open in Android Studio**:
   - Launch Android Studio
   - Select "Open an Existing Project"
   - Navigate to the `android-example` directory

3. **Configure API key**:

   Edit `app/src/main/res/values/secrets.xml`:
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <resources>
       <string name="creolecentric_api_key">cc_your_api_key_here</string>
       <string name="creolecentric_api_url">https://creolecentric.com/api/v1</string>
   </resources>
   ```

   **⚠️ Security Note**: For production apps, use the [Secrets Gradle Plugin](https://github.com/google/secrets-gradle-plugin) to keep API keys secure.

4. **Sync Gradle**:
   - Click "Sync Project with Gradle Files" in Android Studio
   - Wait for dependencies to download

5. **Run the app**:
   - Connect an Android device or start an emulator
   - Click "Run" (▶️) in Android Studio

## Project Structure

```
android-example/
├── app/
│   ├── src/main/
│   │   ├── java/com/creolecentric/ttsexample/
│   │   │   ├── MainActivity.java           # Main activity
│   │   │   ├── api/
│   │   │   │   ├── CreoleCentricClient.java # Retrofit API client
│   │   │   │   └── CreoleCentricService.java # Retrofit interface
│   │   │   ├── models/
│   │   │   │   ├── TTSJob.java             # Job model
│   │   │   │   ├── Voice.java              # Voice model
│   │   │   │   └── CreditBalance.java      # Credit model
│   │   │   └── utils/
│   │   │       └── AudioPlayer.java        # Audio playback utility
│   │   ├── res/
│   │   │   ├── layout/
│   │   │   │   └── activity_main.xml       # Main layout
│   │   │   ├── values/
│   │   │   │   ├── strings.xml             # String resources
│   │   │   │   └── secrets.xml             # API key (create this)
│   │   │   └── drawable/                   # Icons and images
│   │   └── AndroidManifest.xml             # App manifest
│   └── build.gradle                        # App build configuration
├── build.gradle                            # Project build configuration
└── README.md                               # This file
```

## Usage

### Basic TTS Job

```java
import com.creolecentric.ttsexample.api.CreoleCentricClient;
import com.creolecentric.ttsexample.models.TTSJob;

// Initialize client
CreoleCentricClient client = new CreoleCentricClient(apiKey, baseUrl);

// Create a TTS job
client.createTTSJob(
    "Bonjou! Kijan ou ye?",
    "i4mRPwKM2yHwXhbmkN514",  // Xavier Bruneau
    "ccl_ht_v100",
    new CreoleCentricClient.Callback<TTSJob>() {
        @Override
        public void onSuccess(TTSJob job) {
            Log.d("TTS", "Job created: " + job.getId());

            // Poll for completion
            pollJobStatus(job.getId());
        }

        @Override
        public void onError(String error) {
            Log.e("TTS", "Error: " + error);
        }
    }
);
```

### Playing Audio

```java
import com.creolecentric.ttsexample.utils.AudioPlayer;

AudioPlayer audioPlayer = new AudioPlayer();

// Play audio from URL
audioPlayer.playFromUrl(job.getAudioUrl(), new AudioPlayer.Callback() {
    @Override
    public void onPrepared() {
        Log.d("Audio", "Playing...");
    }

    @Override
    public void onError(String error) {
        Log.e("Audio", "Playback error: " + error);
    }
});

// Stop playback
audioPlayer.stop();

// Release resources
audioPlayer.release();
```

### Getting Credit Balance

```java
client.getCreditBalance(new CreoleCentricClient.Callback<CreditBalance>() {
    @Override
    public void onSuccess(CreditBalance balance) {
        String text = String.format("Total Credits: %d", balance.getTotalCredits());
        textView.setText(text);
    }

    @Override
    public void onError(String error) {
        Toast.makeText(context, "Error: " + error, Toast.LENGTH_SHORT).show();
    }
});
```

## API Client Features

The `CreoleCentricClient` class includes:

### Retrofit Service Methods
- `getVoices()` - Get available voices
- `getModels()` - Get available TTS models
- `getCreditBalance()` - Get credit balance
- `createTTSJob()` - Create a new TTS job
- `getJobStatus()` - Get job status
- `listJobs()` - List recent jobs

### Callback Interface
All methods use callbacks for async operations:

```java
public interface Callback<T> {
    void onSuccess(T result);
    void onError(String error);
}
```

## Permissions

The app requires the following permissions (already configured in `AndroidManifest.xml`):

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## Dependencies

This example uses:

- **Retrofit 2** - HTTP client
- **OkHttp 4** - HTTP/HTTPS networking
- **Gson** - JSON serialization/deserialization
- **Material Components** - UI components

All dependencies are managed via Gradle.

## Building

### Debug Build

```bash
./gradlew assembleDebug
```

Output: `app/build/outputs/apk/debug/app-debug.apk`

### Release Build

```bash
./gradlew assembleRelease
```

Output: `app/build/outputs/apk/release/app-release.apk`

### Install on Device

```bash
./gradlew installDebug
```

## Testing

### Unit Tests

```bash
./gradlew test
```

### Instrumented Tests

```bash
./gradlew connectedAndroidTest
```

## Proguard Configuration

For release builds with minification enabled, add to `proguard-rules.pro`:

```proguard
# Retrofit
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
-keepattributes Signature
-keepattributes Exceptions

# Gson
-keep class com.google.gson.** { *; }
-keep class com.creolecentric.ttsexample.models.** { *; }

# OkHttp
-dontwarn okhttp3.**
-keep class okhttp3.** { *; }
```

## Security Considerations

- **API Key Storage**: Use Android Keystore or Secrets Gradle Plugin for production
- **HTTPS Only**: All API calls use HTTPS
- **Network Security Config**: Configure network security in `res/xml/network_security_config.xml`
- **Permissions**: Request runtime permissions for Android 6.0+

## Deployment

### Google Play Store

1. Generate signed APK/Bundle
2. Configure app signing in Play Console
3. Upload to Play Console
4. Configure store listing and pricing
5. Submit for review

### Alternative Distribution

- Amazon Appstore
- Samsung Galaxy Store
- Direct APK distribution

## Troubleshooting

### Common Issues

**Issue**: "Unable to resolve dependency"
- **Solution**: Sync project with Gradle files, check internet connection

**Issue**: "Cleartext HTTP traffic not permitted"
- **Solution**: Ensure using HTTPS or update network security config

**Issue**: "API key not found"
- **Solution**: Create `secrets.xml` with your API key

## Learn More

- [CreoleCentric API Documentation](https://creolecentric.com/developer)
- [Android Developer Guides](https://developer.android.com/guide)
- [Retrofit Documentation](https://square.github.io/retrofit/)
- [Material Design for Android](https://material.io/develop/android)

## Support

For questions or issues:
- Email: support@creolecentric.com
- GitHub: https://github.com/Creole-Centric/api-examples/issues

## License

MIT
