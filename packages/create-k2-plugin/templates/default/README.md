<h1>📦 kintone プラグインテンプレート</h1>

<p align="left">
 <a href= "https://github.com/prettier/prettier"><img alt="code style: prettier" src="https://img.shields.io/badge/code%20style-prettier-orange?style=flat-square"></a>
<a href="#license"><img src="https://img.shields.io/github/license/local-bias/kintone-plugin-template?style=flat-square"></a>
</p>

TypeScript + React + Tailwindcss で kintone プラグインを作成するひな形です。

[ホームページ](https://ribbit.konomi.app)

プラグインの設定パターンを複数用意することを想定して作成しています。

例えば「フィールドを指定して非表示にする」というプラグインであれば、指定するフィールドを複数設定することを想定しています。

## 🔧 使い方

1. 各種ライブラリをインストールします

```
npm install
```

2. プラグインの秘密キーを作成と、SSL 証明書の作成を行います

```
npm run init
```

3. 各種設定を行います(詳細は後述)

4. プラグインを作成し、ご利用の Kintone へアップロード + ファイルの変更を監視

```
npm run dev
```

5. リリース用 zip ファイルの生成

```
npm run build
```

## 📁 プラグインの設定

- plugin.config.mjs

  - プラグインの名前や説明文などはここで修正します。本番環境と開発環境で内容を動的に切り替え、manifest.json がビルド時に生成されます。

- .env

  - プラグインをアップロードする kintone の URL を設定します。.env.sample を参考にご利用の環境に合わせて作成してください。
