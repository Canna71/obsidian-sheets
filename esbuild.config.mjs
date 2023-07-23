import esbuild from "esbuild";
import process from "process";
import builtins from 'builtin-modules'
import {sassPlugin} from 'esbuild-sass-plugin'
// import svgrPlugin from 'esbuild-plugin-svgr';
import { lessLoader } from 'esbuild-plugin-less';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// import * as path from 'path'

const banner =
`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = (process.argv[2] === 'production');

esbuild.build({
	banner: {
		js: banner,
	},
	entryPoints: ['src/main.ts'],
	bundle: true,
    minify: prod,
	external: [
		'obsidian',
		'electron',
		'@codemirror/autocomplete',
		'@codemirror/collab',
		'@codemirror/commands',
		'@codemirror/language',
		'@codemirror/lint',
		'@codemirror/search',
		'@codemirror/state',
		'@codemirror/view',
		'@lezer/common',
		'@lezer/highlight',
		'@lezer/lr',
		...builtins],
	format: 'cjs',
	watch: !prod,
	target: 'es2016',
	logLevel: "info",
	sourcemap: prod ? false : 'inline',
	treeShaking: true,
	outfile: 'main.js',
    // https://github.com/glromeo/esbuild-sass-plugin#--rewriting-relative-urls
    plugins: [ lessLoader({})],
    loader: {
        '.ts': 'ts',
        '.svg': 'dataurl',
    }
}).catch(() => process.exit(1));

esbuild.build({
	entryPoints: ['styles.scss'],
    outfile: "styles.css",
    // outdir: "/",
	watch: !prod,
    plugins: [sassPlugin()]
}).catch(() => process.exit(1));
//  node_modules/x-data-spreadsheet/src/index.less

/*

{
        precompile(source, pathname) {
          const basedir = path.dirname(pathname)
          return source.replace(/(url\(['"]?)(\.\.?\/)([^'")]+['"]?\))/g, `$1${basedir}/$2$3`)
        }
      }
*/
