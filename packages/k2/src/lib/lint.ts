import { ESLint } from 'eslint';
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

export async function lint() {
  const eslint = new ESLint({
    baseConfig: [
      { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
      { languageOptions: { globals: globals.browser } },
      pluginJs.configs.recommended,
      // ...tseslint.configs.recommended,
      ...(pluginReact.configs.flat?.recommended ? [pluginReact.configs.flat.recommended] : []),
    ],
  });

  const results = await eslint.lintFiles(['src/**/*.{ts,tsx?}']);

  const formatter = await eslint.loadFormatter('stylish');
  const resultText = formatter.format(results);

  console.group('👕 Lint Results');
  console.log(resultText);
  console.groupEnd();

  const hasErrors = results.some((result) => result.errorCount > 0);
  if (hasErrors) {
    console.error('🚨 Lint errors found');
    process.exit(1);
  }
}
