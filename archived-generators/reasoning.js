const generate = (opts = {}) => {
  // simple fixed example based on user's sample
  const numbers = opts.numbers || [3.7, 3.423, 3.98];
  const personA = opts.personA || 'Sandra';
  const personB = opts.personB || 'Dilan';
  const responseA = `${numbers[1]} är störst för att ${String(numbers[1]).split('.')[1]} är större än ${String(numbers[0]).split('.')[1]} och ${String(numbers[2]).split('.')[1]}.`;
  const responseB = `${numbers[0]} är störst för att det har minst antal decimaler.`;

  return {
    id: `reason-${Date.now()}`,
    questionText: `Vilket av talen i rutan är störst? ${numbers.join('  ')}\n\n${personA} säger:\n> ${responseA}\n\n${personB} säger:\n> ${responseB}\n\nVad är fel i resonemangen?`,
    meta: { numbers },
    answer: { correct: 3.98, explanation: '3.98 är störst eftersom 98 hundradelar > 7 tiondelar > 423 tusendelar' }
  };
};

export { generate };
export default { generate };
