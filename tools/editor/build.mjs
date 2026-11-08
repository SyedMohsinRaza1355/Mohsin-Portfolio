import { build } from 'esbuild';
await build({ entryPoints: ['src/editor-entry.js'], bundle: true, minify: true, format: 'iife', outfile: '../../assets/admin/editor-bundle.js', target: 'es2020' });
await build({ entryPoints: ['src/sanitize-entry.js'], bundle: true, minify: true, format: 'iife', outfile: '../../assets/sanitize-bundle.js', target: 'es2020' });
console.log('built');
