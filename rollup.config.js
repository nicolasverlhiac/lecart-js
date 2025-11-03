import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import copy from 'rollup-plugin-copy';

// Configuration pour les builds
const config = [
  // Build principal (JS minifié)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/lecart.js',
        format: 'umd',
        name: 'LeCart',
        sourcemap: true
      },
      {
        file: 'dist/lecart.min.js',
        format: 'umd',
        name: 'LeCart',
        sourcemap: true
      },
      {
        file: 'dist/lecart.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
      terser(),
      // Copier le CSS dans le dossier dist
      copy({
        targets: [
          { src: 'src/styles/lecart.css', dest: 'dist' }
        ]
      })
    ]
  },
  // Build pour les types TypeScript
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/lecart.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
];

export default config;
