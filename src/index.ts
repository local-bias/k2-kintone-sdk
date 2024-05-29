#!/usr/bin/env node
import { program } from 'commander';
import build from './commands/build.js';
import dev from './commands/dev.js';
import genkey from './commands/genkey.js';

program.name('k2').version('0.1.0').description('k2 - 🍳 kintone kitchen 🍳');

build();
dev();
genkey();

program.parse(process.argv);
