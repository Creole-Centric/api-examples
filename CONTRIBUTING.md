# Contributing to CreoleCentric API Examples

First off, thank you for considering contributing to CreoleCentric API Examples! 🎉

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, please include:

- API version you're using
- Programming language and version
- Detailed steps to reproduce
- Expected behavior vs actual behavior
- Error messages and stack traces

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- Clear use case description
- Why this enhancement would be useful
- Possible implementation approach

### Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development Setup

### Python
```bash
cd python
pip install -r requirements.txt
export CREOLECENTRIC_API_KEY='cc_your_key_here'
python creolecentric_api.py
# Or test connection
python test_connection.py
```

### Node.js
```bash
cd nodejs
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

### Swift
```bash
cd swift
export CREOLECENTRIC_API_KEY='cc_your_key_here'
swift run
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

## Style Guidelines

### General Principles
- Write clear, readable code
- Include error handling
- Add comments for complex logic
- Follow language-specific best practices
- Ensure examples work with latest API version

### Python
- Follow PEP 8
- Use type hints where appropriate
- Add docstrings to functions
- Use requests library for HTTP calls

### JavaScript/Node.js
- Use ES6+ features
- Follow standard JavaScript style
- Add JSDoc comments
- Use async/await for asynchronous code

### TypeScript
- Follow TypeScript best practices
- Define interfaces for all API responses
- Use proper type annotations
- Enable strict mode

### Go
- Follow Go formatting standards (gofmt)
- Use idiomatic Go patterns
- Add comments for exported functions
- Handle errors explicitly

### Swift
- Follow Swift API Design Guidelines
- Use async/await for asynchronous code
- Implement proper error handling with do-catch
- Use Codable for JSON serialization

### Java
- Follow Java Code Conventions
- Use proper exception handling
- Add Javadoc comments for public methods
- Use modern Java features (11+)

### C#/.NET
- Follow C# Coding Conventions
- Use async/await consistently
- Implement IDisposable where needed
- Use nullable reference types

### Documentation
- Keep README examples up to date
- Update curl examples when adding features
- Use clear, concise language
- Include both basic and advanced usage examples

## Testing

Before submitting:
1. Test all examples work with a valid API key
2. Ensure error handling works correctly
3. Verify documentation is accurate

## Code of Conduct

Please be respectful and constructive in all interactions.

## Questions?

Feel free to open an issue or contact us at dev@creolecentric.com

Thank you for contributing! 🙏