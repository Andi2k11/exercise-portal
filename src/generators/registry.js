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
// problemSolving registry was archived; avoid importing missing module
import { makeRng } from '../core/rng.js';
import numberlinePoint from './numberlinePoint.js';
import numberline from '../answer-types/numberline.js';
import digitPlaceInt from './digitPlaceInt.js';
import digitPlaceDec from './digitPlaceDec.js';
import digitPlaceMixed from './digitPlaceMixed.js';
// Archived generator wrappers and problem-solving modules removed from imports
import prefixStoraTal from './wrappers/prefixStoraTal.js';

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

registry.set('numberlinePoint', numberlinePoint);
// Register answer-type alias so loader can access if needed
registry.set('numberline', numberline);
registry.set('digitPlaceInt', digitPlaceInt);
registry.set('digitPlaceDec', digitPlaceDec);
registry.set('digitPlaceMixed', digitPlaceMixed);
// Helper: ensure generate returns an array of items
const wrap = (mod) => ({ generate: (opts, rng) => {
  try {
    const res = mod && typeof mod.generate === 'function' ? mod.generate(opts, rng) : null;
    if (Array.isArray(res)) return res;
    if (!res) return [];
    // If module returned an object like { type, params }, convert to a displayable item
    if (res.type && res.params) {
      const desc = `${res.type}: ${Object.keys(res.params).length ? JSON.stringify(res.params) : ''}`;
      return [{ a: desc, answer: '' }];
    }
    // If it's a plain object, return as single item
    return [res];
  } catch (e) { console.error('Generator wrapper error', e); return []; }
}});

// Archived modules are intentionally not registered here.

// New generator for Matte Direkt 9 Kap 1: prefixStoraTal
registry.set('prefixStoraTal', wrap(prefixStoraTal));

// Problem solving subtypes (Matte Direkt 7 Kap 1)
const withRng = (fn) => (opts, rng) => {
  let rngFn = rng;
  if (!rngFn || typeof rngFn !== 'function') {
    const seed = rng && rng.seed ? rng.seed : Date.now();
    rngFn = makeRng(seed);
  }
  return fn(opts, rngFn);
};
// The problem-solving registry was archived. Provide safe stub generators
registry.set('lcm', { generate: (opts) => [] });
registry.set('roundingInterval', { generate: (opts) => [] });
// Note: top-level problem-solving generator removed

export function getGenerator(name) {
  return registry.get(name) || null;
}

export default { getGenerator };
