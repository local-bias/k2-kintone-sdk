type Locales = {
  /** 日本語 */
  ja: string;
  /** 英語 */
  en: string;
  /** 簡体字中国語 */
  zh: string;
};

type Resources = {
  /**
   * プラグインのJavaScriptファイル
   *
   * URLの配列
   */
  js: string[];
  /**
   * プラグインのCSSファイル
   *
   * URLの配列
   */
  css: string[];
};

declare namespace Plugin {
  namespace Meta {
    type Env = 'dev' | 'prod' | 'standalone';

    type Manifest = {
      type: 'APP';
      manifest_version: 1;
      version: number | string;
      /**
       * プラグインの名前
       *
       * インストール時、プラグイン一覧画面で表示されます
       */
      name: Locales;
      /**
       * プラグインの説明
       *
       * インストール時、プラグイン一覧画面で表示されます
       */
      description?: Locales;
      icon: string;
      homepage_url?: Partial<Locales>;
      desktop?: Partial<Resources>;
      mobile?: Partial<Resources>;
      config?: Partial<Resources> & {
        /** ファイルの種類 (js/css/html) をキーとする設定画面用カスタマイズファイルと設定情報 */
        html?: string;
        /**
         * 設定画面で設定必須とするパラメータの配列
         *
         * ASCIIで1文字以上64文字以下
         */
        required_params?: string[];
      };
    };

    /**
     * 公開しているプラグインテンプレートで使用する設定ファイル
     *
     * @see {@link https://github.com/local-bias/kintone-plugin-template | kintone-plugin-template}
     */
    type Config = {
      /** 一意となるプラグインID */
      id: string;
      /**
       * プラグインのバージョン
       * この設定ファイルの互換性の管理に使用されます
       */
      version?: 1;
      /**
       * プラグインのmanifest.jsonの設定
       *
       * `base`プロパティを基準として、環境ごとに`dev`、`prod`、`standalone`のプロパティを上書きする形でマージされます
       *
       * - `dev` - 開発環境の設定
       * - `prod` - 本番環境での設定
       * - `standalone` - スタンドアロン環境での設定
       *
       * @see {@link https://cybozu.dev/ja/kintone/tips/development/plugins/development-plugin/development-kintone-plugin/#manifest | マニフェストファイルの作成}
       */
      manifest: {
        /** プラグインの基本設定 */
        base: Manifest;
        /** 開発環境のmanifest.json */
        dev?: Partial<Manifest>;
        /** 本番環境のmanifest.json */
        prod?: Partial<Manifest>;
        /** スタンドアロン環境のmanifest.json */
        standalone?: Partial<Manifest>;
      };
      pluginReleasePageUrl?: string;
      inquiriesPageUrl?: string;
      promotionPageUrl?: string;
      bannerPageUrl?: string;
      config_params?: Record<string, any>;
      server?: {
        /** 0から65535までのポート番号 */
        port?: number;
      };

      lint?: {
        build?: boolean;
        dev?: boolean;
      };

      /**
       * tailwindcssを使用している場合、設定ファイルのパスとCSSファイルのパスを指定することで、JavaScriptファイルのビルド時にCSSファイルを生成します
       *
       * @see {@link https://tailwindcss.com/docs/installation | Tailwind CSS}
       * @example
       * ```json
       * // 共通の設定ファイルを使用する場合
       * {
       *  "tailwind": {
       *   "config": "tailwind.config.js",
       *  "css": "src/styles/tailwind.css"
       * }
       *
       * // 設定ファイルをプラグイン設定画面、アプリで分ける場合
       * {
       * "tailwind": {
       *   "config": {
       *     "config": "tailwind.config.js",
       *     "desktop": "src/styles/tailwind-desktop.css"
       *   },
       *   "css": "src/styles/tailwind-mobile.css"
       * }
       * ```
       */
      tailwind?: {
        config?: string | { config: string; desktop: string };
        /** CSSファイルのパス */
        css?: string;
      };
    };
  }
}
