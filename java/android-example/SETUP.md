# Android Example Setup Instructions

## Quick Start

1. **Copy the secrets template**:
   ```bash
   cp app/src/main/res/values/secrets.xml.example app/src/main/res/values/secrets.xml
   ```

2. **Edit `secrets.xml` with your API key**:
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <resources>
       <string name="creolecentric_api_key">cc_your_actual_api_key_here</string>
       <string name="creolecentric_api_url">https://creolecentric.com/api/v1</string>
   </resources>
   ```

3. **Open in Android Studio**:
   - Launch Android Studio
   - File → Open → Select this directory
   - Wait for Gradle sync to complete

4. **Run the app**:
   - Connect an Android device or start an emulator
   - Click Run (▶️) or press Shift+F10

## Gradle Wrapper

If you need to generate the Gradle wrapper:

```bash
gradle wrapper --gradle-version 8.0
```

Or use an existing Android Studio installation to generate it.

## Manual Build (if needed)

```bash
# Install Gradle wrapper (if not present)
gradle wrapper

# Build debug APK
./gradlew assembleDebug

# Install on connected device
./gradlew installDebug
```

## Troubleshooting

**Error: "Cannot resolve symbol 'R'"**
- Solution: Build → Clean Project, then Build → Rebuild Project

**Error: "secrets.xml not found"**
- Solution: Copy secrets.xml.example to secrets.xml and add your API key

**Error: "SDK location not found"**
- Solution: Create `local.properties` with: `sdk.dir=/path/to/Android/sdk`
