#!/usr/bin/env node
import { program } from 'commander';
import build from './commands/build.js';
import viteBuild from './commands/build-vite.js';
import dev from './commands/dev/index.js';
import viteDev from './commands/dev-vite.js';
import genkey from './commands/genkey.js';
import esbuildBuild from './commands/build-esbuild.js';
import lint from './commands/lint.js';

program.name('k2').version('1.4.0').description('k2 - 🍳 kintone kitchen 🍳');

build();
viteBuild();
esbuildBuild();
dev();
viteDev();
genkey();
lint();

program.parse(process.argv);
