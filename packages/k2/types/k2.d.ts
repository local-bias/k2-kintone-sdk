declare namespace K2 {
  /**
   * 公開しているプラグインテンプレートで使用する設定ファイル
   */
  type Config = Record<string, any> & {
    version?: 1;
    server?: {
      /** 0から65535までのポート番号 */
      port?: number;
    };

    /**
     * tailwindcssを使用している場合、CSSファイルのパスを指定することで、JavaScriptファイルのビルド時にCSSファイルを生成します
     *
     * Tailwind CSS v4では、設定はCSSファイル内で`@config`ディレクティブや`@theme`ブロックを使用して行います
     *
     * @see {@link https://tailwindcss.com/docs/installation | Tailwind CSS}
     * @example
     * ```js
     * // k2.config.mjs
     * export default {
     *   tailwind: {
     *     css: 'src/styles/tailwind.css',
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
      css?: string;
      /** 出力するCSSファイル名 */
      fileName?: string;
    };
  };

  type FullConfig = Config & {
    outDir: string;
  };

  type Locales = {
    /** 日本語 */
    ja: string;
    /** 英語 */
    en: string;
    /** 簡体字中国語 */
    zh: string;
    /** 繁体字中国語 */
    'zh-TW': string;
    /** スペイン語 */
    es: string;
    /** ポルトガル語(ブラジル) */
    'pt-BR': string;
    /** タイ語 */
    th: string;
    /** マレー語 */
    ms: string;
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
}
