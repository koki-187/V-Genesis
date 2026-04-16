#!/bin/bash
set -euo pipefail

cd "$CLAUDE_PROJECT_DIR"

# 変更の有無をチェック
if [ -z "$(git status --porcelain)" ]; then
  exit 0
fi

# 変更を要約して Claude に伝える（stdout は transcript に載る）
changed_files="$(git status --porcelain | wc -l | tr -d ' ')"
current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"

cat <<EOF
[session-stop] 未コミットの変更が ${changed_files} 件あります (branch: ${current_branch})。
以下を実行してリモートに反映してください:
  git add .
  git commit -m "<変更内容>"
  git push -u origin "${current_branch}"
EOF

exit 0
