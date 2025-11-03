import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'dev-dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': 'off',
      // Pragmatic rules for existing codebase
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'prefer-const': 'warn',
      
      // Mobile-First Pattern Enforcement
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/^(?=.*\\b(p-6|p-8|px-6|py-6|text-lg|text-xl|text-2xl|gap-6|space-x-6|space-y-6)\\b)(?!.*\\bmd:).*$/]',
          message: '⚠️ Mobile-First: Use mobileFirst utilities from @/lib/responsive/mobile-first-utils instead of desktop-first classes. Import { mobileFirst } and use mobileFirst.padding.md, mobileFirst.text.lg, etc.'
        },
        {
          selector: 'JSXAttribute[name.name="className"] TemplateLiteral > * Literal[value=/\\b(p-6|p-8|px-6|py-6|text-lg|text-xl|gap-6)\\b/]',
          message: '⚠️ Mobile-First: Detected desktop-first pattern in template literal. Use mobileFirst utilities for consistent mobile-first design.'
        }
      ]
    },
  }
);
