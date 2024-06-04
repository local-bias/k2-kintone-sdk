import { BuildOptions } from 'esbuild';
import path from 'path';
import { getEsbuildContext } from '../lib/esbuild.js';

export default async function action(params: {
  entryPoints: BuildOptions['entryPoints'];
  staticDir: string;
  certDir: string;
  port: number;
}) {
  const { entryPoints, staticDir: outdir, certDir, port } = params;

  const context = await getEsbuildContext({ sourcemap: 'inline', entryPoints, outdir });

  const [_, serveResult] = await Promise.all([
    context.watch(),
    context.serve({
      port,
      keyfile: path.join(certDir, 'localhost-key.pem'),
      certfile: path.join(certDir, 'localhost-cert.pem'),
      servedir: outdir,
    }),
  ]);

  console.log(`🚀 Start development server at https://localhost:${serveResult.port}`);
}
