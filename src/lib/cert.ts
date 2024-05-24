import { exec } from './exec.js';
import fs from 'fs-extra';
import path from 'path';
import { WORKSPACE_DIRECTORY } from './constants.js';

export const generateCert = async () => {
  const { stdout } = await exec(`mkcert localhost`);
  [
    { input: 'localhost.pem', output: 'localhost-cert.pem' },
    { input: 'localhost-key.pem', output: 'localhost-key.pem' },
  ].forEach(({ input, output }) => {
    fs.moveSync(`./${input}`, path.join(WORKSPACE_DIRECTORY, output), {
      overwrite: true,
    });
  });
  return { stdout };
};
