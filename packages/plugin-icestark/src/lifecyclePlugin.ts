import type { Plugin } from 'vite';
import * as babel from '@babel/core';
import type { ParserPlugin } from '@babel/parser';

export interface Entries {
  [index: string]: string | string[];
}

/**
 * Webpack's entry would be { index: ['react-dev-utils/webpackHotDevClient.js', '/src/app''] }
 * in dev mode.
 */
const lifecyclePlugin = (entries: Entries): Plugin => {
  // Turn vite input to js files
  const entryNames = Object.keys(entries)
    .reduce((pre, next) => {
      return [
        ...pre,
        // @ts-ignore
        ...(Array.isArray(entries[next]) ? entries[next] : [entries[next]])
      ];
    }, [])
    // Remove webpack hot dev client in dev
    .filter(entry => !entry.includes('react-dev-utils/webpackHotDevClient'));

  return ({
    name: 'vite-plugin-icestark-lifecycle',
    enforce: 'pre',

    async transform(code, id) {
      const isEntryFile = entryNames.some((name: string) => id.includes(name));

      if (!isEntryFile) {
        return;
      }

      const parserPlugins: ParserPlugin[] = [
        'jsx',
        'importMeta',
        'topLevelAwait',
        'classProperties',
        'classPrivateMethods',
      ];

      if (/\.tsx?$/.test(id)) {
        // when routes file is a typescript file,
        // add ts parser plugins
        parserPlugins.push('typescript');
        parserPlugins.push('decorators-legacy');  // allowing decorators by default
      }
      // Use babel plugin to do entry ast currently.
      // Is it more preferable to use esbuild plugin?
      return babel.transformSync(code, {
        babelrc: false,
        configFile: false,
        filename: id,
        parserOpts: {
          sourceType: 'module',
          allowAwaitOutsideFunction: true,
          plugins: parserPlugins,
        },
        generatorOpts: {
          decoratorsBeforeExport: true
        },
        plugins: [
          [require.resolve('./babelPluginMicroapp'), {
            checkEntryFile: () => true,
            libraryName: 'microApp',
            omitSetLibraryName: true,
          }]
        ],
        sourceFileName: id,
      });

    }
  }

  );
};

export default lifecyclePlugin;
