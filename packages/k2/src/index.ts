#!/usr/bin/env node
import { program } from 'commander';
import build from './commands/build.js';
import dev from './commands/dev/index.js';
import genkey from './commands/genkey.js';
import esbuildBuild from './commands/build-esbuild.js';
import lint from './commands/lint.js';

program.name('k2').version('1.10.0').description('k2 - 🍳 kintone kitchen 🍳');

build();
esbuildBuild();
dev();
genkey();
lint();

program.parse(process.argv);
