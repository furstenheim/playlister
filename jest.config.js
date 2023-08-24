/** @type {import('ts-jest').JestConfigWithTsJest} */
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  moduleNameMapper: { '^\\$lib$': `${__dirname}/src/lib`, '^\\$lib/(.*)$': `${__dirname}/src/lib/$1` }
};