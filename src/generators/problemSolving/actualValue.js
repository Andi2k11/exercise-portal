const generate = (opts = {}, rng = Math.random) => {
  const rounded = (typeof opts.rounded === 'number') ? opts.rounded : Math.floor(rng() * 20) + 1;
  const unit = opts.unit || 'km';
  // assume standard: 1 km shown -> meters in [rounded*1000 - 500, rounded*1000 + 499]
  const lower = rounded * 1000 - 500;
  const upper = rounded * 1000 + 499;

  return {
    id: `actual-${Date.now()}`,
    questionText: `Skylten säger att det är ${rounded} ${unit} till platsen. Hur många meter kan det vara som kortast och som längst?`,
    meta: { rounded, unit },
    answer: { lower, upper }
  };
};

export { generate };
export default generate;
