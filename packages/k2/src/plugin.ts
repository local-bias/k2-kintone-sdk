#!/usr/bin/env node
import { program } from 'commander';
import manifest from './commands/manifest/index.js';
import build from './commands/plugin-build.js';
import dev from './commands/plugin-dev/index.js';
import genkey from './commands/plugin-genkey.js';
import init from './commands/plugin-init.js';
import zip from './commands/plugin-zip.js';
import { K2_VERSION } from './lib/version.js';

program.name('plugin').version(K2_VERSION).description('🍳 kintone kitchen 🍳 for kintone plugin');

build();
dev();
genkey();
init();
manifest();
zip();

program.parse(process.argv);
