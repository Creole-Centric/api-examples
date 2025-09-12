#!/bin/bash

# CreoleCentric API Examples - GitHub Push Script
# This script helps you push the repository to your new GitHub organization

echo "========================================="
echo "CreoleCentric API Examples - GitHub Setup"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "Error: Not in the creolecentric-api-examples directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git branch -m main
fi

# Add all files if not already added
echo "Preparing files for commit..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "No changes to commit. Repository is up to date."
else
    echo "Committing changes..."
    git commit -m "Add GitHub repository configuration files"
fi

echo ""
echo "========================================"
echo "NEXT STEPS:"
echo "========================================"
echo ""
echo "1. Create a GitHub Organization (recommended) or Account:"
echo "   Go to: https://github.com/organizations/new"
echo "   Suggested name: creolecentric or creolecentric-labs"
echo ""
echo "2. Create a new repository:"
echo "   Name: api-examples"
echo "   Visibility: Public"
echo "   DON'T initialize with README"
echo ""
echo "3. After creating the repository, run ONE of these commands:"
echo ""
echo "   For HTTPS (easier):"
echo "   git remote add origin https://github.com/YOUR_ORG/api-examples.git"
echo "   git push -u origin main"
echo ""
echo "   For SSH (more secure):"
echo "   git remote add origin git@github.com:YOUR_ORG/api-examples.git"
echo "   git push -u origin main"
echo ""
echo "   Replace YOUR_ORG with your organization name"
echo ""
echo "4. After pushing, configure the repository:"
echo "   - Add topics: api, tts, haitian-creole, python, nodejs"
echo "   - Add website: https://creolecentric.com"
echo "   - Create first release (v1.0.0)"
echo ""
echo "Full instructions in: GITHUB_SETUP.md"
echo ""

# Show current remote status
echo "Current git remote status:"
if git remote -v | grep -q origin; then
    git remote -v
    echo ""
    echo "⚠️  Warning: Remote 'origin' already exists."
    echo "To change it, run: git remote set-url origin NEW_URL"
else
    echo "No remote configured yet. ✓"
fi

echo ""
echo "Repository is ready to push to GitHub!"