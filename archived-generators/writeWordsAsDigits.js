export function generate(params = {}, rng = Math.random) {
  const text = params.text ?? '';
  return { type: 'writeWordsAsDigits', params: { text } };
}

export default { generate };
