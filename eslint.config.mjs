import { globalIgnores } from 'eslint/config';
import { dirname } from 'path';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  globalIgnores([
    '**/node_modules/**',
    '**/.next/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/.git/**',
    '**/*.config.js',
    '**/*.min.js',
    '**/*.mjs',
  ]),

  ...compat.extends('next', 'next/core-web-vitals', 'next/typescript'),

  eslint.configs.recommended,

  // Плагин TypeScript
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Кастомные правила
  {
    files: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],

    rules: {
      // TypeScript-специфичные правила
      '@typescript-eslint/no-explicit-any': 'error', // Запрещает явное указание `any` (можно заменить на `unknown`)
      '@typescript-eslint/ban-ts-comment': 'error', // Запрещает `// @ts-ignore`
      '@typescript-eslint/consistent-type-imports': [
        // Единый стиль импортов типов
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error', // Запрещает `!` (non-null assertion)
      '@typescript-eslint/no-empty-object-type': 'error', // Запрещает использование {} (можно заменить на object)
      '@typescript-eslint/no-unsafe-function-type': 'error', // Запрещает использование Function (можно заменить на () => void)
      '@typescript-eslint/no-wrapper-object-types': 'error', // Запрещает использование Object (можно заменить на object)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Общие JS-правила
      'no-console': 'warn', // Предупреждение при `console.log`
      eqeqeq: ['error', 'always'], // Запрещает `==` (только `===`)
      curly: 'error',
      'no-multi-spaces': 'error',

      // Next.js-специфичные правила
      '@next/next/no-img-element': 'warn',
    },
  },
  {
    files: ['**/*.js', '**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'error', // Запрещает присваивание any переменным
    },
  },
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
];

export default eslintConfig;
