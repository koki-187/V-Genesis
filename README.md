# V-Genesis 動画創成システム

AIエージェント（34体）を活用した汎用動画制作自動化パイプライン。

## 対応動画タイプ
- YouTube解説動画（長尺: 10-30分）
- YouTube解説動画（短尺: 1-3分）
- ショート動画 / Reels（15-60秒）
- プロモーション動画

## 制作パイプライン
```
Research → Script → Visual → Production → QA → Publish → Monitor
```

## 使い方
1. `projects/` 配下に新プロジェクトを作成
2. `brief.yaml` に動画の概要を記入
3. エージェントパイプラインを実行

## デプロイ
- GitHub Pages: `https://koki-187.github.io/V-Genesis/`
- ローカル起動: `node serve.js`（ポート 8765）

## 設定
- `config/pipeline.yaml` - パイプライン定義
- `config/video-types.yaml` - 動画タイプ設定
- `config/platforms.yaml` - プラットフォーム仕様

## エージェント構成
34エージェントの詳細は [AGENTS.md](AGENTS.md) を参照。
