const generate = (opts = {}, rng = Math.random) => {
  const unit = opts.unit || 'tiotal';
  const target = (typeof opts.target === 'number') ? opts.target : Math.floor(rng() * 20) * (unit === 'tiotal' ? 10 : 1);

  let lower, upper;
  if (unit === 'tiotal') {
    lower = target - 5;
    upper = target + 4;
  } else if (unit === 'hundratal') {
    lower = target - 50;
    upper = target + 49;
  } else {
    lower = target - 0;
    upper = target + 0;
  }

  return {
    id: `round-${Date.now()}`,
    questionText: `Skriv det minsta och det största naturliga tal som avrundas till ${target} när man avrundar till ${unit}.`,
    meta: { unit, target },
    answer: { lower, upper }
  };
};

export { generate };
export default { generate };
