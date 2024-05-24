#!/usr/bin/env node
import { program } from 'commander';
import build from './commands/build/index.js';
import dev from './commands/dev/index.js';
import genkey from './commands/genkey/index.js';
import init from './commands/init/index.js';
import manifest from './commands/manifest/index.js';
import test from './commands/test/index.js';
import upload from './commands/upload/index.js';
import zip from './commands/zip/index.js';

program.name('plugin').version('0.0.1').description('');

build();
dev();
genkey();
init();
manifest();
test();
upload();
zip();

program.parse(process.argv);
