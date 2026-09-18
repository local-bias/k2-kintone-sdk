#!/usr/bin/env node
// @ts-check

import * as p from '@clack/prompts';
import { downloadTemplate } from 'giget';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { parseArgs, styleText } from 'node:util';

/** テンプレートを格納しているリポジトリ (giget の source 形式) */
const REPOSITORY = 'gh:local-bias/k2-kintone-sdk';
const REPOSITORY_REF = 'main';

const DEFAULT_PROJECT_NAME = 'k2-app';
const SUPPORTED_PACKAGE_MANAGERS = /** @type {const} */ (['npm', 'pnpm', 'yarn', 'bun']);

/**
 * @typedef {{ label: string; hint?: string; path: string; isPlugin: boolean }} Template
 */

/** @satisfies {Record<string, Template>} */
const TEMPLATES = {
  app: {
    label: 'kintone カスタマイズ',
    hint: 'TypeScript',
    path: 'templates/default',
    isPlugin: false,
  },
  'plugin-min': {
    label: 'プラグイン (最小構成)',
    hint: 'TypeScript',
    path: 'templates/plugin/min',
    isPlugin: true,
  },
  'plugin-js': {
    label: 'プラグイン (最小構成)',
    hint: 'JavaScript',
    path: 'templates/plugin/js',
    isPlugin: true,
  },
  'plugin-full': {
    label: 'プラグイン (フル構成)',
    hint: 'React + MUI + Tailwind CSS',
    path: 'templates/plugin/full',
    isPlugin: true,
  },
  'plugin-turbo': {
    label: 'プラグイン (Turborepo 用)',
    hint: '@repo/* のワークスペースパッケージが必要です',
    path: 'templates/plugin/turbo',
    isPlugin: true,
  },
};

/** @typedef {keyof typeof TEMPLATES} TemplateKey */

const HELP_MESSAGE = `
Usage: create-k2 [project-name] [options]

Options:
  -t, --template <name>  テンプレート名 (${Object.keys(TEMPLATES).join(', ')})
  -h, --help             ヘルプを表示
  -v, --version          バージョンを表示

Examples:
  npm create k2@latest
  npm create k2@latest my-plugin -- --template plugin-min
  pnpm create k2 my-plugin --template plugin-full
`;

/**
 * @param {string} value
 * @returns {value is TemplateKey}
 */
function isTemplateKey(value) {
  return Object.hasOwn(TEMPLATES, value);
}

/**
 * プロジェクト名 (作成するディレクトリ名) を検証します
 *
 * @param {string | undefined} name
 * @returns {string | undefined} 不正な場合はエラーメッセージ
 */
function validateProjectName(name) {
  const trimmed = name?.trim() ?? '';
  if (!trimmed) {
    return 'プロジェクト名を入力してください';
  }
  if (trimmed === '.' || trimmed === '..' || /[\\/]/.test(trimmed)) {
    return 'プロジェクト名にパス区切り文字や "." / ".." は使用できません';
  }
  if (/[<>:"|?*]/.test(trimmed) || [...trimmed].some((char) => char.charCodeAt(0) < 32)) {
    return 'プロジェクト名にファイル名として使用できない文字が含まれています';
  }
  return undefined;
}

/**
 * ディレクトリ名から package.json の name として使用できる文字列を生成します
 *
 * @param {string} projectName
 * @returns {string}
 */
function toPackageName(projectName) {
  const normalized = projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._~-]+/g, '-')
    .replace(/^[._-]+|-+$/g, '');
  return normalized || DEFAULT_PROJECT_NAME;
}

/**
 * `npm create` / `pnpm create` などの実行元からパッケージマネージャーを推定します
 *
 * @returns {(typeof SUPPORTED_PACKAGE_MANAGERS)[number]}
 */
function detectPackageManager() {
  const name = process.env.npm_config_user_agent?.split(' ')[0]?.split('/')[0];
  return SUPPORTED_PACKAGE_MANAGERS.find((pm) => pm === name) ?? 'npm';
}

/**
 * @param {string} dir
 * @returns {Promise<'missing' | 'empty' | 'not-empty'>}
 */
async function getDirectoryState(dir) {
  try {
    const entries = await fs.readdir(dir);
    return entries.length === 0 ? 'empty' : 'not-empty';
  } catch (error) {
    if (/** @type {NodeJS.ErrnoException} */ (error).code === 'ENOENT') {
      return 'missing';
    }
    throw error;
  }
}

/**
 * 取得したテンプレートの package.json の name をプロジェクト名に置き換えます
 *
 * @param {string} dir
 * @param {string} packageName
 */
