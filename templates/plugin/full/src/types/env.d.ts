/**
 * `process.env.NODE_ENV` はビルド時に k2 (rsbuild) によって文字列へ置換されます
 */
declare const process: {
  readonly env: {
    readonly NODE_ENV: 'development' | 'production';
  };
};
