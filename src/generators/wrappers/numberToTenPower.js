export function generate(params = {}, rng = Math.random) {
  const number = params.number ?? 3500000;
  return { type: 'numberToTenPower', params: { number } };
}

export default { generate };
