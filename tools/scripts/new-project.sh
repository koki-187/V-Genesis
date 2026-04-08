#!/bin/bash
# V-Genesis: 新プロジェクト作成スクリプト
# Usage: ./tools/scripts/new-project.sh <project-id> <video-type>

PROJECT_ID="${1:-project-$(date +%Y%m%d-%H%M%S)}"
VIDEO_TYPE="${2:-explainer_long}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PROJECT_DIR="$ROOT/projects/$PROJECT_ID"

echo "Creating project: $PROJECT_ID (type: $VIDEO_TYPE)"

mkdir -p "$PROJECT_DIR"/{research,script,visual/thumbnail,audio,edit/captions,publish,review,analytics}

cat > "$PROJECT_DIR/brief.yaml" << EOF
project_id: "$PROJECT_ID"
video_type: "$VIDEO_TYPE"
created_at: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
status: planning

# 必須項目
title: ""
topic: ""
target_audience: ""
key_message: ""
cta: ""

# オプション
keywords: []
reference_videos: []
deadline: ""
EOF

echo "Project created at: $PROJECT_DIR"
echo "Edit brief.yaml to get started."
