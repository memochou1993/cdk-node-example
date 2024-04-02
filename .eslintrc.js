module.exports = {
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'import/prefer-default-export': 'off',
    'no-console': 'off',
    'no-new': 'off',
  },
  ignorePatterns: [
    '**/*.js',
  ],
};
