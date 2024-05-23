import fs from 'fs-extra';
import path from 'path';
import { CONTENTS_DIRECTORY } from './constants.js';
import htmlMinifier from 'html-minifier';

export const copyPluginContents = async () => {
  await fs.copySync(
    path.join('src', 'contents'),
    path.join(CONTENTS_DIRECTORY),
    { overwrite: true }
  );

  const html = await fs.readFile(
    path.join(CONTENTS_DIRECTORY, 'config.html'),
    'utf8'
  );

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

  await fs.writeFile(path.join(CONTENTS_DIRECTORY, 'config.html'), minified);
};
