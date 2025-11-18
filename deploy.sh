#!/bin/bash

# Her OS - GitHub Deployment Helper

echo "=========================================="
echo "🚀 Her OS: GitHub Launch Assistant"
echo "=========================================="

# 1. Ensure we are in the project directory
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"
echo "📂 Working in: $PROJECT_DIR"

# 2. Check Git Status
if [ ! -d ".git" ]; then
    echo "❌ Error: Git is not initialized here. Running init..."
    git init
    git add .
    git commit -m "Initial commit"
fi

# 3. Get Repository URL
echo ""
echo "Please create a NEW repository on GitHub (https://github.com/new)"
echo "and paste the HTTPS URL here (e.g., https://github.com/yourname/her-os.git):"
read -p "👉 Repository URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Error: No URL provided. Aborting."
    exit 1
fi

# 4. Configure Remote
echo ""
echo "🔗 Configuring remote origin..."
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"

# 5. Push
echo "⬆️ Pushing code to GitHub..."
echo "   (You may be asked for your GitHub username and password/token)"
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Your project is live."
else
    echo ""
    echo "❌ Push failed. Please check your credentials or URL."
fi
