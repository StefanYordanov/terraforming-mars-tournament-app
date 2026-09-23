// Minimal ESLint flat config: allow parsing TypeScript and ignore generated files.
const { defineConfig } = require('eslint/config');
const tsParser = require('@typescript-eslint/parser');

module.exports = defineConfig([
  {
    ignores: [
      '.angular/',
      '.angular/cache/',
      'dist/',
      'out-tsc/',
      'node_modules/',
      'coverage/',
      '.vscode/',
      '.idea/',
      '*.log',
      '**/*.tgz',
      // temporarily ignore html templates until template plugin is re-enabled
      '**/*.html',
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      // basic formatting rules
      indent: ['error', 2],
      semi: ['error', 'always'],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
    },
  },
]);
