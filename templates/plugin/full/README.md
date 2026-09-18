# 📦 kintone プラグインテンプレート (フル構成)

[ホームページ](https://ribbit.konomi.app)

[@konomi-app/k2](https://www.npmjs.com/package/@konomi-app/k2) を使用した、React + MUI + Tailwind CSS v4 による kintone プラグインテンプレートです。

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

- ローカルの開発サーバーから JavaScript と CSS を配信し、ファイルの変更を監視します
- 起動時と `src/contents` の変更時に、プラグインを kintone へ自動でアップロードします
- ローカル開発用の SSL 証明書は初回起動時に自動生成されます

### 4. リリース用 ZIP の生成

```bash
# 本番用 (manifest.prod: CDN から配信する場合)
npm run build

# スタンドアロン用 (manifest.standalone: ZIP に JS/CSS を同梱する場合)
npm run standalone
```

### 型チェック

```bash
npm run typecheck
```

## 🎨 Tailwind CSS

Tailwind CSS v4 を使用しています。設定は JavaScript ファイルではなく CSS ファイル内で行います。

| パス | 説明 |
| --- | --- |
| `src/styles/common.css` | 共通のテーマ (`@theme`) とリセット用スタイル |
| `src/styles/config.css` | プラグイン設定画面用 (preflight あり) |
| `src/styles/desktop.css` | デスクトップ画面用 (kintone 本体の表示を崩さないよう preflight なし、ユーティリティに `!important` を付与) |

クラスを検出する対象ディレクトリは各 CSS ファイルの `@source` で指定しています。ディレクトリを追加した場合は `@source` も追加してください。

## 📁 ディレクトリ構成

| パス | 説明 |
| --- | --- |
| `src/config/index.ts` | プラグイン設定画面のエントリーポイント |
| `src/desktop/index.ts` | デスクトップ・モバイル画面のエントリーポイント |
| `src/contents/` | `config.html`・`icon.png` など、ZIP に同梱するファイル |
| `src/schema/plugin-config.ts` | プラグイン設定情報のスキーマ (zod) |
| `plugin.config.mjs` | `manifest.json` などのプラグイン設定 |
