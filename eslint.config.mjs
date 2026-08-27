import next from 'eslint-config-next';

export default [
  { ignores: ['.next/**', 'node_modules/**', 'design/**', 'coverage/**', 'playwright-report/**'] },
  ...next(),
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "Literal[value=/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/]",
          message:
            'Raw hex colors are not allowed in components. Reference a design token from styles/tokens.css.',
        },
      ],
    },
  },
];
