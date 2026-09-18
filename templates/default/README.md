# 🍳 kintone カスタマイズテンプレート

[@konomi-app/k2](https://www.npmjs.com/package/@konomi-app/k2) を使用した、kintone アプリの JavaScript カスタマイズ用テンプレートです。

## 🥚 必要環境

- Node.js 18.17 以上

## 🔧 使い方

### 1. パッケージのインストール

```bash
npm install
```

### 2. 開発

```bash
npm run dev
```

ローカルの開発サーバー (`https://localhost:<k2.config.mjs の server.port>`) が起動します。
kintone アプリの「JavaScript / CSS でカスタマイズ」に、以下の形式の URL を登録してください。

```
https://localhost:55728/app-1.js
```

ローカル開発用の SSL 証明書は初回起動時に自動生成されます (`npm run init` で明示的に再生成することもできます)。

### 3. ビルド

```bash
npm run build
```

`.k2/prod` にアプリごとの JavaScript (`app-1.js` など) が出力されます。

## 📁 ディレクトリ構成

| パス | 説明 |
| --- | --- |
| `src/apps/<アプリ名>/index.ts` | アプリごとのエントリーポイント。`<アプリ名>.js` として出力されます |
| `src/lib/` | 複数のアプリで共有するコード |
| `k2.config.mjs` | 開発サーバーのポート番号・Tailwind CSS などの設定 |
