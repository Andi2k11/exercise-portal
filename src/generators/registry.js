import multGen from './multiplyByPowersOf10.js';
import multDecGen from './multiplyDecimalByPowersOf10.js';
import mixedGen from './mixedMultiplyByPowersOf10.js';
import divInt from './divideByPowersOf10.js';
import divDec from './divideDecimalByPowersOf10.js';
import divMixed from './mixedDivideByPowersOf10.js';
import roundGen from './roundByDigits.js';
import roundDec from './roundDecimalByDigits.js';
import basicOps from './basicOps.js';
import divisibility from './divisibility.js';
import psRegistry from './problemSolving/registry.js';
import { makeRng } from '../core/rng.js';

const registry = new Map();
registry.set('multiplyByPowersOf10', multGen);
registry.set('multiplyDecimalByPowersOf10', multDecGen);
registry.set('mixedMultiplyByPowersOf10', mixedGen);
registry.set('divideByPowersOf10', divInt);
registry.set('divideDecimalByPowersOf10', divDec);
registry.set('mixedDivideByPowersOf10', divMixed);
registry.set('roundByDigits', roundGen);
registry.set('roundDecimalByDigits', roundDec);
registry.set('basicOps', basicOps);
registry.set('divisibility', divisibility);

// Problem solving subtypes (Matte Direkt 7 Kap 1)
const withRng = (fn) => (opts, rng) => {
  let rngFn = rng;
  if (!rngFn || typeof rngFn !== 'function') {
    const seed = rng && rng.seed ? rng.seed : Date.now();
    rngFn = makeRng(seed);
  }
  return fn(opts, rngFn);
};

registry.set('lcm', { generate: withRng((opts, rngFn) => psRegistry.generate('lcm', opts, rngFn)) });
registry.set('roundingInterval', { generate: withRng((opts, rngFn) => psRegistry.generate('roundingInterval', opts, rngFn)) });
registry.set('actualValue', { generate: withRng((opts, rngFn) => psRegistry.generate('actualValue', opts, rngFn)) });
registry.set('capacity', { generate: withRng((opts, rngFn) => psRegistry.generate('capacity', opts, rngFn)) });
registry.set('budget', { generate: withRng((opts, rngFn) => psRegistry.generate('budget', opts, rngFn)) });
registry.set('reasoning', { generate: withRng((opts, rngFn) => psRegistry.generate('reasoning', opts, rngFn)) });
// Note: top-level problem-solving generator removed

export function getGenerator(name) {
  return registry.get(name) || null;
}

export default { getGenerator };
