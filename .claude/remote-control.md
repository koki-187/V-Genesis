# V-Genesis Claude Remote Control

## 概要
Claude CLIのRemote Control機能を使って、V-Genesisパイプラインをリモートから制御します。

## セットアップ

### 1. Remote Controlセッションの起動
```bash
claude --remote-control-session-name-prefix "v-genesis" \
       --permission-mode auto \
       --add-dir "H:\マイドライブ\★★★プライベート用★★★\V-Genesis"
```

### 2. 非インタラクティブ実行（パイプライン自動化）
```bash
# 新プロジェクト開始
claude -p "V-Genesisで新しい解説動画プロジェクトを開始。トピック: [TOPIC]" \
       --add-dir "H:\マイドライブ\★★★プライベート用★★★\V-Genesis" \
       --permission-mode auto

# 脚本生成
claude -p "projects/[PROJECT_ID]/brief.yamlに基づいて脚本を生成してください" \
       --add-dir "H:\マイドライブ\★★★プライベート用★★★\V-Genesis" \
       --permission-mode auto

# 品質チェック
claude -p "projects/[PROJECT_ID]の品質ゲートを実行してください" \
       --add-dir "H:\マイドライブ\★★★プライベート用★★★\V-Genesis" \
       --permission-mode auto
```

### 3. スケジュール実行（Windowsタスクスケジューラ）
```xml
<!-- 毎日9:00に新プロジェクトキューを処理 -->
<!-- C:\Windows\System32\schtasks.exe で設定 -->
schtasks /create /tn "V-Genesis Daily Pipeline" \
         /tr "claude -p 'V-Genesisの保留中プロジェクトを処理' --permission-mode auto" \
         /sc daily /st 09:00
```

## エージェント指定実行
```bash
# 特定エージェントを指定
claude --agent writer -p "脚本テンプレートを使って台本を作成"
claude --agent designer -p "サムネイルデザインを提案"
claude --agent qa-tester -p "品質ゲートを実行"
```

## OMCスキル実行
```bash
# autopilot モードで全パイプライン実行
claude -p "autopilot: V-Genesisで[TOPIC]の動画を作成" --permission-mode auto
```
