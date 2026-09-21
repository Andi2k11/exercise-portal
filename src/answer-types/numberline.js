export default {
  type: 'numberline',
  defaultKeys: ['digits','comma','backspace','clear','enter'],
  mount({ answerEl, inputEl, task, config, keys, onSubmit }) {
    answerEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1000 200');
    svg.style.width = '100%'; svg.style.height = '160px'; svg.setAttribute('aria-hidden','true');
    const start = Number(task.a || 0);
    const end = Number(task.b || 2);
    const step = Number(task.step || 0.1);
    const divisions = Math.round((end - start) / step);
    // draw baseline
    const ns = 'http://www.w3.org/2000/svg';
    const line = document.createElementNS(ns,'line'); line.setAttribute('x1','50'); line.setAttribute('y1','100'); line.setAttribute('x2','950'); line.setAttribute('y2','100'); line.setAttribute('stroke','#333'); line.setAttribute('stroke-width','2'); svg.appendChild(line);
    // draw ticks
    for (let i=0;i<=divisions;i++){
      const x = 50 + (900 * (i / divisions));
      const isIntegerPos = Number.isInteger(start + i*step);
      // longer ticks for integer positions
      const tick = document.createElementNS(ns,'line'); tick.setAttribute('x1',String(x)); tick.setAttribute('y1', isIntegerPos ? '80' : '92'); tick.setAttribute('x2',String(x)); tick.setAttribute('y2', isIntegerPos ? '120' : '108'); tick.setAttribute('stroke','#333'); tick.setAttribute('stroke-width','1'); svg.appendChild(tick);
      const lbl = document.createElementNS(ns,'text'); lbl.setAttribute('x',String(x)); lbl.setAttribute('y','78'); lbl.setAttribute('text-anchor','middle'); lbl.setAttribute('font-size','12');
      // Show labels for start and end, and for intermediate ticks when divisions is small
      const stepStr = String(step);
      const decimals = (stepStr.indexOf('.') >= 0) ? stepStr.split('.')[1].length : 0;
      if (i === 0 || i === divisions) {
        lbl.textContent = String((start + i*step).toFixed(decimals)).replace('.',',');
      } else if (divisions <= 10) {
        // show intermediate labels when there aren't too many
        lbl.textContent = String((start + i*step).toFixed(decimals)).replace('.',',');
      } else {
        lbl.textContent = '';
      }
      svg.appendChild(lbl);
    }
    // draw marker (arrow) at index
    const idx = Number(task.idx || 0);
    const mx = 50 + (900 * (idx / divisions));
    const arrow = document.createElementNS(ns,'polygon');
    // Arrow tip should touch the baseline (y=100). Draw triangle with tip at the line.
    const points = `${mx},100 ${mx-8},120 ${mx+8},120`;
    arrow.setAttribute('points',points); arrow.setAttribute('fill','#c44'); svg.appendChild(arrow);
    answerEl.appendChild(svg);

    // input area: leave inputEl empty — core uses #value-field for entry. Provide a visible label
    if (inputEl) {
      inputEl.innerHTML = '';
      const p = document.createElement('div'); p.textContent = 'Skriv värdet som pilen visar (decimalkomma)'; inputEl.appendChild(p);
    }

    return {
      getAnswer() { return (document.getElementById('value-field') || { value: '' }).value.trim(); },
      reset() {},
      setDisabled(disabled) {},
      destroy() { answerEl.innerHTML=''; if (inputEl) inputEl.innerHTML = ''; }
    };
  },
  check(answer, task, config) {
    if (!answer || String(answer).trim() === '') return { correct:false, reason:'empty', expected: task.answer };
    // normalize common separators: accept comma, dot, or 'm' as decimal separator
    const norm = String(answer).trim().replace(/\s+/g,'').replace(/m/,',').replace(',', '.');
    const parsed = Number(norm);
    if (Number.isNaN(parsed)) return { correct:false, reason:'parse', expected: task.answer };
    const expected = Number(String(task.answer).replace(',', '.'));
    const ok = Math.abs(parsed - expected) < 1e-9;
    return { correct: ok, reason: ok ? null : 'wrong', expected: task.answer };
  }
};
