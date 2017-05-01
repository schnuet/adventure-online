// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'src/scripts/game.js',
  format: 'cjs',
  dest: 'dist/bundle.js', // equivalent to --output,
  plugins: [ resolve() ],
  sourceMap: true
};
