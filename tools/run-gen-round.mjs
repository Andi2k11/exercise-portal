import gen from '../src/generators/roundByDigits.js';

function sample() {
  const items = gen.generate({ count: 10, min: 100, max: 99999 }, { seed: 12345 });
  items.forEach((it, i) => {
    console.log(`${i+1}. a=${it.a}, roundTo=${it.roundLabel} (unit=${it.roundUnit}), answer=${it.answer}`);
  });
}

sample();
