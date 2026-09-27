// ESLint flat config pro Vite + React + TypeScript projekt.
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  {
    // generovaná data, buildy, vendorovaný PowerShell a dočasné paritní složky
    ignores: ['dist/**', 'node_modules/**', 'scripts/raw/**', 'scripts/.parity*/**', 'scripts/vendor/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node } },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-useless-escape': 'warn'
    }
  },
  {
    // generovaný soubor (scripts/to-ts.mjs) - nehlídat styl ani escapování
    files: ['src/lib/templates.ts'],
    linterOptions: {
      // soubor si nese vlastni /* eslint-disable */ z generatoru
      reportUnusedDisableDirectives: 'off'
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-useless-escape': 'off',
      'no-irregular-whitespace': 'off'
    }
  }
)
