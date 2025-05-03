import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import { kintoneConfig } from '@repo/eslint-config/kintone';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...kintoneConfig,
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  pluginReact.configs.flat.recommended,
  {
    languageOptions: { globals: globals.browser },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
    },
  },
];
