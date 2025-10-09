# CreoleCentric TTS Embeddable Widget

A lightweight, self-contained JavaScript widget that adds Haitian Creole text-to-speech capabilities to any website.

## Features

- ⚡ **Zero Dependencies** - Single JavaScript file, no frameworks required
- 💾 **Smart Caching** - Audio automatically cached in browser for 7 days
- 🎨 **Customizable** - Light/dark themes and configurable options
- 📱 **Mobile Ready** - Responsive design works on all devices
- 🔄 **Auto-Invalidation** - Cache clears when text is modified
- 🎯 **Easy Integration** - Just 2 lines of code to get started

## Quick Start

### 1. Add the Widget Container

```html
<div id="creolecentric-tts"
     data-cc-widget
     data-api-key="cc_your_api_key_here"></div>
```

### 2. Include the Widget Script

```html
<script src="creolecentric-widget.js"></script>
```

That's it! The widget will automatically initialize and be ready to use.

## Getting Your API Key

1. Sign up at [creolecentric.com](https://creolecentric.com/signup)
2. Navigate to **Account Settings → API Keys**
3. Click **"Create New API Key"**
4. Copy your key (starts with `cc_`)
5. Use it in the `data-api-key` attribute

## Configuration Options

Customize the widget using data attributes:

| Option | Data Attribute | Default | Description |
|--------|----------------|---------|-------------|
| API Key | `data-api-key` | (required) | Your CreoleCentric API key |
| Voice ID | `data-voice-id` | `i4mRPwKM2yHwXhbmkN514` | Voice to use for synthesis |
| Model ID | `data-model-id` | `ccl_ht_v100` | TTS model version |
| Theme | `data-theme` | `light` | Widget theme: `light` or `dark` |

### Example: Dark Theme Widget

```html
<div id="my-tts"
     data-cc-widget
     data-api-key="cc_your_key"
     data-theme="dark"
     data-voice-id="your_voice_id"></div>

<script src="creolecentric-widget.js"></script>
```

## Advanced: JavaScript Initialization

For more control, initialize the widget programmatically:

```html
<div id="my-custom-widget"></div>

<script src="creolecentric-widget.js"></script>
<script>
  CreoleCentricWidget.init({
    containerId: 'my-custom-widget',
    apiKey: 'cc_your_api_key_here',
    voiceId: 'i4mRPwKM2yHwXhbmkN514',
    modelId: 'ccl_ht_v100',
    theme: 'light',
    placeholder: 'Ekri tèks ou an kreyòl Ayisyen...'
  });
</script>
```

## How It Works

1. **Text Input** - User enters Haitian Creole text
2. **Generate** - Click "Generate & Play" button
3. **API Call** - Widget submits TTS job to CreoleCentric API
4. **Polling** - Automatically polls for job completion
5. **Download** - Audio file downloaded and cached locally
6. **Playback** - Audio plays automatically with built-in controls

### Caching Behavior

- Audio is cached in browser's `localStorage` for 7 days
- Cache key is generated from text content hash
- Modifying text automatically clears cached audio
- Same text plays instantly from cache without API call

## Files

- **creolecentric-widget.js** - Main widget JavaScript (production-ready)
- **demo.html** - Complete demonstration page with examples
- **README.md** - This documentation file

## Demo

Open `demo.html` in your browser to see the widget in action with:
- Live examples
- Configuration options
- Light and dark themes
- Complete integration examples

## Browser Support

Works on all modern browsers:

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ iOS Safari
- ✅ Chrome Mobile

**Requirements:**
- JavaScript enabled
- localStorage support
- Fetch API support

## Troubleshooting

### Widget Not Appearing?

- Verify `creolecentric-widget.js` file path is correct
- Check container div has unique `id` attribute
- Open browser console (F12) for JavaScript errors

### "API key is required" Error?

- Ensure `data-api-key` attribute is set
- Verify API key starts with `cc_`
- Check API key is valid and not expired

### Audio Not Playing?

- Check browser console for network errors
- Verify sufficient API credits in your account
- Try clearing localStorage: `localStorage.clear()` in console
- Ensure popup blockers aren't interfering

## Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Haitian Creole TTS</title>
</head>
<body>
  <h1>Text-to-Speech Demo</h1>

  <!-- TTS Widget -->
  <div id="creolecentric-tts"
       data-cc-widget
       data-api-key="cc_your_api_key_here"></div>

  <!-- Widget Script -->
  <script src="creolecentric-widget.js"></script>
</body>
</html>
```

## API Documentation

For complete API documentation, visit: [https://creolecentric.com/docs](https://creolecentric.com/docs)

## Support

- **Issues with Widget**: [Report on GitHub](https://github.com/Creole-Centric/api-examples/issues)
- **API Support**: support@creolecentric.com
- **Documentation**: https://creolecentric.com/docs

## License

MIT License - See LICENSE file for details
