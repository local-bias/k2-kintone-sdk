import archiver from 'archiver';
import fs from 'fs-extra';
import path from 'path';
import { CONTENTS_DIRECTORY, WORKSPACE_DIRECTORY } from './constants.js';

export const outputContentsZip = async (manifest: Plugin.Meta.Manifest) => {
  const archive = archiver('zip', { zlib: { level: 9 } });

  const outputZipPath = path.join(WORKSPACE_DIRECTORY, 'contents.zip');
  const outputZipStream = fs.createWriteStream(outputZipPath);

  const filterLocalContent = (file: string) => {
    return !/^https?:\/\//.test(file);
  };

  archive.file(path.join(CONTENTS_DIRECTORY, 'manifest.json'), {
    name: 'manifest.json',
  });
  if (!manifest.config) {
    throw new Error('manifest.config is required');
  }

  const targetFiles = [
    ...new Set([
      manifest.icon,
      manifest.config.html!,
      ...(manifest.desktop?.js || []).filter(filterLocalContent),
      ...(manifest.desktop?.css || []).filter(filterLocalContent),
      ...(manifest.mobile?.js || []).filter(filterLocalContent),
      ...(manifest.mobile?.css || []).filter(filterLocalContent),
      ...(manifest.config.js || []).filter(filterLocalContent),
      ...(manifest.config.css || []).filter(filterLocalContent),
    ]),
  ];

  targetFiles.forEach((file) => {
    const filePath = path.join(CONTENTS_DIRECTORY, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`${filePath} does not exist`);
    }
    archive.file(filePath, { name: file });
  });
  archive.pipe(outputZipStream);
  await archive.finalize();
};

export const getContentsZipBuffer = async () => {
  const outputZipPath = path.join(WORKSPACE_DIRECTORY, 'contents.zip');
  return fs.readFile(outputZipPath);
};

export const getZipFileNameSuffix = (env: string) => {
  return env === 'prod' ? '' : `-${env}`;
};