async function renamePackage(dir, packageName) {
  const packageJsonPath = path.join(dir, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
  const updated = { ...packageJson, name: packageName };
  await fs.writeFile(packageJsonPath, `${JSON.stringify(updated, null, 2)}\n`);
}

/**
 * プロンプトのキャンセル時に終了します
 *
 * @template T
 * @param {T | symbol} value
 * @returns {T}
 */
function exitIfCancelled(value) {
  if (p.isCancel(value)) {
    p.cancel('キャンセルしました');
    process.exit(0);
  }
  return value;
}

/**
 * @returns {Promise<string>}
 */
async function promptProjectName() {
  const value = await p.text({
    message: 'プロジェクト (フォルダ) 名を入力してください',
    placeholder: DEFAULT_PROJECT_NAME,
    defaultValue: DEFAULT_PROJECT_NAME,
    validate: (input) => (input ? validateProjectName(input) : undefined),
  });
  return exitIfCancelled(value);
}

/**
 * @returns {Promise<TemplateKey>}
 */
async function promptTemplate() {
  const value = await p.select({
    message: 'テンプレートを選択してください',
    options: Object.entries(TEMPLATES).map(([key, template]) => ({
      value: /** @type {TemplateKey} */ (key),
      label: template.label,
      hint: template.hint,
    })),
  });
  return exitIfCancelled(value);
}

/**
 * @param {string} message
 * @returns {never}
 */
function fail(message) {
  p.log.error(message);
  p.outro(styleText('red', 'プロジェクトを作成できませんでした'));
  process.exit(1);
}

function parseCliArgs() {
  try {
    return parseArgs({
      allowPositionals: true,
      options: {
        template: { type: 'string', short: 't' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'v' },
      },
    });
  } catch (error) {
    console.error(styleText('red', error instanceof Error ? error.message : String(error)));
    console.log(HELP_MESSAGE);
    process.exit(1);
  }
}

async function main() {
  const { values, positionals } = parseCliArgs();

  if (values.help) {
    console.log(HELP_MESSAGE);
    return;
  }
  if (values.version) {
    const { version } = createRequire(import.meta.url)('./package.json');
    console.log(version);
    return;
  }

  p.intro(styleText(['bgYellow', 'black'], ' 🍳 create-k2 '));

  const isInteractive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  const [nameArg] = positionals;

  if (!isInteractive && (!nameArg || !values.template)) {
    fail('対話モードを利用できない環境では、プロジェクト名と --template を指定してください');
  }

  const projectName = (nameArg ?? (await promptProjectName())).trim();
  const nameError = validateProjectName(projectName);
  if (nameError) {
    fail(nameError);
  }

  const templateKey = values.template ?? (await promptTemplate());
  if (!isTemplateKey(templateKey)) {
    fail(
      `不明なテンプレートです: "${templateKey}"\n使用できるテンプレート: ${Object.keys(TEMPLATES).join(', ')}`
    );
  }
  const template = TEMPLATES[templateKey];

  const targetDir = path.resolve(process.cwd(), projectName);
  const directoryState = await getDirectoryState(targetDir);
  if (directoryState === 'not-empty') {
    fail(`ディレクトリ "${projectName}" は既に存在し、空ではありません`);
  }

  const spinner = p.spinner();
  spinner.start(`テンプレート (${templateKey}) を取得しています`);

  try {
    await downloadTemplate(`${REPOSITORY}/${template.path}#${REPOSITORY_REF}`, {
      dir: targetDir,
      // 空のディレクトリは上で許可済みのため、展開先の存在チェックをスキップします
      force: directoryState === 'empty',
    });
    await renamePackage(targetDir, toPackageName(path.basename(projectName)));
    spinner.stop('テンプレートを取得しました');
  } catch (error) {
    spinner.stop('テンプレートの取得に失敗しました');
    // 途中まで展開されたファイルが残らないよう、このコマンドで作成したディレクトリのみ削除します
    if (directoryState === 'missing') {
      await fs.rm(targetDir, { recursive: true, force: true });
    }
    fail(error instanceof Error ? error.message : String(error));
  }

  const pm = detectPackageManager();
  const nextSteps = [
    `cd ${/\s/.test(projectName) ? `"${projectName}"` : projectName}`,
    `${pm} install`,
    ...(template.isPlugin ? [`${pm} run init`] : []),
    `${pm} run dev`,
  ];
  p.note(nextSteps.join('\n'), '次のステップ');

  if (template.isPlugin) {
    p.log.info(
      '開発サーバーからkintoneへアップロードするには、.env.sample をコピーして .env を作成してください'
    );
  }

  p.outro(`🎉 ${styleText('green', projectName)} を作成しました`);
}

main().catch((error) => {
  console.error(styleText('red', error instanceof Error ? (error.stack ?? error.message) : String(error)));
  process.exit(1);
});
