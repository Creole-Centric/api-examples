# GitHub Setup Instructions for CreoleCentric API Examples

## 🏢 Setting Up Business GitHub Account

### Step 1: Create GitHub Organization (Recommended)
Instead of a personal account, create an organization for better business management:

1. Go to [github.com/organizations/new](https://github.com/organizations/new)
2. Choose the **Free** plan
3. Organization name: `creolecentric` or `creolecentric-labs`
4. Contact email: `dev@creolecentric.com`
5. This organization belongs to: "A business or institution"

### Step 2: Configure Organization Profile
1. Add organization display name: "CreoleCentric"
2. Add description: "Haitian Creole Text-to-Speech Platform"
3. Add website: `https://creolecentric.com`
4. Add location: Your business location
5. Add profile picture: CreoleCentric logo

### Step 3: Create Repository
1. Click "Create repository" or go to [github.com/new](https://github.com/new)
2. Repository name: `api-examples`
3. Description: "Official API client examples for CreoleCentric TTS Platform - Python, Node.js, and cURL"
4. Set as **Public** (so developers can access it)
5. **DON'T** initialize with README (we already have one)
6. Click "Create repository"

## 🚀 Pushing Code to GitHub

### From Your Server

```bash
# Navigate to the project
cd /home/ubuntu/creolecentric-api-examples

# Add the remote (replace YOUR_ORG with your organization name)
git remote add origin https://github.com/YOUR_ORG/api-examples.git

# Push the code
git push -u origin main
```

### If Using SSH (More Secure)

First, add SSH key to GitHub:

```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "dev@creolecentric.com"

# Display the public key
cat ~/.ssh/id_ed25519.pub
```

Add this key to GitHub:
1. Go to GitHub Settings → SSH and GPG keys
2. Click "New SSH key"
3. Paste your public key

Then push using SSH:

```bash
cd /home/ubuntu/creolecentric-api-examples
git remote add origin git@github.com:YOUR_ORG/api-examples.git
git push -u origin main
```

## 📝 Repository Settings

### Essential Settings to Configure

1. **Default Branch Protection** (Settings → Branches)
   - Add rule for `main` branch
   - Enable "Require pull request before merging" (if team grows)

2. **API Documentation** (Settings → Pages)
   - Source: Deploy from branch
   - Branch: main
   - Folder: /docs

3. **Topics** (Add from main repo page)
   - `api`
   - `text-to-speech`
   - `tts`
   - `haitian-creole`
   - `creole`
   - `python`
   - `nodejs`
   - `api-client`

4. **About Section** (Gear icon on main page)
   - Website: `https://creolecentric.com/docs/api`
   - Topics: As listed above
   - Include: Releases, Packages

## 🏷️ Create First Release

After pushing the code:

1. Go to Releases → Create new release
2. Tag version: `v1.0.0`
3. Release title: "Initial Release - API Client Examples"
4. Description:
   ```markdown
   ## 🎉 Initial Release of CreoleCentric API Examples
   
   This release includes:
   - ✅ Python client library with full examples
   - ✅ Node.js client library with full examples
   - ✅ Comprehensive cURL documentation
   - ✅ Connection test utility
   - ✅ Complete API documentation
   
   ## Getting Started
   See the [README](README.md) for installation and usage instructions.
   
   ## API Access
   Sign up at [creolecentric.com](https://creolecentric.com) to get your API key.
   ```
5. Click "Publish release"

## 🔗 Recommended Repository Structure

```
YOUR_ORG/
├── api-examples          # This repository (public)
├── creolecentric-core    # Main application (private)
├── creolecentric-docs    # Documentation site (public)
└── creolecentric-infer   # TTS inference service (private)
```

## 🛡️ Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Add security policy**: Create `SECURITY.md`
3. **Enable Dependabot** for security updates
4. **Use GitHub Secrets** for CI/CD

## 📊 GitHub Organization Benefits

- **Team Management**: Add developers with specific permissions
- **Project Boards**: Track development progress
- **GitHub Actions**: Free CI/CD for public repos
- **GitHub Pages**: Host documentation
- **Package Registry**: Publish npm/pip packages

## 🤝 Community Engagement

1. **Enable Issues** for bug reports and questions
2. **Enable Discussions** for community support
3. **Add Contributing Guidelines**: `CONTRIBUTING.md`
4. **Add Code of Conduct**: `CODE_OF_CONDUCT.md`
5. **Create issue templates** for bugs and features

## 📈 Analytics and Insights

- Use GitHub Insights to track:
  - Clone statistics
  - Visitor analytics
  - Popular content
  - Community growth

## 🔄 Keeping Repository Active

1. **Regular Updates**: Update examples with new features
2. **Respond to Issues**: Aim for < 48 hour response time
3. **Accept Contributions**: Review and merge community PRs
4. **Version Releases**: Tag releases for major updates

## 📢 Promoting the Repository

1. **Add to CreoleCentric website**: Link from docs/developer section
2. **Include in API documentation**: Reference in getting started guides
3. **Add to email signatures**: "Check out our API examples on GitHub"
4. **Share on social media**: Announce the repository launch
5. **Include in onboarding**: Send link to new API users

## 📝 Additional Files to Consider Adding

Create these files to enhance the repository:

### `CONTRIBUTING.md`
Guidelines for community contributions

### `CODE_OF_CONDUCT.md`
Community standards and behavior expectations

### `SECURITY.md`
How to report security vulnerabilities

### `.github/ISSUE_TEMPLATE/`
Templates for bug reports and feature requests

### `.github/PULL_REQUEST_TEMPLATE.md`
Template for pull requests

## 🚦 Next Steps

1. Create GitHub organization
2. Push code to repository
3. Configure repository settings
4. Create first release
5. Add repository link to CreoleCentric website
6. Announce to existing API users

## 📧 Support

For questions about this repository setup:
- Email: dev@creolecentric.com
- Documentation: https://creolecentric.com/docs