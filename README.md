# V-Genesis — AI動画制作システム v5

> AIエージェントを活用した動画制作自動化パイプライン。YouTube・Instagram・TikTok対応。

## 今すぐ使う（ブラウザのみ・無料）

**→ https://koki-187.github.io/V-Genesis/**

ブラウザだけで以下が使えます（サーバー不要）：
- 台本・ナレーション・SEOテキストの自動生成（プリセット）
- 6つのブランドテンプレート（SMP・不動産・美容・飲食・教育・EC）
- FFmpegコマンドの自動生成
- カスタムブランド設定

---

## フル機能で使う（Node.jsサーバー起動）

### 必要なもの
- Node.js 18以上
- FFmpeg（動画変換）
- Claude APIキー（AI生成）※オプション

### セットアップ

```bash
# 1. リポジトリをクローン
git clone https://github.com/koki-187/V-Genesis.git
cd V-Genesis

# 2. 環境設定ファイルを作成
cp .env.example .env
# .env を開いてClaude APIキーを設定

# 3. サーバー起動
node serve.js
# → http://localhost:8765 でアクセス
```

### .env 設定例
```
CLAUDE_API_KEY=sk-ant-api03-...
PORT=8765
IOPAINT_PATH=C:\Users\YourName\Downloads\IOPaint\IOPaint.exe
VOICEVOX_PATH=C:\Users\YourName\AppData\Local\Programs\VOICEVOX\VOICEVOX.exe
```

### フル機能一覧
| 機能 | ブラウザのみ | サーバー起動時 |
|---|---|---|
| プリセット台本生成 | ✅ | ✅ |
| Claude AI台本生成 | ❌ | ✅ |
| AI画像生成 | ❌ | ✅ |
| FFmpeg自動実行 | ❌ | ✅ |
| VOICEVOX音声合成 | ❌ | ✅ |
| IOPaint背景除去 | ❌ | ✅ |

---

## 7ステップパイプライン

| ステップ | 内容 |
|---|---|
| STEP 1 | ブランド・用途・テーマ設定 |
| STEP 2 | AI台本・SEOテキスト生成 |
| STEP 3 | 動画プロンプト生成・素材準備 |
| STEP 4 | ナレーション・BGM設定 |
| STEP 5 | 編集・FFmpegコマンド生成 |
| STEP 6 | 書き出し・プラットフォーム別出力 |

---

## 対応ブランド

- スカルプインク（SMP）
- 不動産エージェント
- 美容サロン
- 飲食店・カフェ
- 教育・スクール
- ECショップ
- カスタム（自由入力）

---

## 技術スタック

- **フロントエンド**: 単一HTML SPA（約5000行）、バンドラー不使用
- **バックエンド**: Node.js（serve.js）、外部npmパッケージなし
- **AI**: Claude API（Anthropic）、Pollinations.ai（画像・無料）
- **音声**: VOICEVOX（無料）、Web Speech API（ブラウザ内蔵）
- **動画**: FFmpeg、IOPaint（AI背景除去）
- **デプロイ**: GitHub Pages（静的）+ ローカルNode.jsサーバー

---

## ディレクトリ構成

```
V-Genesis/
├── index.html          # メインアプリ（= video-pipeline-v4.html）
├── video-pipeline-v4.html  # ソース
├── serve.js            # Node.jsサーバー
├── .env.example        # 環境変数テンプレート
├── manifest.json       # PWA設定
├── sw.js               # Service Worker
├── assets/             # アイコン・音楽・素材
└── CLAUDE.md           # AI開発ガイド
```

---

## セキュリティ

- APIキーは `.env` ファイルで管理（リポジトリにコミットしない）
- `/api/exec` はFFmpegコマンドのみ許可（ホワイトリスト方式）
- CORS設定はlocalhost・GitHub Pagesのみ許可

---

## ライセンス

Private / 個人利用・許可された利用者のみ
