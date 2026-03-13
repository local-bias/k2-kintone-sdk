#!/usr/bin/env node
import { program } from 'commander';
import build from './commands/build.js';
import dev from './commands/dev/index.js';
import genkey from './commands/genkey.js';
import lint from './commands/lint.js';

program.name('k2').version('4.0.0').description('k2 - 🍳 kintone kitchen 🍳');

build();
dev();
genkey();
lint();

program.parse(process.argv);
