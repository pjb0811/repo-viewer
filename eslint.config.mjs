import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import { defineConfig, globalIgnores } from 'eslint/config';

// Feature-Sliced Design layers, high to low. A layer may import itself and
// the layers below it, and only through the target slice's index.ts barrel.
const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  // The root `app/` folder holds Next.js routes that only re-export from
  // `src/`, so it belongs to no layer.
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      // `src/app` has segments rather than slices, so the whole layer is one
      // element and its segments import each other freely.
      'boundaries/elements': layers.map(type => ({
        type,
        pattern: type === 'app' ? 'src/app' : `src/${type}/*`,
      })),
      'import/resolver': {
        typescript: { alwaysTryTypes: true, project: './tsconfig.json' },
      },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: layers.map((type, index) => ({
            from: { element: { type } },
            allow: {
              to: {
                element: {
                  type: layers.slice(index),
                  fileInternalPath: 'index.ts',
                },
              },
            },
          })),
        },
      ],
    },
  },
  eslintConfigPrettier,
]);

export default eslintConfig;
