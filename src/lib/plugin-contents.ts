import fs from 'fs-extra';
import path from 'path';
import { PLUGIN_CONTENTS_DIRECTORY } from './constants.js';
import htmlMinifier from 'html-minifier';

export const copyPluginContents = async (
  params: { inputDir?: string; outputDir?: string } = {}
) => {
  const { inputDir = path.join('src', 'contents'), outputDir = PLUGIN_CONTENTS_DIRECTORY } = params;
  if (!fs.existsSync(inputDir)) {
    await fs.mkdir(inputDir, { recursive: true });
  }

  await fs.copy(inputDir, path.join(outputDir), {
    overwrite: true,
  });

  const html = await fs.readFile(path.join(outputDir, 'config.html'), 'utf8');

  const minified = htmlMinifier.minify(html, {
    minifyCSS: true,
    collapseWhitespace: true,
    removeComments: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeTagWhitespace: true,
    useShortDoctype: true,
  });

  await fs.writeFile(path.join(outputDir, 'config.html'), minified);
};
