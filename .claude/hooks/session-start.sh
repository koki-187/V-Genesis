#!/bin/bash
set -euo pipefail

# リモート環境 (Claude Code on the web / iOS) のみで実行
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# 現在ブランチの最新を取得（デスクトップ側のコミットを反映）
current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')"

if [ -n "$current_branch" ] && [ "$current_branch" != "HEAD" ]; then
  git fetch origin --prune || true
  # upstream がある場合のみ pull（conflict は避ける: --ff-only）
  if git rev-parse --abbrev-ref --symbolic-full-name "@{u}" >/dev/null 2>&1; then
    git pull --ff-only origin "$current_branch" || \
      echo "[session-start] ff-only pull に失敗しました。リモートと分岐している可能性があります。" >&2
  fi
fi

# package.json があれば依存をインストール
if [ -f package.json ]; then
  if command -v npm >/dev/null 2>&1; then
    npm install --no-audit --no-fund || true
  fi
fi

# Python プロジェクトなら依存をインストール
if [ -f requirements.txt ] && command -v pip >/dev/null 2>&1; then
  pip install -r requirements.txt || true
fi

exit 0
