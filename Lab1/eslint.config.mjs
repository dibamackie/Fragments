// eslint.config.mjs
import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node, // 👈 enables process, __dirname, etc.
    },
  },
  pluginJs.configs.recommended,
];
