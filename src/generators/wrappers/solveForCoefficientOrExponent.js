export function generate(params = {}, rng = Math.random) {
  const expr = params.expr ?? 'x * 10^3 = 3.5e6';
  return { type: 'solveForCoefficientOrExponent', params: { expr } };
}

export default { generate };
