# QShare frontend

同じtraQ IDの端末間で共有されたURLを閲覧・追加・管理する、QShareのWebフロントエンドです。
Next.jsの静的エクスポートとしてビルドし、APIバックエンドとは同一オリジンで配信します。

`/latest/` を開くと、保存済みの端末トークンで最新の共有URLを取得し、そのURLへ自動的に遷移します。

## ローカル開発

Node.jsとpnpmを使用します。

```sh
pnpm install
pnpm dev
```

開発時は `/api/v1` をQShareバックエンドへ転送できる同一オリジンのプロキシを用意してください。

## ビルド

```sh
pnpm build
```

静的ファイルは `out/` に出力されます。本番環境では `/api/v1/*` と `/api/healthz` をバックエンドへ、
それ以外を `out/` の静的ファイルへルーティングします。

## 品質確認

```sh
pnpm format
pnpm lint
pnpm typecheck
pnpm check
pnpm build
```
