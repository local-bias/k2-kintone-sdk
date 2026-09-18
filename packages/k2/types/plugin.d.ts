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
      /**
       * プラグインのZIPファイルのURL
       *
       * このURLが設定されている場合、ユーザーはプラグイン設定画面から、ZIPファイルをダウンロードしてインストールできます
       */
      zipFileUrl?: string;
      inquiriesPageUrl?: string;
      promotionPageUrl?: string;
      bannerPageUrl?: string;
      config_params?: Record<string, any>;
      server?: K2.ServerConfig;

      /**
       * tailwindcssを使用している場合、CSSファイルのパスを指定することで、JavaScriptファイルのビルド時にCSSファイルを生成します
       *
       * Tailwind CSS v4では、設定はCSSファイル内で`@config`ディレクティブや`@theme`ブロックを使用して行います
       *
       * @see {@link https://tailwindcss.com/docs/installation | Tailwind CSS}
       * @example
       * ```js
       * // 共通のCSSファイルを使用する場合
       * {
       *   "tailwind": {
       *     "css": "src/styles/tailwind.css"
       *   }
       * }
       *
       * // プラグイン設定画面とデスクトップでCSSファイルを分ける場合
       * {
       *   "tailwind": {
       *     "css": {
       *       "config": "src/styles/tailwind-config.css",
       *       "desktop": "src/styles/tailwind-desktop.css"
       *     }
       *   }
       * }
       * ```
       *
       * ```css
       * // src/styles/tailwind.css
       * @import "tailwindcss";
       * @config "../../tailwind.config.js"; // オプション: レガシーJS設定ファイルを使用する場合
       * ```
       */
      tailwind?: {
        /** CSSファイルのパス */
        css?: string | { config: string; desktop: string };
      };
    };
  }

  /** @see {@link K2.Locales} */
  type Locales = K2.Locales;

  /** @see {@link K2.Resources} */
  type Resources = K2.Resources;
}
