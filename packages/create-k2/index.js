#!/usr/bin/env node

import tiged from 'tiged';
import prompts from 'prompts';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';

async function main() {
  try {
    // ユーザーから情報を取得
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
        choices: [
          { title: 'app', value: 'local-bias/k2-kintone-sdk/templates/default' },
          // { title: 'plugin', value: 'local-bias/k2-kintone-sdk/templates/plugin/default' },
          { title: 'plugin min', value: 'local-bias/k2-kintone-sdk/templates/plugin/min' },
        ],
      },
    ]);

    const { projectName, template } = response;
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
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}

main();
