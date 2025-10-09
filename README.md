# CreoleCentric TTS API Examples

This repository contains example client code for the CreoleCentric Text-to-Speech API in multiple programming languages.

## Available Examples

- ✅ **Embeddable Widget** - Drop-in JavaScript widget for websites (zero dependencies)
- ✅ **Python** - Complete example using `requests` library
- ✅ **JavaScript (Node.js)** - Complete example using `axios`
- ✅ **TypeScript** - Fully typed example with interfaces
- ✅ **Go** - Idiomatic Go implementation
- ✅ **Swift/SwiftUI** - Native iOS/macOS implementation with async/await, SwiftUI & UIKit examples
- ✅ **Java** - Java 11+ implementation with Maven/Gradle support, Spring Boot & Android examples
- ✅ **C#/.NET** - .NET 6.0+ implementation with ASP.NET Core, Blazor, MAUI & Xamarin examples

## Quick Start

### Embeddable Widget
Want to add TTS to your website? Just copy and paste:

```html
<!-- Add this div where you want the widget -->
<div id="creolecentric-tts"
     data-cc-widget
     data-api-key="cc_your_key_here"></div>

<!-- Include the widget script -->
<script src="javascript/embeddable-widget/creolecentric-widget.js"></script>
```

See [javascript/embeddable-widget/README.md](javascript/embeddable-widget/README.md) for full documentation and [demo.html](javascript/embeddable-widget/demo.html) for a live demo.

### Python
```bash
cd python
pip install -r requirements.txt
export CREOLECENTRIC_API_KEY='cc_your_key_here'
python creolecentric_api.py
```

### Node.js
```bash
cd javascript/nodejs-example
npm install
export CREOLECENTRIC_API_KEY='cc_your_key_here'
node creolecentric-api.js
```

### TypeScript
```bash
cd typescript
npm install
export CREOLECENTRIC_API_KEY='cc_your_key_here'
npm start
```

### Go
```bash
cd go
go mod download
export CREOLECENTRIC_API_KEY='cc_your_key_here'
go run creolecentric_api.go
```

### Swift/SwiftUI
```bash
cd swift
export CREOLECENTRIC_API_KEY='cc_your_key_here'
swift run
# See swift/README.md for SwiftUI and UIKit integration examples
```

### Java
```bash
cd java
export CREOLECENTRIC_API_KEY='cc_your_key_here'
# With Maven
mvn clean compile exec:java
# Or with Gradle
gradle run
```

### C#/.NET
```bash
cd csharp
export CREOLECENTRIC_API_KEY='cc_your_key_here'  # Linux/macOS
# OR
set CREOLECENTRIC_API_KEY=cc_your_key_here       # Windows CMD
dotnet run
```

## Getting Your API Key

1. Log in to [creolecentric.com](https://creolecentric.com)
2. Navigate to Account Settings → API Keys
3. Click "Create New API Key"
4. Copy your key (starts with `cc_`)

## Common Features

All examples demonstrate:

- ✅ Health check
- ✅ Credit balance retrieval
- ✅ Listing available voices
- ✅ Listing available models
- ✅ Creating TTS jobs
- ✅ Webhook integration for real-time job updates (recommended)
- ✅ Listing recent jobs

**Note**: While some examples include polling as a fallback mechanism, webhooks are the recommended method for receiving job status updates in production applications.

## API Documentation

For full API documentation, visit: [https://creolecentric.com/docs](https://creolecentric.com/docs)

## Support

- **API Examples Issues**: [Report bugs or issues with these code examples](https://github.com/Creole-Centric/api-examples/issues)
- **General Support**: For API questions, platform issues, or general help, email support@creolecentric.com
- **Documentation**: https://creolecentric.com/docs

## License

MIT License - See LICENSE file for details
