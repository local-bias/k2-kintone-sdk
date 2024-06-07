import { outputManifest } from '../../lib/plugin-manifest.js';

export const getManifest = async (params: { config: Plugin.Meta.Config; port: number }) => {
  const { config, port } = params;
  return outputManifest('dev', {
    config: {
      ...config,
      manifest: {
        ...config.manifest,
        dev: {
          config: {
            ...config.manifest?.dev?.config,
            js: [`https://localhost:${port}/config.js`],
            css: [`https://localhost:${port}/config.css`],
          },
          desktop: {
            ...config.manifest?.dev?.desktop,
            js: [`https://localhost:${port}/desktop.js`],
            css: [`https://localhost:${port}/desktop.css`],
          },
          mobile: {
            ...config.manifest?.dev?.mobile,
            js: [`https://localhost:${port}/desktop.js`],
            css: [`https://localhost:${port}/desktop.css`],
          },
        },
      },
    },
  });
};
