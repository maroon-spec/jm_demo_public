# AutoFeature AI

テーブルを選ぶだけで与信スコアリングの特徴量を自動生成する Databricks Apps デモアプリです。

**LLM（Claude via Foundation Model API）** によるドメイン知識ベースの特徴量提案と、**Featuretools（Deep Feature Synthesis）** による網羅的な特徴量生成を組み合わせ、重要度ランキングで結果を提示します。

## アーキテクチャ

```
Frontend (React + TypeScript)
        ↕ REST API
Backend (FastAPI + Python)
        ↕
Foundation Model API (Claude)  +  Featuretools DFS
        ↕
Unity Catalog / SQL Warehouse
```

## ディレクトリ構成

```
autofeature-ai/
├── main.py              # FastAPI エントリポイント
├── app.yaml             # Databricks Apps 設定
├── requirements.txt     # Python 依存パッケージ
├── server/
│   ├── catalog.py       # Unity Catalog ブラウズ・テーブル取得
│   ├── config.py        # 環境変数・Workspace Client
│   ├── features.py      # Featuretools DFS 実行
│   └── llm.py           # Claude による特徴量提案
├── frontend/
│   ├── src/             # React + TypeScript ソース
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── notebooks/
    └── 01_generate_data.py  # デモ用サンプルデータ生成
```

## Requirements

| 要件 | 詳細 |
|------|------|
| Databricks Apps が有効 | ワークスペースで Apps 機能が有効になっていること |
| Unity Catalog が有効 | メタストアがアタッチされていること |
| Foundation Model API | `databricks-claude-sonnet-4` エンドポイントが利用可能なこと |
| SQL Warehouse | Serverless または Pro の SQL Warehouse が 1 台以上稼働していること |

## デプロイ手順

### 1. サンプルデータ生成

Databricks ワークスペースで `notebooks/01_generate_data.py` を実行し、デモ用テーブルを作成します。

生成されるテーブル（Unity Catalog）:
- `customers` — 顧客台帳
- `transactions` — 取引履歴
- `payments` — 支払履歴
- `credit_applications` — 与信申請結果

### 2. フロントエンドのビルド

```bash
cd frontend
npm install
npm run build
cd ..
```

### 3. アプリのデプロイ

```bash
# 初回のみ: アプリを作成
databricks apps create autofeature-ai

# デプロイ
databricks apps deploy autofeature-ai --source-code-path .
```

### 4. 起動確認

```bash
databricks apps get autofeature-ai
```

ワークスペースの **Compute → Apps** からアプリを選択し、URL にアクセスします。

## 環境変数

`app.yaml` で以下を設定してください：

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `CATALOG` | Unity Catalog のカタログ名 | `classic_stable_nud6b0` |
| `SCHEMA` | スキーマ名 | `credit_scoring` |
