#!/usr/bin/env node
import { program } from 'commander';
import init from './commands/init/index.js';
import manifest from './commands/manifest/index.js';
import test from './commands/test/index.js';
import upload from './commands/upload/index.js';
import zip from './commands/zip/index.js';

program.name('plugin').version('0.0.1').description('');

init();
manifest();
test();
upload();
zip();

program.parse(process.argv);
