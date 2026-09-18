# k2 - 🍳 kintone kitchen 🍳

kintone SDK for Node.js

## 🥦 Installation

```bash
pnpm add -D @konomi-app/k2
```

## 🥚 Requirements

- Node.js 18.17 以上

SSL証明書は [node-forge](https://github.com/digitalbazaar/forge) を使用して自動生成されるため、`mkcert` などの外部ツールのインストールは不要です。
初回実行時にルートCA証明書をOSの信頼ストアへ登録するため、管理者権限を求められる場合があります。

### Tailwind CSS (任意)

Tailwind CSSを使用する場合のみ、以下をインストールしてください。

```bash
pnpm add -D tailwindcss @tailwindcss/postcss
```

## 🥕 Usage (kintone Customization)

### 1. Generate a certificate

```bash
npx k2 genkey
```

`.k2` ディレクトリにローカル開発用のSSL証明書を生成します。

### 2. Local Development

```bash
npx k2 dev
```

設定ファイルで指定したポート番号でローカルサーバーが起動します。kintoneアプリのカスタマイズにローカルサーバーのURLを指定することで、ローカル環境で開発できます。

### 3. Build

```bash
npx k2 build
```

`src/apps/*/index.{ts,tsx,js,jsx,mjs}` をエントリーポイントとして `.k2/prod` にビルドします。

### Configuration

プロジェクトルートの `k2.config.mjs` で設定します。

```js
// k2.config.mjs
export default {
  version: 1,
  server: {
    port: 32767,
  },
  tailwind: {
    css: 'src/styles/tailwind.css',
    fileName: 'tailwind.css',
  },
};
```

## 🥬 Usage (kintone Plugin)

### 1. Initialize

```bash
npx plugin init
```

`.plugin` ディレクトリに秘密鍵 (`private.ppk`) とプラグインZIPを生成します。秘密鍵が既に存在する場合は再利用されます。

### 2. Local Development

```bash
npx plugin dev
```

ローカルサーバーが起動し、`src/contents` の変更を検知してプラグインZIPをkintoneへ自動アップロードします。

アップロードには `.env` に以下の環境変数が必要です。

```bash
KINTONE_BASE_URL=https://example.cybozu.com
KINTONE_USERNAME=username
KINTONE_PASSWORD=password
# Basic認証を使用している場合のみ
KINTONE_BASIC_AUTH_USERNAME=
KINTONE_BASIC_AUTH_PASSWORD=
```

### 3. Build & Package

```bash
npx plugin build
npx plugin zip
```

`plugin build` で `src/config` と `src/desktop` を `.plugin/contents` へビルドし、`plugin zip` で署名済みのプラグインZIPを生成します。

### Commands

| Command | Description |
| --- | --- |
| `plugin init` | `private.ppk` とプラグインZIPを生成します |
| `plugin dev` | 開発サーバーを起動し、変更を検知して自動アップロードします |
| `plugin build` | プラグインを本番ビルドします |
| `plugin manifest -e <env>` | `manifest.json` のみを生成します |
| `plugin zip -e <env>` | 署名済みプラグインZIPを生成します |
| `plugin genkey` | ローカル開発用のSSL証明書を生成します |

`-e, --env` には `dev` / `prod` / `standalone` を指定できます (既定値は `prod`)。

### Configuration

プロジェクトルートの `plugin.config.mjs` で設定します。

```js
// plugin.config.mjs
export default {
  id: 'your-plugin-id',
  version: 1,
  manifest: {
    base: {
      /* manifest.json の共通設定 */
    },
    dev: {
      /* 開発環境で base に上書きマージされる設定 */
    },
  },
  server: {
    port: 32767,
  },
  tailwind: {
    // 単一のCSSを共有する場合
    css: 'src/styles/tailwind.css',
    // 設定画面とデスクトップでCSSを分ける場合
    // css: { config: 'src/styles/config.css', desktop: 'src/styles/desktop.css' },
  },
};
```
