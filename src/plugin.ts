#!/usr/bin/env node
import { program } from 'commander';
import build from './commands/plugin-build.js';
import esbuild from './commands/plugin-esbuild.js';
import dev from './commands/plugin-dev/index.js';
import genkey from './commands/plugin-genkey.js';
import init from './commands/plugin-init.js';
import manifest from './commands/manifest/index.js';
import test from './commands/test/index.js';
import upload from './commands/upload/index.js';
import zip from './commands/plugin-zip.js';

program.name('plugin').version('0.8.0').description('🍳 kintone kitchen 🍳 for kintone plugin');

build();
esbuild();
dev();
genkey();
init();
manifest();
test();
upload();
zip();

program.parse(process.argv);
