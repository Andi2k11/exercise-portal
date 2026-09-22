const PREFIXES = [
  { sym: 'T', name: 'tera', scale: 1e12 },
  { sym: 'G', name: 'giga', scale: 1e9 },
  { sym: 'M', name: 'mega', scale: 1e6 },
  { sym: 'k', name: 'kilo', scale: 1e3 },
  { sym: 'h', name: 'hekto', scale: 1e2 }
];

const UNITS = ['Hz','W','B','g','m'];

function randInt(rng, min, max) { return Math.floor(rng()*(max-min+1))+min; }

export default {
  generate(opts={}, rng) {
    const count = opts.count || 10;
    const items = [];
    // ensure rng is a function
    const rnd = (typeof rng === 'function') ? rng : (() => Math.random());
    for (let i=0;i<count;i++) {
      // pick a target prefix (larger scales first so we get meaningful prefixes)
      const p = PREFIXES[randInt(rnd, 0, PREFIXES.length-1)];
      const unit = UNITS[randInt(rnd, 0, UNITS.length-1)];
      // generate a base value in whole units such that when divided by p.scale
      // it yields either an integer or one decimal place
      // pick multiplier so that value/p.scale in range [1,999]
      const displayed = (() => {
        // choose whether integer or one-decimal
        const wantDecimal = (rnd() < 0.5);
        if (wantDecimal) {
          // produce value like 1.5 * scale, i.e., 1.5 -> 1 decimal
          const intPart = randInt(rnd, 1, 999);
          const dec = randInt(rnd, 1, 9);
          const val = (intPart + dec/10) * p.scale;
          return { value: Math.round(val), display: `${intPart},${dec} ${p.sym}${unit}` };
        } else {
          const intPart = randInt(rnd, 1, 9999);
          const val = intPart * p.scale;
          return { value: Math.round(val), display: `${intPart} ${p.sym}${unit}` };
        }
      })();
      // store as item: provide original full-value and expected answer
      const fullValue = String(displayed.value).replace(/\./g,'');
      const answer = displayed.display.replace('.', ',');
      items.push({
        a: String(displayed.value),
        unit: unit,
        expected: answer,
        answer: answer
      });
    }
    return items;
  }
};
