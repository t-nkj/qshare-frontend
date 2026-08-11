# QShare frontend

同じtraQ IDの端末間で共有されたURLを閲覧・追加・管理する、QShareのWebフロントエンドです。
Next.jsの静的エクスポートとしてビルドし、APIバックエンドとは同一オリジンで配信します。

## ローカル開発

Node.jsとpnpmを使用します。

```sh
pnpm install
pnpm dev
```

開発時は `/v1` をQShareバックエンドへ転送できる同一オリジンのプロキシを用意してください。

## ビルド

```sh
pnpm build
```

静的ファイルは `out/` に出力されます。本番環境では `/v1/*` と `/healthz` をバックエンドへ、
それ以外を `out/` の静的ファイルへルーティングします。

## 品質確認

```sh
pnpm format
pnpm lint
pnpm typecheck
pnpm check
pnpm build
```
