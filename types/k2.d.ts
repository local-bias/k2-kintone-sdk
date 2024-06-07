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
  };
}
