// @ts-check

/** @satisfies { Plugin.Meta.Config } */
export default /** @type { const } */ ({
  id: `kintone-plugin-template`,
  server: {
    port: 65535,
  },
  manifest: {
    base: {
      manifest_version: 1,
      version: '0.1.0',
      type: 'APP',
      name: {
        en: 'kintone-plugin-template',
        ja: 'プラグインテンプレート',
        zh: '插件模板',
      },
      description: {
        en: 'kintone-plugin-template',
        ja: 'プラグインの説明をここに記載します',
        zh: '插件模板',
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
