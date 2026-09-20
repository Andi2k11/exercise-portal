const generate = (opts = {}, rng = Math.random) => {
  const count = opts.count || Math.floor(rng() * 30) + 5;
  const capacity = opts.capacity || (Math.floor(rng() * 4) + 2); // 2..5
  const vehicle = opts.vehicle || 'bil';
  const needed = Math.ceil(count / capacity);

  return {
    id: `cap-${Date.now()}`,
    questionText: `${count} personer ska åka ${vehicle}. Varje ${vehicle} tar ${capacity} personer. Hur många ${vehicle}s behöver de minst?`,
    meta: { count, capacity, vehicle },
    answer: needed
  };
};

export { generate };
export default { generate };
