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

export function getGenerator(name) {
  return registry.get(name) || null;
}

export default { getGenerator };
