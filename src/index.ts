#!/usr/bin/env node
import { program } from 'commander';
import build from './commands/build/index.js';
import dev from './commands/dev.js';
import genkey from './commands/genkey.js';
import init from './commands/init/index.js';
import manifest from './commands/manifest/index.js';
import test from './commands/test/index.js';
import upload from './commands/upload/index.js';
import zip from './commands/zip/index.js';

program.name('k2').version('0.1.0').description('');

build();
dev();
genkey();
init();
manifest();
test();
upload();
zip();

program.parse(process.argv);
