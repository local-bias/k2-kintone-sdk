import chalk from 'chalk';
import esbuild, { type BuildOptions } from 'esbuild';

const completeBuildOptions = (params: BuildOptions): BuildOptions => {
  return {
    bundle: true,
    platform: 'browser',
    ...params,
    plugins: [...(params.plugins ?? [])],
  };
};

const completeDevBuildOptions = (params: BuildOptions): BuildOptions => {
  return completeBuildOptions({
    ...params,
    plugins: [
      ...(params.plugins ?? []),
      {
        name: 'on-end',
        setup: ({ onEnd }) =>
          onEnd(() =>
            console.log(
              chalk.hex('#e5e7eb')(`${new Date().toLocaleTimeString()} `) +
                chalk.cyan(`[js] `) +
                `rebuilt`
            )
          ),
      },
    ],
  });
};

export const getEsbuildContext = async (params: BuildOptions) => {
  return esbuild.context(completeDevBuildOptions(params));
};

export const buildWithEsbuild = async (params: BuildOptions & { watch?: boolean }) => {
  const { watch = false, ...rest } = params;
  if (watch) {
    const context = await getEsbuildContext(rest);
    context.watch();
  } else {
    const options = completeBuildOptions(rest);
    await esbuild.build(options);
  }
};
