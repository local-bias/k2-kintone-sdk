import { InlineConfig, build } from 'vite';

export default async function action(params: { viteConfig: InlineConfig }) {
  const { viteConfig } = params;

  await build({
    ...viteConfig,
    mode: 'production',
  });
}
