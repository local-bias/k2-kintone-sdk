import { exec } from './exec.js';
import fs from 'fs-extra';
import path from 'path';

export const generateCert = async (outDir: string) => {
  const { stdout } = await exec(`mkcert localhost 127.0.0.1 ::1`);
  [
    { input: 'localhost+2.pem', output: 'localhost-cert.pem' },
    { input: 'localhost+2-key.pem', output: 'localhost-key.pem' },
  ].forEach(({ input, output }) => {
    fs.moveSync(`./${input}`, path.join(outDir, output), {
      overwrite: true,
    });
  });
  return { stdout };
};
