import archiver from 'archiver';
import fs from 'fs-extra';
import path from 'path';
import { WORKSPACE_DIRECTORY } from './constants.js';

export const outputContentsZip = async () => {
  const archive = archiver('zip', { zlib: { level: 9 } });

  const outputZipPath = path.join(WORKSPACE_DIRECTORY, 'contents.zip');
  const outputZipStream = fs.createWriteStream(outputZipPath);

  archive.directory(path.join(WORKSPACE_DIRECTORY, 'contents'), false);
  archive.pipe(outputZipStream);
  await archive.finalize();
};

export const getContentsZipBuffer = async () => {
  const outputZipPath = path.join(WORKSPACE_DIRECTORY, 'contents.zip');
  return fs.readFile(outputZipPath);
};
