module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['standard-with-typescript'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  rules: {
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off'
  },
  plugins: [],
  ignorePatterns: [
    '**/*.js',
    '**/*.yml',
    '**/*.yaml',
    '**/*.log',
    '**/*.json',
    '**/*.css',
    '**/*.md',
    '**/*.html',
    '**/*.lock',
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.svg',
    '**/*.ico',
    'node_modules/**',
    'coverage/**',
    '.vscode/**'
  ]
}
