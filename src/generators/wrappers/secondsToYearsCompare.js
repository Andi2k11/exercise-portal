export function generate(params = {}, rng = Math.random) {
  const seconds = params.seconds ?? 1000000000;
  return { type: 'secondsToYearsCompare', params: { seconds } };
}

export default { generate };
