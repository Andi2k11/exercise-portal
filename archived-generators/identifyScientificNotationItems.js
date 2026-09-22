export function generate(params = {}, rng = Math.random) {
  const list = params.list ?? ['3.75e7','3500000','37.5e6'];
  return { type: 'identifyScientificNotationItems', params: { list } };
}

export default { generate };
