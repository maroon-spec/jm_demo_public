# AccessNavigator Demo

Unity Catalog のデータを GUI から探索・クエリできる Databricks Apps デモアプリです。
ログインユーザーの権限（OBO: On-Behalf-Of）でカタログにアクセスするため、行レベルセキュリティも含めた **実際のアクセス制御** をデモできます。

## 概要

```
Frontend (React + TypeScript)
        ↕ REST API
Backend (FastAPI + Python)
        ↕ Databricks SQL Connector
Unity Catalog / SQL Warehouse
```

## 主な機能

| 画面 | 説明 |
|------|------|
| データ探索 | カタログ → スキーマ → テーブルをツリー形式で閲覧。カラム一覧・プレビュー表示 |
| クエリビルダー | GUI でフィルタ・ソート・ORDER BY を設定してクエリを実行。Unlimited チェックで件数制限なし取得も可能 |
| テンプレート | よく使うクエリ設定を保存・再利用。Use ボタンでクエリビルダーに設定を丸ごと復元 |
| アドホック検索 | SQL を直接記述して実行。Unlimited チェックで件数制限なし取得も可能 |
| OBO (Databricks Apps - On-Behalf-Of User Authorization) | Preview設定でOBOを有効化 |

## アクセス制御 (OBO)

`app.yaml` で `permissions: - user: [sql]` を設定すると、Databricks Apps プロキシがユーザーの OAuth トークンを `X-Forwarded-Access-Token` ヘッダーで転送します。
バックエンドはそのトークンを SQL Warehouse への接続に使うため、**ログインユーザーが参照権限を持つテーブルのみ表示・クエリ可能** になります。

ヘッダーが存在しない場合はサービスプリンシパル (SP) のトークンにフォールバックします。

## ディレクトリ構成

```
AccessNavigator_demo/
├── app.py                  # FastAPI エントリポイント
├── app.yaml                # Databricks Apps 設定
├── server/
│   ├── auth.py             # OBO トークン取得ヘルパー
│   ├── config.py           # 環境変数・設定
│   ├── sql_client.py       # SQL Warehouse 接続・実行
│   └── routes/
│       ├── catalog.py      # Unity Catalog ブラウズ API
│       ├── query.py        # クエリビルド・実行 API
│       └── templates.py    # テンプレート CRUD API
└── frontend/
    ├── src/
    │   ├── App.tsx          # ナビゲーション・レイアウト
    │   ├── api.ts           # API クライアント
    │   ├── pages/           # 各画面コンポーネント
    │   └── stores/          # 状態管理
    └── dist/                # ビルド済み静的ファイル
```

## Requirements

### Databricks ワークスペース側

| 要件 | 詳細 |
|------|------|
| Databricks Apps が有効 | ワークスペースで Apps 機能が有効になっていること |
| Unity Catalog が有効 | メタストアがアタッチされていること |
| SQL Warehouse | Serverless または Pro の SQL Warehouse が 1 台以上稼働していること |
| ユーザー権限 | アプリを利用するユーザーが対象カタログ/スキーマ/テーブルへの `SELECT` 権限を持つこと |

### ローカル環境（デプロイ作業用）

| ツール | バージョン目安 |
|--------|--------------|
| Python | 3.11 以上 |
| Node.js | 18 以上 |
| Databricks CLI | v0.200 以上（`databricks` コマンド） |

### Python パッケージ (`requirements.txt`)

```
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
databricks-sdk>=0.81.0
databricks-sql-connector>=3.0.0
pydantic>=2.0.0
python-multipart>=0.0.9
openai>=1.52.0
requests>=2.31.0
```

> Databricks Apps のランタイムが `requirements.txt` を自動インストールします。ローカルで手動インストールする場合は `pip install -r requirements.txt`。

---

## デプロイ手順

### 事前準備

#### 1. Databricks CLI の認証設定　（未設定の場合) 

```bash
databricks configure
# Host, Token を入力してデフォルトプロファイルを設定
```

#### 2. OBOを有効化 (ベータ版のため、Preview設定画面で有効化する必要があります） 

Preview設定画面で Databricks Apps - On-Behalf-Of User Authorization を有効化


### ステップ 1: フロントエンドのビルド

```bash
cd frontend
npm install
npm run build
cd ..
```

ビルド成果物が `frontend/dist/` に生成されます。これもデプロイ対象に含まれます。

### ステップ 2: Databricks Apps へデプロイ

```bash
databricks apps deploy access-navigator --source-code-path .
```

初回はアプリが存在しない場合、事前に作成が必要です。

```bash
# アプリを新規作成してからデプロイ
databricks apps create access-navigator
databricks apps deploy access-navigator --source-code-path .
```

### ステップ 3: SQL Warehouse へのアクセス権限付与

OBO（On-Behalf-Of）が有効な場合、SQL Warehouse への接続はログインユーザーのトークンで行われるため、**アプリの SP への権限付与は不要**です。ユーザー自身が対象 Warehouse の `Can use` 権限を持っていれば動作します。

OBO が無効な場合（Preview 設定が未有効化など）は SP トークンにフォールバックするため、以下の手順でアプリの SP に権限を付与してください。

1. ワークスペースの **SQL Warehouses** を開く
2. 対象の Warehouse → **Permissions** タブを開く
3. アプリ名（`access-navigator`）を検索して追加し、`Can use` を付与する

### ステップ 4: アプリの起動確認

```bash
# デプロイ状態を確認
databricks apps get access-navigator
```

Databricks ワークスペースの **Compute → Apps** メニューからアプリを選択し、表示された URL にブラウザでアクセスします。

### ステップ 5: ユーザー権限の確認

OBO（ユーザーの権限でクエリ実行）が有効になっているか確認するには、アプリにログイン後ヘッダー右上のバッジを確認します。

| バッジ | 状態 |
|--------|------|
| `OBO: User Permission` (緑) | ログインユーザーの権限でクエリ実行中 |
| `SP Permission` (黄) | サービスプリンシパルの権限でクエリ実行中 |

`app.yaml` の `permissions` セクションに `- user: [sql]` が設定されている場合、OBO が有効になります（デフォルトで設定済み）。

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/me` | ログインユーザー情報・OBO 状態確認 |
| GET | `/api/catalogs` | カタログ一覧 |
| GET | `/api/catalogs/{catalog}/schemas` | スキーマ一覧 |
| GET | `/api/catalogs/{catalog}/schemas/{schema}/tables` | テーブル一覧 |
| GET | `/api/catalogs/{catalog}/schemas/{schema}/tables/{table}/columns` | カラム一覧 |
| GET | `/api/catalogs/{catalog}/schemas/{schema}/tables/{table}/preview` | テーブルプレビュー |
| POST | `/api/query/build` | GUI クエリのビルド＆実行 |
| POST | `/api/query/raw` | 生 SQL 実行 |
| POST | `/api/query/preview-sql` | SQL プレビュー（実行なし） |
| GET | `/api/templates` | テンプレート一覧 |
| POST | `/api/templates` | テンプレート保存 |
| DELETE | `/api/templates/{id}` | テンプレート削除 |
