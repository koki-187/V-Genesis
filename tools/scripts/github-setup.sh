#!/bin/bash
# V-Genesis: GitHub接続セットアップスクリプト
# Usage: ./tools/scripts/github-setup.sh <github-username> <repo-name>
# Example: ./tools/scripts/github-setup.sh yourname V-Genesis

GITHUB_USER="${1:?Usage: $0 <github-username> <repo-name>}"
REPO_NAME="${2:-V-Genesis}"
REMOTE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

cd "$(git rev-parse --show-toplevel)" || exit 1

echo "=== V-Genesis GitHub Setup ==="
echo "Remote URL: $REMOTE_URL"
echo ""

# Set remote origin
if git remote get-url origin &>/dev/null; then
  echo "Updating existing remote origin..."
  git remote set-url origin "$REMOTE_URL"
else
  echo "Adding remote origin..."
  git remote add origin "$REMOTE_URL"
fi

echo ""
echo "Remote configured:"
git remote -v

echo ""
echo "Next steps:"
echo "1. Create repo on GitHub: https://github.com/new"
echo "   - Name: $REPO_NAME"
echo "   - Visibility: Private (recommended for video production)"
echo "   - Do NOT initialize with README (we already have one)"
echo ""
echo "2. Push to GitHub:"
echo "   git push -u origin master"
echo ""
echo "3. (Optional) Set up GitHub Actions for CI:"
echo "   mkdir -p .github/workflows"
