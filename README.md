# QShare frontend

同じtraQ IDの端末間で共有されたURLを閲覧・追加・管理する、QShareのWebフロントエンドです。
RsbuildとReactで構築した静的SPAで、APIバックエンドとは同一オリジンで配信します。

`/` ではメモを管理できます。URL一覧は `/urls/`、最新URLへ遷移するページは `/urls/latest/` です。

## ローカル開発

Node.jsとpnpmを使用します。

```sh
pnpm install
pnpm dev
```

開発サーバーは `http://localhost:3001` で起動し、`/api/*` を `http://localhost:3000` の
QShareバックエンドへ転送します。転送時には `/api` が取り除かれます。

NeoShowcaseがローカルには存在しないため、開発サーバーは `/_oauth/login?redirect=...` を
指定された相対パスへリダイレクトするローカル用のモックとして提供します。さらにAPIプロキシは
`X-Forwarded-User: local-dev` を付与するため、バックエンドでは `local-dev` として端末登録・URL取得を
試せます。この挙動は `pnpm dev` のみで、本番の静的ビルドには含まれません。

## ビルド

```sh
pnpm build
```

静的ファイルは `dist/` に出力されます。`/devices/`、`/urls/`、`/urls/latest/` 用の `index.html` もビルド時に
生成されるため、NeoShowcaseのSPAフォールバック設定に依存せず深いリンクを直接開けます。本番環境では
`/api/v1/*` と `/api/healthz` をバックエンドへ、それ以外を `dist/` の静的ファイルへルーティングします。

NeoShowcaseではStatic Commandを選び、Artifact Pathを `dist`、SPAを有効にしてください。

## 品質確認

```sh
pnpm format
pnpm lint
pnpm typecheck
pnpm check
pnpm build
```
