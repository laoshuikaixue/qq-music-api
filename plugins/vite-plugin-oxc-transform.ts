import type { Plugin } from 'vite';
import { transformSync } from 'oxc-transform';

const TS_EXTENSIONS = /\.(ts|tsx|mts|cts)$/;

export function oxcTransform(): Plugin {
  return {
    name: 'vite-plugin-oxc-transform',
    enforce: 'pre',

    transform(code, id) {
      if (!TS_EXTENSIONS.test(id)) return;

      const { code: transformed, errors } = transformSync(id, code, {
        lang: id.endsWith('.tsx') ? 'tsx' : 'ts',
        typescript: { onlyRemoveTypeImports: true },
      });

      if (errors.length > 0) {
        this.error(`oxc-transform failed on ${id}: ${errors[0].message}`);
      }

      return { code: transformed, map: null };
    },
  };
}

export default oxcTransform;
