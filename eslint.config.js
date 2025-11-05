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
      
      // Mobile-First Pattern Enforcement - Enhanced Rules
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/\\b(p-6|p-8|p-10|p-12)\\b(?!.*\\bmd:)/]',
          message: '⚠️ Mobile-First: Use mobileFirst.padding.* utilities instead of fixed padding (p-6, p-8, etc.). Mobile-first pattern required.'
        },
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/\\b(text-lg|text-xl|text-2xl|text-3xl)\\b(?!.*\\bmd:)/]',
          message: '⚠️ Mobile-First: Use mobileFirst.text.* utilities instead of fixed text sizes (text-lg, text-xl, etc.). Mobile-first pattern required.'
        },
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/\\b(gap-6|gap-8|gap-10|gap-12)\\b(?!.*\\bmd:)/]',
          message: '⚠️ Mobile-First: Use mobileFirst.gap.* utilities for responsive spacing.'
        },
        {
          selector: 'JSXAttribute[name.name="className"] TemplateLiteral > * Literal[value=/\\b(p-6|p-8|p-10|p-12|text-lg|text-xl|text-2xl|text-3xl|gap-6|gap-8|gap-10|gap-12)\\b/]',
          message: '⚠️ Mobile-First: Detected desktop-first pattern in template literal. Use mobileFirst utilities for consistent mobile-first design.'
        },
        // Design System Enforcement - Brutal Border & Shadow Tokens
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/border-\\[(2|3|4)px\\]/]',
          message: '🎨 Design System: Use brutal-border, brutal-border-subtle, or brutal-border-bold instead of border-[2px], border-[3px], border-[4px].'
        },
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/shadow-\\[\\d+px_\\d+px_0px_0px/]',
          message: '🎨 Design System: Use shadow-brutal-xs, shadow-brutal-sm, shadow-brutal-md, shadow-brutal-lg, shadow-brutal-xl, or shadow-brutal-2xl instead of custom shadow-[...] patterns.'
        },
        {
          selector: 'JSXAttribute[name.name="className"] TemplateLiteral > * Literal[value=/border-\\[(2|3|4)px\\]/]',
          message: '🎨 Design System: Use brutal-border tokens in template literals instead of border-[2px], border-[3px], border-[4px].'
        },
        {
          selector: 'JSXAttribute[name.name="className"] TemplateLiteral > * Literal[value=/shadow-\\[\\d+px_\\d+px_0px_0px/]',
          message: '🎨 Design System: Use shadow-brutal-* tokens in template literals instead of custom shadow-[...] patterns.'
        }
      ]
    },
  }
);
