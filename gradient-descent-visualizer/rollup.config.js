import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default [
  // ES Module build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/gradient-descent-visualizer.esm.js',
      format: 'es',
      sourcemap: true
    },
    external: ['three'],
    plugins: [
      nodeResolve(),
      production && terser()
    ].filter(Boolean)
  },
  // CommonJS build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/gradient-descent-visualizer.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    external: ['three'],
    plugins: [
      nodeResolve(),
      production && terser()
    ].filter(Boolean)
  },
  // UMD build (for direct browser usage)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/gradient-descent-visualizer.umd.js',
      format: 'umd',
      name: 'GradientDescentVisualizer',
      sourcemap: true,
      globals: {
        three: 'THREE'
      }
    },
    external: ['three'],
    plugins: [
      nodeResolve(),
      production && terser()
    ].filter(Boolean)
  }
]; 