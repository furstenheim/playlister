import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import sveltePreprocess from 'svelte-preprocess'
import alias from 'rollup-plugin-alias'
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import { typescriptPaths } from 'rollup-plugin-typescript-paths';
import typescript from '@rollup/plugin-typescript'
import serve from 'rollup-plugin-serve'

const plugins = [
  alias({
    resolve: ['.ts'],
    entries: {
      '$lib': __dirname + '/src/lib'
    }
  }),
  typescript(),
  typescriptPaths(),
  resolve({browser: true}),
  svelte({include: 'src/**/*.svelte', preprocess: sveltePreprocess()})];

if (process.env.production) {
  plugins.push(terser());
} else {
  plugins.push(serve({
    contentBase: 'public',
    // https://github.com/thgh/rollup-plugin-serve
    port: 5173,
    open: true
  }))
}

export default {
  input: 'src/main.ts',
  output: {
    file: 'public/build/main.js',
    format: 'iife',
    name: 'app'
  },
  plugins
};