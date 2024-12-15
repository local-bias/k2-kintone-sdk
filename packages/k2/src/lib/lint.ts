import { ESLint } from 'eslint';

export async function lint() {
  const eslint = new ESLint({
    baseConfig: {
      env: {
        browser: true,
        es2021: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'prettier',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
      plugins: ['@typescript-eslint', 'react'],
      rules: {
        'react/prop-types': 'off',
      },
      overrides: [
        {
          files: ['*.ts', '*.tsx'],
          rules: {
            'react/prop-types': 'off',
          },
        },
      ],
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
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
