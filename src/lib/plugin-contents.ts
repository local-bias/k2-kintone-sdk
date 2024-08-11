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

  await fs.copy(inputDir, outputDir, { overwrite: true });

  const configHtmlPath = path.join(outputDir, 'config.html');

  if (!fs.existsSync(configHtmlPath)) {
    throw new Error(`Plugin HTML file not found. Create "config.html" in ${inputDir}.`);
  }

  const html = await fs.readFile(configHtmlPath, 'utf8');

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

  await fs.writeFile(configHtmlPath, minified);
};
