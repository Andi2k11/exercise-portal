import { makeRng } from '../core/rng.js';
import intGen from './digitPlaceInt.js';
import decGen from './digitPlaceDec.js';

function generate(opts = {}, rng) {
  const seed = (rng && rng.seed) || Date.now();
  const rngFn = typeof rng === 'function' ? rng : makeRng(seed);
  const count = opts.count || 12;
  const items = [];
  for (let i=0;i<count;i++){
    // randomly pick int or dec variant
    if (rngFn() < 0.5) {
      const ints = intGen.generate({count:1}, rngFn);
      items.push(ints[0]);
    } else {
      const decs = decGen.generate({count:1}, rngFn);
      items.push(decs[0]);
    }
  }
  return items;
}

export default { generate };
