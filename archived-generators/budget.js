const generate = (opts = {}) => {
  const budget = opts.budget || 10000;
  const items = opts.items || [
    { name: 'Tröja', price: 279 },
    { name: 'Shorts', price: 105 },
    { name: 'Strumpor', price: 89 },
    { name: 'Fotboll', price: 185 }
  ];

  // simple greedy: buy as many of cheapest items as possible for demonstration
  const sorted = items.slice().sort((a,b)=>a.price-b.price);
  const plan = [];
  let remaining = budget;
  for (const it of sorted) {
    const qty = Math.floor(remaining / it.price);
    if (qty>0) {
      plan.push({ name: it.name, price: it.price, qty });
      remaining -= qty * it.price;
    }
  }

  return {
    id: `budget-${Date.now()}`,
    questionText: `Lag ett inköpsförslag för laget med budget ${budget} kr. Välj bland: ${items.map(i=>i.name+ ' ('+i.price+' kr)').join(', ')}.`,
    meta: { budget, items },
    answer: { plan, remaining }
  };
};

export { generate };
export default { generate };
