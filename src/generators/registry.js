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
import numberlinePoint from './numberlinePoint.js';
import numberline from '../answer-types/numberline.js';
import digitPlaceInt from './digitPlaceInt.js';
import digitPlaceDec from './digitPlaceDec.js';
import digitPlaceMixed from './digitPlaceMixed.js';
import countSecondsToNumber from './wrappers/countSecondsToNumber.js';
import secondsToYearsCompare from './wrappers/secondsToYearsCompare.js';
import powerOfTwoAtSquare from './wrappers/powerOfTwoAtSquare.js';
import totalGrainsOnBoard from './wrappers/totalGrainsOnBoard.js';
import ratioBetweenPowersOfTen from './wrappers/ratioBetweenPowersOfTen.js';
import writeWordsAsDigits from './wrappers/writeWordsAsDigits.js';
import convertSwedishToAmericanLargeNumber from './wrappers/convertSwedishToAmericanLargeNumber.js';
import removePrefixBytes from './wrappers/removePrefixBytes.js';
import powerPrefixToWatts from './wrappers/powerPrefixToWatts.js';
import chooseAppropriatePrefix from './wrappers/chooseAppropriatePrefix.js';
import multiplyTenPowers from './wrappers/multiplyTenPowers.js';
import tenPowerToNumber from './wrappers/tenPowerToNumber.js';
import numberToTenPower from './wrappers/numberToTenPower.js';
import computeTenPowerMultiplication from './wrappers/computeTenPowerMultiplication.js';
import toScientificNotation from './wrappers/toScientificNotation.js';
import scientificToNumber from './wrappers/scientificToNumber.js';
import identifyScientificNotationItems from './wrappers/identifyScientificNotationItems.js';
import multiplyScientificNotation from './wrappers/multiplyScientificNotation.js';
import divideScientificNotation from './wrappers/divideScientificNotation.js';
import solveForCoefficientOrExponent from './wrappers/solveForCoefficientOrExponent.js';

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

registry.set('countSecondsToNumber', countSecondsToNumber);
registry.set('secondsToYearsCompare', secondsToYearsCompare);
registry.set('powerOfTwoAtSquare', powerOfTwoAtSquare);
registry.set('totalGrainsOnBoard', totalGrainsOnBoard);
registry.set('ratioBetweenPowersOfTen', ratioBetweenPowersOfTen);
registry.set('writeWordsAsDigits', writeWordsAsDigits);
registry.set('convertSwedishToAmericanLargeNumber', convertSwedishToAmericanLargeNumber);
registry.set('removePrefixBytes', removePrefixBytes);
registry.set('powerPrefixToWatts', powerPrefixToWatts);
registry.set('chooseAppropriatePrefix', chooseAppropriatePrefix);
registry.set('multiplyTenPowers', multiplyTenPowers);
registry.set('tenPowerToNumber', tenPowerToNumber);
registry.set('numberToTenPower', numberToTenPower);
registry.set('computeTenPowerMultiplication', computeTenPowerMultiplication);
registry.set('toScientificNotation', toScientificNotation);
registry.set('scientificToNumber', scientificToNumber);
registry.set('identifyScientificNotationItems', identifyScientificNotationItems);
registry.set('multiplyScientificNotation', multiplyScientificNotation);
registry.set('divideScientificNotation', divideScientificNotation);
registry.set('solveForCoefficientOrExponent', solveForCoefficientOrExponent);

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
