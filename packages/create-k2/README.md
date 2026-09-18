# create-k2

[@konomi-app/k2](https://www.npmjs.com/package/@konomi-app/k2) を使用した kintone カスタマイズ・プラグインのプロジェクトを、テンプレートから作成します。

## Usage

```bash
# 対話モード
npm create k2@latest
pnpm create k2

# 引数で指定
npm create k2@latest my-plugin -- --template plugin-min
pnpm create k2 my-plugin --template plugin-full
```

- 空でない既存ディレクトリには作成できません
- 対話モードが使えない環境 (CI など) では、プロジェクト名と `--template` の両方を指定してください

## Templates

| name | 説明 |
| --- | --- |
| `app` | kintone カスタマイズ (TypeScript) |
| `plugin-min` | プラグインの最小構成 (TypeScript) |
| `plugin-js` | プラグインの最小構成 (JavaScript) |
| `plugin-full` | React + MUI + Tailwind CSS によるプラグイン |
| `plugin-turbo` | Turborepo 用のプラグイン (`@repo/*` のワークスペースパッケージが必要です) |

## Requirements

- Node.js 20.12 以上
