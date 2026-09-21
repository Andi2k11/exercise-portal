import { makeRng } from '../core/rng.js';

function generate(opts = {}, rng) {
  const seed = (rng && rng.seed) || Date.now();
  const rngFn = typeof rng === 'function' ? rng : makeRng(seed);
  const count = opts.count || 12;
  const items = [];
  const placeNames = ['tiondel','hundradel','tusendel','tiotusendel'];
  for (let i=0;i<count;i++){
    // generate a number <9 with 4 decimals
    const intPart = Math.floor(rngFn()*9);
    // ensure decimals are digits, can repeat
    const d1 = Math.floor(rngFn()*10);
    const d2 = Math.floor(rngFn()*10);
    const d3 = Math.floor(rngFn()*10);
    const d4 = Math.floor(rngFn()*10);
    const numStr = `${intPart},${d1}${d2}${d3}${d4}`;
    // pick a decimal index 1..4 (corresponding to d1..d4). Never pick entals or tiotusendel? requirement: never entals or ten-thousandth -> so avoid ental and tiotusendel (last digit)
    const idx = 1 + Math.floor(rngFn()*3); // 1..3 -> tiondel, hundradel, tusendel
    const digitValue = [d1,d2,d3,d4][idx-1];
    const correct = placeNames[idx-1];
    // build choices and shuffle
    const choices = ['tiondel','hundradel','tusendel'];
    for (let s=choices.length-1;s>0;s--){ const j=Math.floor(rngFn()*(s+1)); [choices[s],choices[j]] = [choices[j],choices[s]]; }
    items.push({ a: numStr, digitIndex: idx, digitValue: String(digitValue), choices, answer: correct, template: `Vilken plats har siffran ${digitValue} i ${numStr}?` });
  }
  return items;
}

export default { generate };
