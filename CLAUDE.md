# V-Genesis プロジェクト指示書

このファイルは Claude Code（Desktop / Web / iOS）がリポジトリを開いた際に自動で読み込まれます。デスクトップとリモート（Web/iOS）のどちらからでも同じルールで作業できるようにしています。

---

## リモート開発ルール (Desktop / Web / iOS共通)

### 基本原則

1. **作業開始時**: 必ず `git pull origin master` で最新コードを取得
2. **作業完了時**: 必ず `git add . && git commit && git push origin master` で変更をプッシュ
3. **コンフリクト防止**: 同一ファイルをデスクトップとリモートで同時編集しない

### 環境別の制約

| 操作 | Desktop | Web/iOS |
|------|---------|---------|
| コード編集 | OK | OK |
| git push/pull | OK | OK |
| wrangler deploy | OK | **NG** (CLIなし) |
| D1マイグレーション | OK | **NG** |
| npm install | OK | 要確認 |

### ブランチ戦略

- **master**: 本番デプロイ用。安定コードのみ。
- **remote/\***: リモート版での作業用ブランチ（例: `remote/feature-xxx`）
- リモート版での大きな変更は `remote/` ブランチで作業し、デスクトップ版で master にマージ & デプロイ

### デプロイフロー

```
[リモート版] コード変更 → git push (remote/ブランチ)
    ↓
[デスクトップ版] git pull → レビュー → master にマージ → wrangler deploy
```

### 禁止事項

- リモート版から `wrangler.toml` のリソースIDを変更しない
- `.env` や認証情報をコミットしない
- `node_modules/` をコミットしない
- master ブランチへの force push 禁止

---

## 自動同期フック

このリポジトリには以下のフックが `.claude/settings.json` に設定されています:

- **SessionStart**: セッション開始時に `git fetch` と現在ブランチの pull を自動実行（リモート環境のみ）。`.claude/hooks/session-start.sh` で定義。
- **Stop**: 作業完了時、未コミットの変更があれば状態を要約して表示し、Claude にコミット & プッシュを促します。`.claude/hooks/session-stop.sh` で定義。

手動で同期したい場合は次のコマンドを使ってください:

```bash
# 最新取得
git pull origin "$(git branch --show-current)"

# 変更をプッシュ
git add .
git commit -m "<変更内容>"
git push origin "$(git branch --show-current)"
```

## 作業完了時のルール (Claude 向け)

構築や改善などの作業が完了したら、**必ず以下を実行**してください:

1. `git status` で変更を確認
2. 秘密情報（`.env`, 認証トークン等）が含まれていないか確認
3. 適切なコミットメッセージで `git commit`
4. `git push -u origin <現在のブランチ>` でリモートへ反映
5. まだ PR がなければドラフト PR を作成
