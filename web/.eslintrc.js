module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['standard-with-typescript', 'plugin:solid/typescript', 'plugin:tailwindcss/recommended'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: './web/tsconfig.json'
  },
  rules: {
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    'tailwindcss/no-custom-classname': ['error', {
      config: './web/tailwind.config.js'
    }],
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react/jsx-indent': ['error', 2],
    'react/jsx-indent-props': ['error', 2]
  },
  plugins: ['@tanstack/query', 'eslint-plugin-react', 'solid', 'tailwindcss']
}
