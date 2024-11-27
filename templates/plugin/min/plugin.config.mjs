// @ts-check

/** @satisfies { Plugin.Meta.Config } */
export default /** @type { const } */ ({
  id: `k2-plugin`,
  server: {
    port: 65535,
  },
  manifest: {
    base: {
      manifest_version: 1,
      version: '0.1.0',
      type: 'APP',
      name: {
        en: 'k2 plugin',
        ja: 'k2プラグイン',
        zh: 'k2插件',
      },
      description: {
        en: 'Plugin description goes here',
        ja: 'プラグインの説明をここに記載します',
        zh: '插件描述在这里',
      },
      icon: 'icon.png',
      config: { html: 'config.html' },
    },
    prod: {
      desktop: { js: ['desktop.js'], css: [] },
      mobile: { js: ['desktop.js'], css: [] },
      config: { js: ['config.js'], css: [] },
    },
  },
});
