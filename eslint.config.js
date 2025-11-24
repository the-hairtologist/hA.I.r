import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

// ESLint configuration - E2E tests excluded from linting
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
        'error', // Changed from 'warn' to 'error' for strict mode
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': 'error', // Changed from 'off' to 'error'
      // Strict rules for code quality
      '@typescript-eslint/no-explicit-any': 'error', // Changed from 'off' to 'error' - enforce type safety
      '@typescript-eslint/no-require-imports': 'off', // Allow require imports
      'react-hooks/exhaustive-deps': 'error', // Changed from 'warn' to 'error' for strict mode
      'react-hooks/rules-of-hooks': 'error', // Keep this as error (critical)
      'prefer-const': 'error', // Changed from 'off' to 'error' for strict mode
    },
  }
);
