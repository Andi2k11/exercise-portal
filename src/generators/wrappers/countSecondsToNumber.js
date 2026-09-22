export function generate(params = {}, rng = Math.random) {
  const n = params.n ?? 1000000;
  return {
    type: 'countSecondsToNumber',
    params: { n }
  };
}

export default { generate };
