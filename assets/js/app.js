// Minimal app script for layout shell and dev mock panels.
const getMock = () => {
  try { return new URLSearchParams(location.search).get('mock'); } catch (e) { return null; }
};

function buildPad(container) {
  if (!container) return;
  const rows = [
    ['(', ')', 'xⁿ', '√'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '/'],
    ['1', '2', '3', '-'],
    ['0', ',', '⌫', '+'],
    ['◀', '▶', 'C', 'Svara']
  ];
  rows.forEach(r => {
    const row = document.createElement('div'); row.className = 'pad-row';
    r.forEach(label => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'pad-btn'; btn.textContent = label;
      row.appendChild(btn);
    });
    container.appendChild(row);
  });
}
  const root = document.querySelector('.full-card');
  const pad = document.getElementById('mock-pad');
  buildPad(pad);

  const mock = getMock();
  if (mock) {
    // reveal both panels for visual checking
    root.classList.remove('no-exercise');
    const left = document.querySelector('.split-left .inner-card .card-body');
    const right = document.querySelector('.split-right .inner-card .card-body');
    if (mock === 'numeric') {
      left.innerHTML = '<div style="padding:12px">Numeric answer area (mock)</div>';
      right.innerHTML = '<div style="padding:12px">Keypad mock</div>';
    } else if (mock === 'sort') {
      left.innerHTML = '<div style="padding:12px">Sortable list (mock)</div>';
      right.innerHTML = '<div style="padding:12px">Sorting helper (mock)</div>';
    } else if (mock === 'numberline') {
      left.innerHTML = '<div style="padding:12px">Number line strip (mock)</div>';
      right.innerHTML = '<div style="padding:12px">Controls (mock)</div>';
    } else if (mock === 'coordinate') {
      left.innerHTML = '<div style="padding:12px">Coordinate grid (mock)</div>';
      right.innerHTML = '<div style="padding:12px">Coordinate tools (mock)</div>';
    } else if (mock === 'expression') {
      left.innerHTML = '<div style="padding:12px">Expression display (mock)</div>';
      right.innerHTML = '<div style="padding:12px">Math field + keypad (mock)</div>';
    }
  }
  // Hook value input to parse/format using numbers util when available
  let valueField = document.getElementById('value-field');
  const flash = document.getElementById('flash-msg');
  if (!valueField) {
    console.warn('value-field not found at DOMContentLoaded; will try again later');
    // Try to find it later (in case loader replaced DOM)
    const retry = setInterval(() => { valueField = document.getElementById('value-field'); if (valueField) { clearInterval(retry); attach(); } }, 200);
  } else {
    attach();
  }
  let numbersModule = null;
  async function ensureNumbers() {
    if (!numbersModule) {
      try { numbersModule = await import('../../src/core/numbers.js'); } catch (e) { console.warn('Failed to import numbers module', e); numbersModule = null; }
    }
    return numbersModule;
  }

  function attach() {
    try {
      // Validate only on Enter key
      valueField.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          await validateValue();
        }
      });

      // Hide error flash when user starts typing a new answer
      valueField.addEventListener('input', (e) => {
        if (flash && flash.classList.contains('error')) {
          flash.classList.add('visually-hidden');
        }
      });

      // Also hook Enter button on pad to trigger validation
      const pad = document.getElementById('mock-pad');
      if (pad) {
        pad.addEventListener('click', (ev) => {
          const btn = ev.target.closest('button');
          if (!btn) return;
          const label = btn.textContent.trim();
          if (label === 'Svara') {
            try {
              const ex = window.currentExerciseData;
              if (ex && ex.generator === 'divisibility') {
                // evaluate selections directly
                const opts = [2,3,5,10];
                const nEl = ex._items && ex._items[ex._current] ? ex._items[ex._current].n : null;
                const n = Number(nEl);
                const selections = opts.map(k => !!document.getElementById(`divchk-${k}`) && document.getElementById(`divchk-${k}`).checked);
                const correct = opts.map(k => (n % k) === 0);
                const allEqual = selections.length === correct.length && selections.every((v,i) => v === correct[i]);
                ex._attempts = (ex._attempts || 0) + 1;
                if (allEqual) {
                  ex._score = (ex._score || 0) + 1;
                  flash.textContent = 'Rätt!'; flash.className = 'flash-msg success'; flash.classList.remove('visually-hidden');
                  setTimeout(() => { flash.classList.add('visually-hidden'); ex._current += 1; if (ex._current >= ex._items.length) showSummary(ex); else showCurrentItem(ex); }, 1200);
                } else {
                  flash.textContent = 'Fel'; flash.className = 'flash-msg error'; flash.classList.remove('visually-hidden');
                }
                return;
              }
            } catch (e) {}
            // fallback to numeric validation
            validateValue();
            return;
          }
          // simple keypad insertion for digits and comma
          if (/^[0-9,]$/.test(label)) {
            const start = valueField.selectionStart || valueField.value.length;
            const end = valueField.selectionEnd || start;
            valueField.value = valueField.value.slice(0, start) + label + valueField.value.slice(end);
            // move cursor after inserted char
            const pos = start + 1;
            valueField.setSelectionRange(pos, pos);
            valueField.focus();
            return;
          }
          if (label === '⌫') {
            const start = valueField.selectionStart || 0;
            const end = valueField.selectionEnd || start;
            if (start === end && start > 0) {
              valueField.value = valueField.value.slice(0, start-1) + valueField.value.slice(end);
              valueField.setSelectionRange(start-1, start-1);
            } else {
              valueField.value = valueField.value.slice(0, start) + valueField.value.slice(end);
              valueField.setSelectionRange(start, start);
            }
            valueField.focus();
            return;
          }
          if (label === 'C') {
            valueField.value = '';
            valueField.focus();
            return;
          }
          if (label === '◀') {
            const p = valueField.selectionStart || 0;
            const np = Math.max(0, p - 1);
            valueField.setSelectionRange(np, np);
            valueField.focus();
            return;
          }
          if (label === '▶') {
            const p = valueField.selectionEnd || valueField.value.length;
            const np = Math.min(valueField.value.length, p + 1);
            valueField.setSelectionRange(np, np);
            valueField.focus();
            return;
          }
        });
      }
    } catch (err) {
      console.error('Failed to attach input handler', err);
    }
  }

  async function validateValue() {
    const val = valueField.value;
    // Allow 'm' as a decimal separator (students may type 3m8 for 3,8)
    const normalizedInput = String(val).replace(/m/gi, ',');
    const mod = await ensureNumbers();
    if (!mod) return;
    const parsed = mod.parseDecimal(normalizedInput);
    // show flash for a few seconds, clear previous timer
    if (valueField._flashTimer) { clearTimeout(valueField._flashTimer); valueField._flashTimer = null; }
      if (parsed == null) {
      // show invalid input error persistently until user types again
      if (valueField._flashTimer) { clearTimeout(valueField._flashTimer); valueField._flashTimer = null; }
      flash.textContent = 'Ogiltigt tal'; flash.className = 'flash-msg error'; flash.classList.remove('visually-hidden');
      return;
    }

    // If there's a current exercise with generated items, validate against it
    const ex = window.currentExerciseData;
    if (ex && ex._items && typeof ex._current === 'number') {
      const cur = ex._items[ex._current];
      // validation config may live on the item or the exercise
      const vcfg = Object.assign({}, ex.validation || {}, cur.validation || {});
      // If exercise requires exact decimals, enforce user's provided decimal count
      if (typeof vcfg.exactDecimals === 'number') {
        // count decimals in user's raw input (allow comma or dot as separator)
        const raw = val.trim().replace(/\s+/g, '');
        const idxDot = raw.lastIndexOf('.');
        const idxComma = raw.lastIndexOf(',');
        const idx = Math.max(idxDot, idxComma);
        const provided = idx >= 0 ? (raw.length - idx - 1) : 0;
        if (provided !== vcfg.exactDecimals) {
          flash.textContent = `Svara med exakt ${vcfg.exactDecimals} decimaler`; flash.className = 'flash-msg error'; flash.classList.remove('visually-hidden');
          return;
        }
      } else if (typeof vcfg.maxDecimals === 'number') {
        const raw = val.trim().replace(/\s+/g, '');
        const idxDot = raw.lastIndexOf('.');
        const idxComma = raw.lastIndexOf(',');
        const idx = Math.max(idxDot, idxComma);
        const provided = idx >= 0 ? (raw.length - idx - 1) : 0;
        if (provided > vcfg.maxDecimals) {
          flash.textContent = `Max ${vcfg.maxDecimals} decimaler tillåts`; flash.className = 'flash-msg error'; flash.classList.remove('visually-hidden');
          return;
        }
      }
      ex._attempts = (ex._attempts || 0) + 1;
      // parsed is normalized with dot; convert to number for comparison
      const userNum = Number(parsed);
      const correctNum = Number(String(cur.answer).replace(',', '.'));
      let isEqual = (userNum === correctNum) || (Math.abs(userNum - correctNum) < 1e-9);
      // If this item has a roundUnit (decimal rounding), allow answers that match when
      // formatted to the correct number of decimals (accepts trailing zeros and comma/dot input).
      if (!isEqual && cur && typeof cur.roundUnit !== 'undefined') {
        const unit = Number(cur.roundUnit);
        if (unit > 0 && unit < 1) {
          // decimals = number of digits after decimal point for the unit
          const decimals = Math.round(Math.log10(1 / unit));
          try {
            const userFixed = Number(userNum).toFixed(decimals);
            const correctFixed = Number(correctNum).toFixed(decimals);
            if (userFixed === correctFixed) isEqual = true;
          } catch (e) {}
        }
      }
      if (isEqual) {
        ex._score = (ex._score || 0) + 1;
        flash.textContent = 'Rätt!'; flash.className = 'flash-msg success'; flash.classList.remove('visually-hidden');
        // clear input after correct and advance after flash hides
        valueField._flashTimer = setTimeout(() => {
          flash.classList.add('visually-hidden');
          // advance
          ex._current += 1;
          if (ex._current >= ex._items.length) {
            showSummary(ex);
          } else {
            showCurrentItem(ex);
            valueField.value = '';
            valueField.focus();
          }
        }, 2000);
      } else {
        // wrong answer: show persistent error until next input
        if (valueField._flashTimer) { clearTimeout(valueField._flashTimer); valueField._flashTimer = null; }
        flash.textContent = 'Fel'; flash.className = 'flash-msg error'; flash.classList.remove('visually-hidden');
        valueField.value = '';
        valueField.focus();
      }
      return;
    }

    // fallback: just show formatted value
    const formatted = mod.formatDecimal(parsed);
    flash.textContent = `Formaterat: ${formatted}`; flash.className = 'flash-msg success'; flash.classList.remove('visually-hidden');
    valueField._flashTimer = setTimeout(() => { flash.classList.add('visually-hidden'); }, 2000);
  }

  function showCurrentItem(ex) {
    const tEl = document.getElementById('task-expression');
    const first = ex._items[ex._current] || { a: '', b: '' };
    // decide display based on generator type (division generators include 'div')
    const isDiv = ex && ex.generator && String(ex.generator).toLowerCase().includes('div');
    const hasRound = first && typeof first.roundUnit !== 'undefined';
    const hasOp = first && typeof first.op === 'string';
    if (isDiv) {
      tEl.textContent = `$\\frac{${first.a}}{${first.b}}$`;
    } else {
      // multipleChoice answer type: render choices as buttons and handle selection
      if (ex && ex.answerType === 'multipleChoice') {
        tEl.textContent = first.template || ex.question || '';
        // hide only the label+input row immediately (avoid flashing), keep container visible
        try { const valueEntry = document.querySelector('.value-entry'); if (valueEntry) { const labelRow = valueEntry.querySelector('.d-flex'); if (labelRow) labelRow.style.display = 'none'; } const vf = document.getElementById('value-field'); if (vf) vf.style.display='none'; } catch(e) {}
        // clear input area and render choices
        const inputArea = document.getElementById('input-area');
        if (inputArea) inputArea.innerHTML = '';
        // Use provided choices, but shuffle them here if generator didn't already
        const originalChoices = Array.isArray(first.choices) ? first.choices.slice() : [];
        const choices = originalChoices.slice();
        // Fisher-Yates shuffle
        for (let s = choices.length - 1; s > 0; s--) {
          const j = Math.floor(Math.random() * (s + 1));
          [choices[s], choices[j]] = [choices[j], choices[s]];
        }
        const btnContainer = document.createElement('div'); btnContainer.className = 'mc-container';
        choices.forEach((ch, idx) => {
          const btn = document.createElement('button'); btn.type='button'; btn.className='btn btn-outline-primary mc-choice';
          btn.style.marginRight='8px'; btn.style.marginBottom='8px';
          btn.textContent = String(ch);
          btn.addEventListener('click', () => {
            // evaluate
            try {
              const cur = ex._items[ex._current];
              const selected = String(ch);
              const correct = String(cur.answer);
              ex._attempts = (ex._attempts || 0) + 1;
              if (selected === correct) {
                ex._score = (ex._score || 0) + 1;
                flash.textContent = 'Rätt!'; flash.className = 'flash-msg success'; flash.classList.remove('visually-hidden');
                setTimeout(() => {
                  flash.classList.add('visually-hidden');
                  ex._current += 1;
                  if (ex._current >= ex._items.length) showSummary(ex);
                  else showCurrentItem(ex);
                }, 1200);
              } else {
                flash.textContent = 'Fel'; flash.className = 'flash-msg error'; flash.classList.remove('visually-hidden');
              }
            } catch (e) { console.error('MC check failed', e); }
          });
          btnContainer.appendChild(btn);
        });
        // Place buttons into the `#input-area` so they appear where the input used to be.
        if (inputArea) {
          // ensure it's visible and clear previous MC container there
          inputArea.style.display = '';
          const prev = inputArea.querySelector('.mc-container'); if (prev) prev.remove();
          inputArea.appendChild(btnContainer);
        } else {
          // fallback: put into left card body
          const leftBody = document.querySelector('.split-left .inner-card .card-body');
          if (leftBody) { const prev = leftBody.querySelector('.mc-container'); if (prev) prev.remove(); leftBody.appendChild(btnContainer); }
        }
        return;
      }
      // If this exercise uses number-with-unit, populate prefix buttons
      try {
        if (ex && ex.answerType === 'number-with-unit') {
          const inputArea = document.getElementById('input-area');
          // the answer-type mount should have created an input with id 'value-field'
          // and exposed a `setPrefixes` method via the instance stored on registry.
          // We locate the mounted instance by checking registry export — fallback: call a global helper.
          try {
            // If the mounted instance setPrefixes is available on window, call it
            if (window.currentAnswerTypeInstance && typeof window.currentAnswerTypeInstance.setPrefixes === 'function') {
              // determine allowed prefixes for this unit
              const unit = first.b || '';
              const allowed = ['h','k','M','G','T'].map(p => p);
              window.currentAnswerTypeInstance.setPrefixes(allowed, unit);
            } else {
              // fallback: try to find input area and append buttons directly
              const inp = document.getElementById('value-field');
              const container = document.querySelector('.nwu-prefix-container') || (inputArea && inputArea.querySelector('.nwu-prefix-container'));
              if (container) {
                container.innerHTML = '';
                const unit = first.b || '';
                ['h','k','M','G','T'].forEach(p => {
                  const btn = document.createElement('button'); btn.type='button'; btn.className='btn btn-outline-secondary nwu-prefix'; btn.style.marginRight='8px'; btn.textContent = p + unit;
                  btn.addEventListener('click', () => {
                    let val = inp.value.trim(); val = val.replace(/\s+[A-Za-z]+$/, '').trim(); inp.value = val + ' ' + (p + unit); inp.focus();
                  });
                  container.appendChild(btn);
                });
              }
            }
          } catch (e) { console.warn('Failed to populate prefix buttons', e); }
        }
      } catch (e) {}
      // Render a simple numberline SVG for numberlinePoint generator
      if (ex && ex.generator === 'numberlinePoint') {
        // clear existing content
        tEl.innerHTML = '';
        const start = Number(first.a || 0);
        const end = Number(first.b || 2);
        const step = Number(first.step || 0.1);
        const divisions = Math.round((end - start) / step);
        if (!divisions || !isFinite(divisions)) {
          console.warn('Invalid divisions computed for numberline mock', {start,end,step,divisions});
          tEl.textContent = 'Ogiltig tallinje — försök igen';
          return;
        }
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox','0 0 1000 200'); svg.style.width='100%'; svg.style.height='160px';
        const line = document.createElementNS(ns,'line'); line.setAttribute('x1','50'); line.setAttribute('y1','100'); line.setAttribute('x2','950'); line.setAttribute('y2','100'); line.setAttribute('stroke','#333'); line.setAttribute('stroke-width','2'); svg.appendChild(line);
        for (let i=0;i<=divisions;i++){
          const x = 50 + (900 * (i / divisions));
          const isIntegerPos = Number.isInteger(start + i*step);
          // longer ticks for integer positions
          const tick = document.createElementNS(ns,'line'); tick.setAttribute('x1',String(x)); tick.setAttribute('y1', isIntegerPos ? '80' : '92'); tick.setAttribute('x2',String(x)); tick.setAttribute('y2', isIntegerPos ? '120' : '108'); tick.setAttribute('stroke','#333'); tick.setAttribute('stroke-width','1'); svg.appendChild(tick);
          const lbl = document.createElementNS(ns,'text'); lbl.setAttribute('x',String(x)); lbl.setAttribute('y','78'); lbl.setAttribute('text-anchor','middle'); lbl.setAttribute('font-size','12');
          // Only show labels for start and end, and intermediate labels when divisions is small
          const stepStr = String(step);
          const decimals = (stepStr.indexOf('.') >= 0) ? stepStr.split('.')[1].length : 0;
          if (i === 0 || i === divisions) {
            lbl.textContent = String((start + i*step).toFixed(decimals)).replace('.',',');
          } else if (divisions <= 10) {
            lbl.textContent = String((start + i*step).toFixed(decimals)).replace('.',',');
          } else {
            lbl.textContent = '';
          }
          svg.appendChild(lbl);
        }
        const idx = Number(first.idx || 0);
        const mx = 50 + (900 * (idx / divisions));
        const arrow = document.createElementNS(ns,'polygon');
        // rotate arrow 180deg to point downwards
        // Arrow tip should touch the baseline (y=100)
        const points = `${mx},100 ${mx-8},120 ${mx+8},120`;
        arrow.setAttribute('points',points); arrow.setAttribute('fill','#c44'); svg.appendChild(arrow);
        tEl.appendChild(svg);
      } else {
      if (hasRound) {
        // render rounding prompt with Swedish label exactly as requested
        // "Avrunda [tal] till [tiotal/hundratal/tusental]"
        tEl.textContent = `Avrunda ${first.a} till ${first.roundLabel}`;
        // keep math rendering for the number if KaTeX is available
        // append inline math with the number so renderMathInElement can format it
        // (we include the plain text as primary content for accessibility)
        // create a small span with $...$ for KaTeX to render
        const span = document.createElement('span');
        span.style.marginLeft = '6px';
        span.textContent = `$${first.a}$`;
        // clear and append
        tEl.innerHTML = '';
        tEl.appendChild(document.createTextNode(`Avrunda `));
        const numNode = document.createElement('span'); numNode.textContent = String(first.a); numNode.className = 'round-number';
        tEl.appendChild(numNode);
        tEl.appendChild(document.createTextNode(` till ${first.roundLabel}`));
      } else if (hasOp) {
        // Use exercise question template if available, otherwise fallback to hardcoded text
        const qTemplate = ex && ex.question ? String(ex.question) : 'Beräkna [operation] av [tal1] och [tal2]';
        let opword = '';
        if (first.op === 'kvot') opword = 'kvoten';
        else if (first.op === 'produkt') opword = 'produkten';
        else if (first.op === 'summa') opword = 'summan';
        else if (first.op === 'differens') opword = 'differensen';
        const rendered = qTemplate.replace(/\[operation\]/g, opword).replace(/\[tal1\]/g, String(first.a)).replace(/\[tal2\]/g, String(first.b));
        tEl.textContent = rendered;
      } else {
        tEl.textContent = `$${first.a} \\times ${first.b}$`;
      }
      }
    }
    // trigger KaTeX render
    if (window.katexAutoRenderLoaded && typeof renderMathInElement === 'function') {
      try { renderMathInElement(tEl, { delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}] }); } catch (e) {}
    }
    // Clear any previous flash/error message and reset input when switching items
    try {
      if (flash) {
        flash.classList.add('visually-hidden');
        flash.className = 'flash-msg';
        flash.textContent = '';
      }
      if (valueField) {
        valueField.value = '';
      }
    } catch (e) {}

    // Hide or show numeric input depending on exercise type
    try {
      const valueEntry = document.querySelector('.value-entry');
      const hideFor = ex && (ex.generator === 'divisibility' || ex.answerType === 'multipleChoice');
      if (valueEntry) {
        // hide only the label+input row (first child), keep #input-area visible
        const labelRow = valueEntry.querySelector('.d-flex');
        if (labelRow) labelRow.style.display = hideFor ? 'none' : '';
        // ensure container remains visible so input-area (buttons) are shown
        valueEntry.style.display = '';
      }
      if (valueField) valueField.style.display = hideFor ? 'none' : '';
    } catch (e) {}

    // Special rendering for divisibility exercise (checkboxes)
    try {
      const inputArea = document.getElementById('input-area');
      if (inputArea) inputArea.innerHTML = '';
      if (ex && ex.generator === 'divisibility') {
        const cur = ex._items[ex._current] || {};
        const n = cur.n;
        const qTemplate = ex && ex.question ? String(ex.question) : 'Vilka delbarhetsregler gäller för talet [tal1]?';
        const rendered = qTemplate.replace(/\[tal1\]/g, String(n));
        tEl.textContent = rendered;
        if (inputArea) {
          const opts = [2,3,5,10];
          opts.forEach(k => {
            const id = `divchk-${k}`;
            const label = document.createElement('label'); label.style.display = 'inline-block'; label.style.marginRight = '12px';
            const cb = document.createElement('input'); cb.type = 'checkbox'; cb.id = id; cb.dataset.k = String(k);
            label.appendChild(cb);
            const span = document.createElement('span'); span.textContent = ` Delbarhet med ${k}`;
            label.appendChild(span);
            inputArea.appendChild(label);
          });
          // create a single answer button instead of separate control
          const answerBtn = document.createElement('button'); answerBtn.type = 'button'; answerBtn.className = 'btn btn-primary'; answerBtn.id = 'answer-button'; answerBtn.textContent = 'Svara';
          answerBtn.style.display = 'inline-block'; answerBtn.style.marginTop = '12px'; answerBtn.style.marginLeft = '6px';
          // place the answer button in the pad area so it appears next to the keypad
          const padContainer = document.getElementById('mock-pad') || inputArea;
          // we no longer add a separate pad button — pad's own 'Svara' triggers evaluation
          // ensure no leftover pad-answer-button
          const prevPadBtn = document.getElementById('pad-answer-button'); if (prevPadBtn) prevPadBtn.remove();
          // click handler removed — pad 'Svara' triggers evaluation
        }
        return; // skip default numeric input handling
      }
    } catch (e) {}
  }

  function showSummary(ex) {
    const summary = document.getElementById('exercise-summary');
    const percentEl = document.getElementById('summary-percent');
    const restartBtn = document.getElementById('summary-restart');
    const total = ex._items.length;
    const correct = ex._score || 0;
    const attempts = ex._attempts || 0;
    // Use attempts as denominator so extra tries reduce the percentage
    const denom = attempts > 0 ? attempts : total;
    const pct = Math.round((correct / denom) * 100);
    percentEl.textContent = `${pct}%`;
    // show counts below percent
    const summaryTextEl = document.querySelector('.summary-text');
    if (summaryTextEl) summaryTextEl.textContent = `${correct} rätt av ${denom} försök (${total} frågor)`;
    summary.classList.remove('visually-hidden');
    restartBtn.classList.remove('visually-hidden');
    restartBtn.onclick = async () => {
      // restart same exercise: dynamically import generator registry and regenerate
      try {
        const reg = await import('../../src/generators/registry.js');
        const gen = reg.getGenerator(ex.generator);
        if (gen && typeof gen.generate === 'function') {
          // preserve dev override via URL param ?dev=1
          // prefer previously used params (saved at load time), otherwise copy original params
          const params = ex._genParams ? Object.assign({}, ex._genParams) : Object.assign({}, ex.params || {});
          try {
            const qs = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
            if (qs && qs.get('dev') === '1') params.count = 5;
          } catch (e) {}
          const items = gen.generate(params, { seed: Date.now() });
          ex._items = items; ex._current = 0; ex._score = 0; ex._attempts = 0;
          summary.classList.add('visually-hidden');
          restartBtn.classList.add('visually-hidden');
          // show first
          const qEl = document.getElementById('question-text');
          qEl.textContent = ex.task || '';
          showCurrentItem(ex);
          valueField.value = '';
          valueField.focus();
        }
      } catch (err) { console.error('Failed to restart exercise', err); }
    };
  }

export {};

// Expose for loader to invoke initial rendering
try { if (typeof window !== 'undefined') window.showCurrentItem = showCurrentItem; } catch (e) {}
