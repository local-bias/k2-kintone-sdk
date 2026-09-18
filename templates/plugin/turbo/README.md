# 📦 kintone プラグインテンプレート (Turborepo 用)

[ホームページ](https://ribbit.konomi.app)

Turborepo のモノレポ内 (`apps/` など) に配置して使用する kintone プラグインテンプレートです。

> [!WARNING]
> このテンプレートは、同じワークスペースに以下のパッケージが存在することを前提としています。単体では `npm install` できません。
>
> `@repo/constants` / `@repo/jotai` / `@repo/tailwind-config` / `@repo/tailwindcss` / `@repo/typescript-config` / `@repo/ui` / `@repo/utils`

## 🔧 使い方

### 1. パッケージのインストール

モノレポのルートで実行します。

```bash
pnpm install
```

### 2. 初期設定

```bash
pnpm run init
```

プラグインの秘密鍵 `.plugin/private.ppk` と `.plugin/plugin.zip` を生成します。プラグイン ID は `private.ppk` から生成されるため、安全な場所にバックアップしてください。

### 3. 開発

`.env.sample` をコピーして `.env` を作成し、kintone の接続情報を設定してから、開発サーバーを起動します。

```bash
pnpm dev
```

JavaScript と Tailwind CSS (`src/styles/*.css`) のビルド・監視は k2 が行います。

### 4. リリース用 ZIP の生成

```bash
# 本番用 (manifest.prod)
pnpm build

# スタンドアロン用 (manifest.standalone)
pnpm standalone
```
