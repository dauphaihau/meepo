// @ts-check

import ts from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import vue from 'eslint-plugin-vue';
import js from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import tailwind from 'eslint-plugin-tailwindcss';
import * as parserVue from 'vue-eslint-parser';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.strict,
  ...ts.configs.stylistic,
  ...vue.configs['flat/recommended'],
  ...tailwind.configs['flat/recommended'],
  {
    files: [
      '**/*.vue',
      '**/*.ts',
      '**/*.js',
    ],
    plugins: {
      '@stylistic': stylistic,
      'import-x': importX,
    },
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        ecmaVersion: 'latest',
        parser: ts.parser,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      // Spacing
      '@stylistic/func-call-spacing': 'error',
      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      }],
      '@stylistic/space-in-parens': ['error', 'never'],
      '@stylistic/no-mixed-spaces-and-tabs': 'error',
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/no-whitespace-before-property': 'error',
      '@stylistic/no-multi-spaces': 'error',
      '@stylistic/type-generic-spacing': 'error',
      // '@stylistic/type-named-tuple-spacing ': 'error',

      // Semi
      '@stylistic/semi': ['error', 'always',
        {
          omitLastInOneLineBlock: true,
          omitLastInOneLineClassBody: true,
        },
      ],

      // Indent
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],

      // Commas
      '@stylistic/comma-dangle': ['error', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'never',
        exports: 'never',
        functions: 'never',
      }],

      // Line breaks
      '@stylistic/object-curly-newline': ['error', {
        multiline: true,
        minProperties: 4,
        consistent: true,
      }],
      '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],

      // Quotes
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/quote-props': ['error', 'as-needed'],

      // Brackets
      '@stylistic/new-parens': 'error',
      '@stylistic/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],

      // Operators
      '@stylistic/multiline-ternary': ['error', 'always-multiline'],
      '@stylistic/no-mixed-operators': 'error',
      '@stylistic/operator-linebreak': ['error', 'after'],
      '@stylistic/dot-location': ['error', 'property'],

      // Disallow
      '@stylistic/no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],
      '@stylistic/no-floating-decimal': 'error',
      '@stylistic/no-tabs': 'off',

      // Misc
      '@stylistic/max-statements-per-line': ['error', { max: 1 }],
      '@stylistic/one-var-declaration-per-line': ['error', 'initializations'],

      // Vue
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/max-len': ['error',
        {
          code: 120,
          template: 110,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreComments: true,
          ignoreTemplateLiterals: true,
          ignoreHTMLAttributeValues: true,
        },
      ],
      'vue/no-v-html': 'off',

      // ts
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',

      // tailwind
      'tailwindcss/no-custom-classname': 'off',

      // Others
      'no-undef': 'off', // tsconfig noUnusedLocals handle this
      'no-debugger': 'error',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    },
  },
  {
    ignores: [
      '**/*.config.js',
      '**/*.config.ts',
      '!**/eslint.config.js',
      '*.d.ts',
      '**/dist/',
      '.idea/',
      '.gitignore',
      'public/*',
      'src/assets/**',
    ],
  }
);
