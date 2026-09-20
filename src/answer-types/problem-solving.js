export default function initProblemSolving(container, data) {
  container.innerHTML = '';
  const q = document.createElement('div');
  q.className = 'ps-question';
  q.textContent = data.questionText;
  container.appendChild(q);

  const input = document.createElement('div');
  input.className = 'ps-input';
  // determine answer shape: prefer explicit answerSpec, else fallback to data.answer
  const spec = (data.answerSpec && data.answerSpec.type) ? data.answerSpec.type : (data.answer ? (typeof data.answer === 'number' ? 'integer' : data.answer.lower !== undefined ? 'interval' : 'explanation') : 'explanation');

  // store inputs for checking
  const inputs = {};

  if (spec === 'integer') {
    const el = document.createElement('input');
    el.type = 'number';
    el.setAttribute('aria-label','Svar');
    inputs.integer = el;
    input.appendChild(el);
  } else if (spec === 'interval') {
    const labelMin = document.createElement('label'); labelMin.textContent = 'Minsta:';
    const a = document.createElement('input'); a.type='number'; a.setAttribute('aria-label','Minsta');
    const labelMax = document.createElement('label'); labelMax.textContent = 'Största:';
    const b = document.createElement('input'); b.type='number'; b.setAttribute('aria-label','Största');
    input.appendChild(labelMin); input.appendChild(a);
    input.appendChild(labelMax); input.appendChild(b);
    inputs.min = a; inputs.max = b;
  } else if (spec === 'optimisation') {
    const ta = document.createElement('textarea'); ta.setAttribute('aria-label','Förslag'); ta.rows=4;
    inputs.text = ta;
    input.appendChild(ta);
  } else { // explanation/default
    const ta = document.createElement('textarea'); ta.setAttribute('aria-label','Förklaring'); ta.rows=4;
    inputs.text = ta;
    input.appendChild(ta);
  }

  container.appendChild(input);

  const feedback = document.createElement('div'); feedback.className='ps-feedback'; feedback.setAttribute('aria-live','polite');
  container.appendChild(input);
  container.appendChild(feedback);

  const checkBtn = document.createElement('button'); checkBtn.textContent='Kontrollera';
  checkBtn.addEventListener('click', ()=>{
    feedback.textContent = '';
    // simple checking logic against data.answer (generator should provide canonical answer)
    try {
      if (!data.answer) { feedback.textContent = 'Ingen facit finns för automatisk kontroll.'; return; }
      if (spec === 'integer') {
        const val = Number(inputs.integer.value);
        if (Number.isNaN(val)) { feedback.textContent = 'Skriv ett tal.'; return; }
        feedback.textContent = (val === data.answer) ? 'Rätt' : `Fel — korrekt svar: ${data.answer}`;
      } else if (spec === 'interval') {
        const low = Number(inputs.min.value);
        const high = Number(inputs.max.value);
        if (Number.isNaN(low) || Number.isNaN(high)) { feedback.textContent = 'Fyll i både minsta och största tal.'; return; }
        const ok = (low === data.answer.lower && high === data.answer.upper) || (low <= data.answer.lower && high >= data.answer.upper);
        feedback.textContent = ok ? 'Rätt (inom intervall)' : `Fel — korrekt intervall: ${data.answer.lower}–${data.answer.upper}`;
      } else {
        const txt = (inputs.text && inputs.text.value) ? inputs.text.value.trim() : '';
        if (!txt) { feedback.textContent = 'Skriv en förklaring.'; return; }
        feedback.textContent = 'Svar mottaget. Kontrollera manuellt.';
      }
    } catch (e) {
      feedback.textContent = 'Kontroll misslyckades.';
    }
  });
  container.appendChild(checkBtn);
}
