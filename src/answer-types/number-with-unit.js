export default {
  type: 'number-with-unit',
  mount({ answerEl, inputEl, task, config, onSubmit }) {
    answerEl.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'nwu-wrapper';
    const label = document.createElement('div'); label.textContent = 'Skriv tal och prefix+enhet (ex: 15 MHz eller 1,5 MHz)'; label.style.marginBottom='8px';
    const input = document.createElement('input'); input.type='text'; input.id='value-field'; input.setAttribute('aria-label','Svar'); input.className='form-control';
    wrapper.appendChild(label); wrapper.appendChild(input);
    if (inputEl) { inputEl.innerHTML=''; inputEl.appendChild(wrapper); }

    return {
      getAnswer() { return input.value.trim(); },
      reset() { input.value = ''; },
      setDisabled(disabled) { input.disabled = !!disabled; },
      destroy() { if (inputEl) inputEl.innerHTML = ''; }
    };
  },
  check(answer, task) {
    if (!answer || String(answer).trim() === '') return { correct:false, reason:'empty', expected: task.answer };
    // Normalize: replace dot with comma display, accept both
    const raw = String(answer).trim().replace(/\s+/g,' ');
    // Expected format: number (comma allowed) + space + prefix+unit (e.g. MHz)
    const m = raw.match(/^([0-9]+(?:[.,][0-9])?)\s*([TGMkh][A-Za-z]+)$/);
    if (!m) return { correct:false, reason:'format', expected: task.answer };
    const num = Number(m[1].replace(',', '.'));
    const unit = m[2];
    const expected = (task.answer || '').trim();
    // Compare normalized numeric + unit
    const expMatch = expected.match(/^([0-9]+(?:[.,][0-9])?)\s*([TGMkh][A-Za-z]+)$/);
    if (!expMatch) return { correct:false, reason:'no-facit', expected: task.answer };
    const expNum = Number(expMatch[1].replace(',', '.'));
    const expUnit = expMatch[2];
    const numOk = Math.abs(num - expNum) < 1e-9;
    const unitOk = unit === expUnit;
    return { correct: numOk && unitOk, reason: numOk && unitOk ? null : 'wrong', expected: task.answer };
  }
};
