import { exec } from './exec.js';
import fs from 'fs-extra';
import path from 'path';

export const generateCert = async (outDir: string) => {
  const { stdout } = await exec(`mkcert localhost`);
  [
    { input: 'localhost.pem', output: 'localhost-cert.pem' },
    { input: 'localhost-key.pem', output: 'localhost-key.pem' },
  ].forEach(({ input, output }) => {
    fs.moveSync(`./${input}`, path.join(outDir, output), {
      overwrite: true,
    });
  });
  return { stdout };
};
