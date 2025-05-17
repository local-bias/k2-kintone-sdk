import archiver from 'archiver';
import fs from 'fs-extra';
import path from 'path';
import invariant from 'tiny-invariant';
import { PLUGIN_CONTENTS_DIRECTORY, PLUGIN_WORKSPACE_DIRECTORY } from './constants.js';

export const outputContentsZip = async (manifest: Plugin.Meta.Manifest) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('warning', (error) => {
    if (error.code === 'ENOENT') {
      console.warn(error);
    } else {
      throw error;
    }
  });

  const outputZipPath = path.join(PLUGIN_WORKSPACE_DIRECTORY, 'contents.zip');
  const outputZipStream = fs.createWriteStream(outputZipPath);
  outputZipStream.on('close', () => {
    console.log(`📦 ${archive.pointer()} total bytes`);
  });
  outputZipStream.on('end', function () {
    console.log('📦 Data has been drained');
  });

  const filterLocalContent = (file: string) => {
    return !/^https?:\/\//.test(file);
  };

  invariant(manifest.config?.html, 'manifest.config.html is required');

  const targetFiles = [
    'manifest.json',
    ...new Set([
      manifest.icon,
      manifest.config.html,
      ...(manifest.desktop?.js || []).filter(filterLocalContent),
      ...(manifest.desktop?.css || []).filter(filterLocalContent),
      ...(manifest.mobile?.js || []).filter(filterLocalContent),
      ...(manifest.mobile?.css || []).filter(filterLocalContent),
      ...(manifest.config.js || []).filter(filterLocalContent),
      ...(manifest.config.css || []).filter(filterLocalContent),
    ]),
  ];

  console.group('📁 Target files');
  targetFiles.forEach((file, i) => {
    const prefix = i === targetFiles.length - 1 ? '└─' : '├─';
    console.log(`${prefix} 📄 ${file}`);
  });
  console.groupEnd();

  for (const file of targetFiles) {
    const filePath = path.join(PLUGIN_CONTENTS_DIRECTORY, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`${filePath} does not exist`);
    }
    archive.file(filePath, { name: file });
  }

  archive.pipe(outputZipStream);
  await archive.finalize();
  await new Promise<void>((resolve) => outputZipStream.on('close', resolve));
};

export const getContentsZipBuffer = async () => {
  const outputZipPath = path.join(PLUGIN_WORKSPACE_DIRECTORY, 'contents.zip');
  return fs.readFile(outputZipPath);
};

export const getZipFileNameSuffix = (env: string) => {
  return env === 'prod' ? '' : `-${env}`;
};
