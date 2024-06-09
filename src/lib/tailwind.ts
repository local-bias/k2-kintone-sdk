import cssnanoPlugin from 'cssnano';
import fs from 'fs-extra';
import path from 'path';
import postcss from 'postcss';
import tailwindcss, { type Config as TailwindConfig } from 'tailwindcss';
import invariant from 'tiny-invariant';
import { esmImport } from './import.js';

export const getTailwindConfig = async (
  config: Plugin.Meta.Config['tailwind']
): Promise<{
  desktop: TailwindConfig;
  config: TailwindConfig;
}> => {
  invariant(config?.config, 'tailwind.config is required');

  const { config: configPath } = config;

  const configPathForDesktop = typeof configPath === 'string' ? configPath : configPath.desktop;
  const configPathForConfig = typeof configPath === 'string' ? configPath : configPath.config;

  const desktopConfig = (await esmImport(path.resolve(configPathForDesktop))).default;
  const configConfig = (await esmImport(path.resolve(configPathForConfig))).default;

  return { desktop: desktopConfig, config: configConfig };
};

export const outputCss = async (params: {
  inputPath: string;
  outputPath: string;
  config: TailwindConfig;
  minify?: boolean;
}) => {
  const { inputPath, outputPath, config, minify = false } = params;

  const css = await fs.readFile(inputPath, 'utf8');

  const result = await postcss([tailwindcss(config), ...(minify ? [cssnanoPlugin()] : [])]).process(
    css,
    {
      from: inputPath,
      to: outputPath,
    }
  );

  await fs.writeFile(outputPath, result.css);

  if (result.map) {
    await fs.writeFile(`${outputPath}.map`, result.map.toString());
  }
};
