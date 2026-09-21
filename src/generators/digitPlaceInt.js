import { makeRng } from '../core/rng.js';

function fmtChoices(shuffled) {
  return shuffled.map(s => s);
}

function generate(opts = {}, rng) {
  const seed = (rng && rng.seed) || Date.now();
  const rngFn = typeof rng === 'function' ? rng : makeRng(seed);
  const count = opts.count || 12;
  const items = [];
  const placeNames = ['entals','tiotals','hundratals','tusentals','tiotusentals'];
  for (let i=0;i<count;i++){
    // generate a 5-digit number with all different digits and non-zero leading digit
    let digits;
    do {
      digits = [];
      while (digits.length < 5) {
        const d = Math.floor(rngFn()*10);
        // avoid leading zero
        if (digits.length === 0 && d === 0) continue;
        if (!digits.includes(d)) digits.push(d);
      }
    } while (digits.length !== 5);
    const numStr = digits.join('');
    // pick an index to ask about, never the ten-thousands (index 0)
    const idx = 1 + Math.floor(rngFn()*4); // 1..4
    const digit = digits[idx];
    // idx is 1..4 corresponding to positions [1]=tusental, [2]=hundratal, [3]=tiotal, [4]=ental
    const correct = ['tusental','hundratal','tiotal','ental'][idx-1];
    // build shuffled options
    const optsList = ['tusental','hundratal','tiotal','ental'];
    // shuffle
    for (let s = optsList.length-1; s>0; s--) {
      const j = Math.floor(rngFn()*(s+1)); [optsList[s], optsList[j]] = [optsList[j], optsList[s]];
    }
    items.push({
      a: numStr,
      digitIndex: idx,
      digitValue: String(digit),
      choices: optsList,
      answer: correct,
      template: `Vilken plats har siffran ${digit} i ${numStr}?`
    });
  }
  return items;
}

export default { generate };
