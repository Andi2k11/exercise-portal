import gen from '../src/generators/roundDecimalByDigits.js';

function sample() {
  const items = gen.generate({ count: 10, min: 0, max: 10 }, { seed: 54321 });
  items.forEach((it, i) => {
    console.log(`${i+1}. a=${it.a.toFixed(4)}, roundTo=${it.roundLabel} (unit=${it.roundUnit}), answer=${it.answer}`);
  });
}

sample();
