import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'E2E/**'] },
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
      '@typescript-eslint/no-explicit-any': 'off', // Disabled for now - too many to fix
      '@typescript-eslint/no-require-imports': 'off', // Allow require imports
      'react-hooks/exhaustive-deps': 'warn', // Hooks deps as warnings not errors
      'react-hooks/rules-of-hooks': 'error', // Keep this as error (critical)
      'prefer-const': 'off', // Disabled for now
    },
  }
);
