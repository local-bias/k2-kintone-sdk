#!/usr/bin/env node
import { program } from 'commander';
import viteBuild from './commands/build-vite.js';
import dev from './commands/dev/index.js';
import viteDev from './commands/dev-vite.js';
import genkey from './commands/genkey.js';
import lint from './commands/lint.js';

program.name('k2').version('1.4.0').description('k2 - 🍳 kintone kitchen 🍳');

viteBuild();
dev();
viteDev();
genkey();
lint();

program.parse(process.argv);
