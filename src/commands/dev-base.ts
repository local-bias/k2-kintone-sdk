import { BuildOptions } from 'esbuild';
import express from 'express';
import fs from 'fs-extra';
import { createServer } from 'https';
import path from 'path';
import { generateCert } from '../lib/cert.js';
import { buildWithEsbuild } from '../lib/esbuild.js';

export default function action(params: {
  entryPoints: BuildOptions['entryPoints'];
  staticDir: string;
  certDir: string;
  port: number;
}) {
  const { entryPoints, staticDir, certDir, port } = params;
  return Promise.all([build({ entryPoints, staticDir }), server({ port, certDir, staticDir })]);
}

async function build(params: { entryPoints: BuildOptions['entryPoints']; staticDir: string }) {
  const { entryPoints, staticDir: outdir } = params;
  return buildWithEsbuild({ entryPoints, outdir, watch: true });
}

async function server(params: { port: number; certDir: string; staticDir: string }) {
  const { certDir, port, staticDir } = params;
  const app = express();

  app.use(express.static(staticDir));

  const privateKeyPath = path.join(certDir, 'localhost-key.pem');
  const certificatePath = path.join(certDir, 'localhost-cert.pem');

  if (!fs.existsSync(privateKeyPath) || !fs.existsSync(certificatePath)) {
    await generateCert(certDir);
    console.log('🔑 Certificate generated');
  }

  const privateKey = fs.readFileSync(privateKeyPath);
  const certificate = fs.readFileSync(certificatePath);

  const server = createServer({ key: privateKey, cert: certificate }, app);

  const res = server.listen(port);

  res.on('error', (error) => {
    console.error(error);
  });
  res.on('listening', () => {
    console.log(`🚀 Server started! https://localhost:${port}`);
  });
}
