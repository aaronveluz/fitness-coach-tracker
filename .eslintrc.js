// ─────────────────────────────────────────────────────────────────────────────
// .eslintrc.js — Root ESLint config (applies to all workspaces)
// Must be .js (not .json) so we can include comments explaining each rule.
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // disables ESLint rules that conflict with Prettier formatting
  ],
  rules: {
    // Warn on unused variables — catches dead code. Variables prefixed with _
    // are intentionally unused (e.g. _next in Express error handlers).
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

    // Warn on `any` type — encourages explicit types for long-term maintainability.
    // Set to 'warn' not 'error' to avoid blocking during rapid development.
    '@typescript-eslint/no-explicit-any': 'warn',

    // Disallow console.log in committed code — use the Pino logger instead.
    // console.warn and console.error are allowed for critical startup messages.
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // Enforce consistent returns — functions should always or never return a value.
    'consistent-return': 'warn',
  },
  env: {
    node: true,
    es2022: true,
    browser: true,
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.js', // ignore compiled JS output; we lint TS source only
  ],
  overrides: [
    {
      // Re-enable JS linting for config files and scripts
      files: ['*.config.js', 'scripts/**/*.js', 'database/**/*.js', '.eslintrc.js'],
      rules: { 'no-console': 'off' },
      env: { node: true },
    },
  ],
};
