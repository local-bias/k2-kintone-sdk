#!/usr/bin/env node
import { program } from 'commander';
import build from './commands/plugin-build.js';
import dev from './commands/plugin-dev/index.js';
import lint from './commands/lint.js';

program.name('plugin').version('1.4.0').description('🍳 kintone kitchen 🍳 for kintone plugin');

build();
dev();
lint();

program.parse(process.argv);
