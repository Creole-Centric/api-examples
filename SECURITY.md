# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: security@creolecentric.com

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

- Type of issue (e.g., API key exposure, authentication bypass, etc.)
- Full paths of source file(s) related to the issue
- Location of affected code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue

## Preferred Languages

We prefer all communications to be in English, but we also accept French and Haitian Creole.

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release patches as soon as possible

## API Key Security

Remember:
- **Never commit API keys to version control**
- Always use environment variables for API keys
- Rotate API keys regularly
- Use different keys for development and production
- Immediately revoke compromised keys

## Best Practices for Users

1. Keep your API keys secure and private
2. Use HTTPS for all API communications
3. Implement proper error handling
4. Don't log sensitive information
5. Regularly update to the latest version

Thank you for helping keep CreoleCentric and our users safe!