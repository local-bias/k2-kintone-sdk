import { type Options, build } from 'tsup';

/**
 * 受け取ったビルドオプションに対して、共通するビルドオプションを補完します
 *
 * @param params
 * @returns
 */
const completeBuildOptions = (params: Options): Options => {
  return {
    bundle: true,
    minify: 'terser',
    splitting: false,
    noExternal: [/.*/],
    platform: 'browser',
    dts: true,
    ...params,
    esbuildOptions(options, context) {
      options.legalComments = 'none';
    },
  };
};

export const buildWithTsup = async (buildOptions: Options) => {
  const options = completeBuildOptions(buildOptions);
  await build(options);
};
