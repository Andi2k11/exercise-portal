export function generate(params = {}, rng = Math.random) {
  const value = params.value ?? 1000000;
  return { type: 'convertSwedishToAmericanLargeNumber', params: { value } };
}

export default { generate };
