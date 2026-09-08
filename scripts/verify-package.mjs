import { access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const packageRoot = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('package.json', packageRoot), 'utf8'));

await Promise.all([
  access(new URL(manifest.main, packageRoot)),
  access(new URL(manifest.types, packageRoot)),
]);

const packageExports = createRequire(import.meta.url)(fileURLToPath(new URL(manifest.main, packageRoot)));
const expectedExports = ['configure', 'isSignatureVerified', 'verifySignature'];

for (const name of expectedExports) {
  if (typeof packageExports[name] !== 'function') {
    throw new Error(`Package entry point does not export ${name}`);
  }
}
