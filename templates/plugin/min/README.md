# 📦 kintone プラグインテンプレート (最小構成 / TypeScript)

[@konomi-app/k2](https://www.npmjs.com/package/@konomi-app/k2) を使用した、最小構成の kintone プラグインテンプレートです。

## 🥚 必要環境

- Node.js 18.17 以上

## 🔧 使い方

### 1. パッケージのインストール

```bash
npm install
```

### 2. 初期設定

```bash
npm run init
```

プラグインの秘密鍵 `.plugin/private.ppk` と `.plugin/plugin.zip` を生成します。

> [!IMPORTANT]
> プラグイン ID は `private.ppk` から生成されます。紛失すると別のプラグインとして扱われるため、安全な場所にバックアップしてください (`.plugin/` は `.gitignore` の対象です)。

### 3. 開発

`.env.sample` をコピーして `.env` を作成し、kintone の接続情報を設定してから、開発サーバーを起動します。

```bash
npm run dev
```

- ローカルの開発サーバー (`https://localhost:<plugin.config.mjs の server.port>`) から JavaScript を配信します
- 起動時と `src/contents` の変更時に、プラグインを kintone へ自動でアップロードします
- ローカル開発用の SSL 証明書は初回起動時に自動生成されます

### 4. リリース用 ZIP の生成

```bash
npm run build
```

`.plugin/plugin.zip` が生成されます。

## 📁 ディレクトリ構成

| パス | 説明 |
| --- | --- |
| `src/config/index.ts` | プラグイン設定画面のエントリーポイント |
| `src/desktop/index.ts` | デスクトップ・モバイル画面のエントリーポイント |
| `src/contents/` | `config.html`・`icon.png` など、ZIP に同梱するファイル |
| `plugin.config.mjs` | `manifest.json` などのプラグイン設定 |
