# QShare Frontend

QShareは、同じtraQ IDで接続した端末間でメモ・URL・ファイルを共有するアプリケーションです。
このディレクトリには、Rsbuild + Reactで作られた静的SPAのフロントエンドを置いています。

| パス | 内容 |
| --- | --- |
| `/` | メモの共有・閲覧 |
| `/urls/` | URLの共有・閲覧 |
| `/urls/latest/` | 最新URLへ自動リダイレクト |
| `/files/` | ファイルの共有・閲覧 |
| `/devices/` | 接続済み端末の管理 |

## 開発環境の構築

Node.jsとpnpmが必要です。バックエンドも別途 `http://localhost:3000` で起動してください。

```sh
pnpm install
pnpm dev
```

フロントエンドは [http://localhost:3001](http://localhost:3001) で起動します。開発サーバーは
`/api/*` を `http://localhost:3000` のバックエンドへ転送し、その際に先頭の `/api` を取り除きます。
そのため、ブラウザからのAPIリクエストは常に同一オリジンとして扱われます。

```text
ブラウザ (localhost:3001)
  └─ /api/v1/... → Rsbuild開発プロキシ → Backend (localhost:3000/v1/...)
```

### 利用するコマンド

| コマンド | 内容 |
| --- | --- |
| `pnpm dev` | 開発サーバーを起動 |
| `pnpm build` | `dist/` に静的ファイルを生成 |
| `pnpm preview` | ビルド済みの静的ファイルを確認 |
| `pnpm check` | BiomeとTypeScriptの検査 |
| `pnpm format` | Biomeで整形 |

## 開発時の認証

本番ではNeoShowcaseの部員認証が、traQ IDをバックエンドへ渡します。しかしローカル環境には
NeoShowcaseがないため、`pnpm dev` 中だけRsbuildが認証をエミュレートします。

- `/_oauth/login?redirect=...` は、指定されたアプリ内パスへそのままリダイレクトします。
- バックエンドへ転送するAPIリクエストには `X-Forwarded-User: local-dev` を付与します。
- 端末登録・メモ・URL・ファイル共有はすべて `local-dev` のデータとして扱われます。

したがって、ローカルではtraQへの実ログインなしで端末登録まで試せます。このエミュレーションは
開発サーバーだけの設定であり、`pnpm build` の成果物や本番の認証フローには含まれません。

## ビルドとデプロイ

```sh
pnpm build
```

ビルド結果は `dist/` に出力されます。直接アクセスできるよう、ビルド時に以下のHTMLも生成します。

- `dist/devices/index.html`
- `dist/files/index.html`
- `dist/urls/index.html`
- `dist/urls/latest/index.html`

NeoShowcaseではStatic Commandを選択し、Artifact Pathに `dist` を指定してください。本番のルーティングでは
`/api/v1/*` と `/api/healthz` をバックエンドへ、それ以外を静的ファイルへ転送します。
