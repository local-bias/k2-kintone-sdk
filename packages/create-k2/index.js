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
        message: 'What is your project name?',
        initial: 'k2-app',
      },
      {
        type: 'text',
        name: 'template',
        message: 'GitHub repository (owner/repo/subdirectory):',
        initial: 'local-bias/k2-kintone-sdk/templates/default',
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
🎉 Successfully created project ${projectName}

To get started:
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
