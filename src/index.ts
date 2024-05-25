#!/usr/bin/env node
import { program } from 'commander';
import build from './commands/build/index.js';
import dev from './commands/dev.js';
import genkey from './commands/genkey.js';
import upload from './commands/upload/index.js';

program.name('k2').version('0.1.0').description('');

build();
dev();
genkey();
upload();

program.parse(process.argv);
