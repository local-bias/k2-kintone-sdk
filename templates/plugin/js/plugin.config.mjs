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
        'zh-TW': 'k2外掛程式',
        es: 'Complemento k2',
        'pt-BR': 'Plugin k2',
        th: 'ปลั๊กอิน k2',
        ms: 'Pemalam k2',
      },
      description: {
        en: 'Plugin description goes here',
        ja: 'プラグインの説明をここに記載します',
        zh: '插件描述在这里',
        'zh-TW': '在此輸入外掛程式的說明',
        es: 'Escriba aquí la descripción del complemento',
        'pt-BR': 'Escreva aqui a descrição do plugin',
        th: 'เขียนคำอธิบายปลั๊กอินที่นี่',
        ms: 'Tulis penerangan pemalam di sini',
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
