#!/usr/bin/env node
import { program } from 'commander';
import build from './commands/build.js';
import viteBuild from './commands/build-vite.js';
import dev from './commands/dev.js';
import viteDev from './commands/dev-vite.js';
import genkey from './commands/genkey.js';

program.name('k2').version('0.1.0').description('k2 - 🍳 kintone kitchen 🍳');

build();
viteBuild();
dev();
viteDev();
genkey();

program.parse(process.argv);
