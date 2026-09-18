import fs from 'fs-extra';
import { minify } from 'html-minifier-terser';
import path from 'node:path';
import { PLUGIN_CONTENTS_DIRECTORY } from './constants.js';

const DEFAULT_INPUT_DIR = path.join('src', 'contents');

/** プラグイン設定画面のHTMLファイル名 */
const CONFIG_HTML_FILE_NAME = 'config.html';

export const copyPluginContents = async (
  params: { inputDir?: string; outputDir?: string } = {}
) => {
  const { inputDir = DEFAULT_INPUT_DIR, outputDir = PLUGIN_CONTENTS_DIRECTORY } = params;

  await fs.ensureDir(inputDir);
  await fs.copy(inputDir, outputDir, { overwrite: true });

  const configHtmlPath = path.join(outputDir, CONFIG_HTML_FILE_NAME);

  if (!(await fs.pathExists(configHtmlPath))) {
    throw new Error(
      `Plugin HTML file not found. Create "${CONFIG_HTML_FILE_NAME}" in ${inputDir}.`
    );
  }

  const html = await fs.readFile(configHtmlPath, 'utf8');

  const minified = await minify(html, {
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
