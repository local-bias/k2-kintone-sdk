#!/usr/bin/env node
import { program } from 'commander';
import build from './commands/build.js';
import dev from './commands/dev/index.js';
import genkey from './commands/genkey.js';
import { K2_VERSION } from './lib/version.js';

program.name('k2').version(K2_VERSION).description('k2 - 🍳 kintone kitchen 🍳');

build();
dev();
genkey();

program.parse(process.argv);
