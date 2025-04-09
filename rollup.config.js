import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

// Configuration pour les builds
const config = [
  // Build principal (JS minifié)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/easycart.js',
        format: 'umd',
        name: 'EasyCart',
        sourcemap: true
      },
      {
        file: 'dist/easycart.min.js',
        format: 'umd',
        name: 'EasyCart',
        sourcemap: true
      },
      {
        file: 'dist/easycart.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
      terser()
    ]
  },
  // Build pour les types TypeScript
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/easycart.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
];

export default config;
