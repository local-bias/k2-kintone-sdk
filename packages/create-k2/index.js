#!/usr/bin/env node
// @ts-check

import tiged from 'tiged';
import prompts from 'prompts';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { Command } from 'commander';

const TEMPLATES /** @type { const } */ = {
  app: { title: 'app', repo: 'local-bias/k2-kintone-sdk/templates/default' },
  'plugin-min': { title: 'plugin min', repo: 'local-bias/k2-kintone-sdk/templates/plugin/min' },
  'plugin-full': { title: 'plugin full', repo: 'local-bias/k2-kintone-sdk/templates/plugin/full' },
  'plugin-js': { title: 'plugin js', repo: 'local-bias/k2-kintone-sdk/templates/plugin/js' },
  'plugin-turbo': {
    title: 'plugin turbo',
    repo: 'local-bias/k2-kintone-sdk/templates/plugin/turbo',
  },
};

const program = new Command();

program
  .argument('[project-name]', 'プロジェクト名')
  .option('-t, --template <type>', 'テンプレートタイプ')
  .parse(process.argv);

async function main() {
  try {
    /** @type { string | undefined } */
    let projectName;
    /** @type { string | undefined } */
    let template;

    if (program.args[0] && program.opts().template) {
      // CLIオプション使用時
      projectName = program.args[0];
      template = getTemplateFromOption(program.opts().template);
    } else {
      // 対話モード
      const response = await prompts([
        {
          type: 'text',
          name: 'projectName',
          message: '✨ プロジェクト(フォルダ)名を入力してください:',
          initial: 'k2-app',
        },
        {
          type: 'select',
          name: 'template',
          message: '📦 テンプレートを選択してください:',
          choices: Object.values(TEMPLATES).map((t) => ({ title: t.title, value: t.repo })),
        },
      ]);
      projectName = response.projectName;
      template = response.template;
    }

    if (!projectName) {
      console.error(chalk.red('Error: Project name is required'));
      process.exit(1);
    }

    const targetDir = path.join(process.cwd(), projectName);

    // ディレクトリが既に存在するかチェック
    if (fs.existsSync(targetDir)) {
      console.error(chalk.red(`Error: Directory ${projectName} already exists`));
      process.exit(1);
    }

    console.log(chalk.blue(`Creating project in ${targetDir}...`));

    // リポジトリをクローン
    const emitter = tiged(template, {
      cache: false,
      force: true,
      verbose: true,
    });

    await emitter.clone(targetDir);

    console.log(
      chalk.green(`
🎉 ${projectName}が作成されました

🏃 次のステップ:
cd ${projectName}
npm install
    `)
    );
  } catch (error) {
    console.error(chalk.red(error));
    process.exit(1);
  }
}

/**
 * @param { keyof TEMPLATES } templateType
 * @returns { string }
 */
function getTemplateFromOption(templateType) {
  return (TEMPLATES[templateType] ?? TEMPLATES['app']).repo;
}

main();
