import { formatDecimal } from "../../core/numbers.js";

const PREFIXES = [
  { sym: 'T', name: 'tera', scale: 1e12 },
  { sym: 'G', name: 'giga', scale: 1e9 },
  { sym: 'M', name: 'mega', scale: 1e6 },
  { sym: 'k', name: 'kilo', scale: 1e3 },
  { sym: 'h', name: 'hekto', scale: 1e2 }
];

// Allowed units and unit-specific maximum base (exclusive) for random integers
const UNIT_RANGES = {
  g: 1000000, // grams: integers under 1 000 000
  W: 10000000000000, // watts: under 10 000 000 000 000
  B: 10000000000000, // bytes
  Wh: 10000000000000, // watt-hours
  Hz: 10000000000000 // keep Hz large by default
};
const UNITS = Object.keys(UNIT_RANGES);

function randInt(rng, min, max) { return Math.floor(rng()*(max-min+1))+min; }

export default {
  generate(opts={}, rng) {
    const count = opts.count || 10;
    const items = [];
    // ensure rng is a function
    const rnd = (typeof rng === 'function') ? rng : (() => Math.random());
    for (let i=0; i<count; i++) {
      // pick a target prefix (larger scales first so we get meaningful prefixes)
      const p = PREFIXES[randInt(rnd, 0, PREFIXES.length-1)];
      // allow exercise to restrict units via opts.units
      const availableUnits = Array.isArray(opts.units) && opts.units.length ? opts.units : UNITS;
      const unit = availableUnits[randInt(rnd, 0, availableUnits.length-1)];
      const maxBase = UNIT_RANGES[unit] || 1000000;
      // generate a base value in whole units such that when divided by p.scale
      // it yields either an integer or one decimal place
      // pick multiplier so that value/p.scale in range [1,999]
      const displayed = (() => {
        // choose whether converted value (with prefix) is integer or one-decimal
        const wantDecimal = (rnd() < 0.5);
        if (wantDecimal) {
          // choose integer part based on maxBase so that displayedNumber * scale <= maxBase
          // displayedNumber = X.Y where X in [1, 999]
          const maxDisplayed = Math.floor(maxBase / p.scale);
          const intMax = Math.max(1, Math.min(999, maxDisplayed));
          const intPart = randInt(rnd, 1, intMax);
          const dec = randInt(rnd, 0, 9);
          const displayedNumber = Number(`${intPart}.${dec}`);
          const val = Math.round(displayedNumber * p.scale);
          const decStr = String(dec);
          return { value: val, display: `${intPart},${decStr} ${p.sym}${unit}` };
        } else {
          const maxDisplayed = Math.floor(maxBase / p.scale);
          const intMax = Math.max(1, Math.min(999, maxDisplayed));
          const intPart = randInt(rnd, 1, intMax);
          const val = intPart * p.scale;
          return { value: val, display: `${intPart} ${p.sym}${unit}` };
        }
      })();
      // store as item: provide original full-value and expected answer
      const fullValue = String(displayed.value).replace(/\./g,'');
      const answer = displayed.display.replace('.', ',');
      // Make display plain text (Swedish decimal comma), no LaTeX: show base value + unit
      const displayPlain = `${formatDecimal(String(displayed.value))} ${unit}`;
      // Provide fields `a` and `b` expected by loader display logic
      items.push({
        a: String(displayed.value),
        b: unit,
        display: displayPlain,
        expected: answer,
        answer: answer
      });
    }
    return items;
  }
};
