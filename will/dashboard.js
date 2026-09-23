/* ==========================================================================
   Ops Dashboard — render logic
   Reads only from window.OpsData (data-sources.js). Swapping mock data for
   live data means editing data-sources.js, not this file.
   ========================================================================== */

(function () {
  const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DOW_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const TAG_CLASS = { red: 'ev-red', amber: 'ev-amber', blue: 'ev-blue' };
  const TAG_COLOR = { red: 'var(--status-red)', amber: 'var(--status-amber)', blue: 'var(--status-blue)' };

  function fmtMoney(n) {
    if (n === null || n === undefined || isNaN(n)) return null;
    return '$' + Number(n).toLocaleString();
  }
  function parseMoney(v) {
    const n = parseFloat(String(v || '').replace(/[$,]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function renderTopbar() {
    const now = new Date();
    const dateStr = `${DOW_FULL[now.getDay()].toUpperCase()} · ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    document.getElementById('date-str').textContent = dateStr;

    const status = window.OpsData.getSyncStatus();
    const label = document.getElementById('sync-status');
    const dot = document.querySelector('.status-ok .dot');
    if (status === 'ok') {
      label.textContent = 'SYSTEMS NOMINAL';
      dot.style.background = 'var(--status-green)';
    } else if (status === 'error') {
      label.textContent = 'SYNC ERROR';
      dot.style.background = 'var(--status-red)';
    } else {
      label.textContent = 'AWAITING LIVE SYNC';
      dot.style.background = 'var(--status-amber)';
    }
  }

  function renderCalendar() {
    const now = new Date();
    const todayDow = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((todayDow + 6) % 7));

    const stripEl = document.getElementById('week-strip');
    stripEl.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday = d.toDateString() === now.toDateString();
      const color = isToday ? 'var(--accent)' : d < now ? 'var(--text-faint)' : 'var(--text-dim)';
      const cell = document.createElement('div');
      cell.className = 'week-day';
      cell.innerHTML = `<div class="dow">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</div><div class="num" style="color:${color}">${d.getDate()}</div>`;
      stripEl.appendChild(cell);
    }

    document.getElementById('today-label').textContent = `Today · ${MONTHS[now.getMonth()]} ${now.getDate()}`;
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    document.getElementById('week-num').textContent = `Week ${weekNum}`;

    const { today, week } = window.OpsData.getCalendarEvents();
    const renderEv = (ev) => `
      <div class="ev ${TAG_CLASS[ev.tag] || 'ev-blue'}">
        <span class="ev-label">${ev.label}</span>
        <span class="ev-time">${ev.time}</span>
      </div>`;
    document.getElementById('today-events').innerHTML = today.map(renderEv).join('') || '<span class="section-label">Nothing scheduled</span>';
    document.getElementById('week-events').innerHTML = week.map(renderEv).join('');
  }

  let dealNotesDraft = null; // preserves in-progress typing across live Firebase pushes

  function renderDeal(deal) {
    const existingNotes = document.getElementById('deal-notes');
    if (existingNotes) dealNotesDraft = existingNotes.value;

    const phaseLabels = deal.phaseLabels || [];
    const nodes = phaseLabels.map((_, i) => {
      const num = i + 1;
      const cls = num < deal.phase ? 'phase-done' : num === deal.phase ? 'phase-active' : '';
      return `<div class="phase-node ${cls}"></div>`;
    }).join('');
    const labels = phaseLabels.map((l, i) => {
      const num = i + 1;
      return `<span class="${num === deal.phase ? 'current' : ''}">${l}</span>`;
    }).join('');

    const body = document.getElementById('deal-panel-body');
    body.innerHTML = `
      <div class="deal-badges">
        <div class="badge badge-active"><div class="dot"></div>${deal.status}</div>
        ${deal.priorDeal ? `<div class="badge badge-meta">${deal.priorDeal.name} — ${deal.priorDeal.status} ✓</div>` : ''}
      </div>
      <div style="flex-shrink:0;">
        <div class="deal-title">${deal.name}</div>
        <div class="deal-meta">${deal.meta}</div>
      </div>
      <div style="flex-shrink:0;">
        <div class="phase-track-head">
          <span class="name">${deal.phaseName}</span>
          <span class="count">Phase ${deal.phase} / ${deal.phaseCount}</span>
        </div>
        <div class="phase-nodes">${nodes}</div>
        <div class="phase-labels">${labels}</div>
      </div>
      <div class="kpi-row">
        <div class="kpi"><span class="kpi-label">Proj. Profit</span><span class="kpi-val" style="color:var(--status-green)">${deal.profit}</span></div>
        <div class="kpi"><span class="kpi-label">Invested</span><span class="kpi-val">${deal.invested}</span></div>
        <div class="kpi"><span class="kpi-label">Target Close</span><span class="kpi-val">${deal.close}</span></div>
      </div>
      <div class="next-task-box">
        <span class="tag">Next Task</span>
        <div class="task">${deal.nextTask}</div>
        <div class="meta">${deal.nextTaskMeta}</div>
      </div>
      <div style="flex:1;min-height:0;display:flex;flex-direction:column;">
        <span class="section-label" style="margin-bottom:6px;flex-shrink:0;">Notes</span>
        <textarea class="data-input" id="deal-notes" style="flex:1;min-height:60px;" placeholder="Deal notes…">${dealNotesDraft !== null ? dealNotesDraft : (deal.notes || '')}</textarea>
      </div>
    `;
  }

  function renderFinancials() {
    const saved = window.OpsData.loadFinancials();
    const ids = ['nw', 'td', 'mi', 'dp', 're', 'target'];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (saved[id]) el.value = saved[id];
    });

    function recompute() {
      const income = parseMoney(document.getElementById('mi').value);
      const debtPayments = parseMoney(document.getElementById('dp').value);
      const reIncome = parseMoney(document.getElementById('re').value);
      const target = parseMoney(document.getElementById('target').value);

      const dti = income > 0 ? Math.round((debtPayments / income) * 100) : null;
      const dtiEl = document.getElementById('dti-val');
      dtiEl.textContent = dti === null ? '—' : `${dti}%`;
      dtiEl.style.color = dti === null ? 'var(--text-dimmer)' : dti < 36 ? 'var(--status-green)' : dti < 50 ? 'var(--status-amber)' : 'var(--status-red)';

      const pct = target > 0 ? Math.min(100, Math.round((reIncome / target) * 100)) : 0;
      document.getElementById('progress-fill').style.width = pct + '%';
      document.getElementById('progress-label').textContent = target > 0 ? `${pct}%` : '—';

      const gapEl = document.getElementById('gap-val');
      if (target > 0 && reIncome < target) {
        gapEl.textContent = fmtMoney(target - reIncome);
      } else if (target > 0) {
        gapEl.textContent = 'On target';
        gapEl.style.color = 'var(--status-green)';
      } else {
        gapEl.textContent = '—';
        gapEl.style.color = 'var(--status-amber)';
      }

      const data = {};
      ids.forEach((id) => { data[id] = document.getElementById(id).value; });
      window.OpsData.saveFinancials(data);
    }

    ids.forEach((id) => document.getElementById(id).addEventListener('input', recompute));
    recompute();
  }

  function renderTasks() {
    const tasks = window.OpsData.getTasks();
    const state = window.OpsData.loadTaskState();
    let activeFilter = 'all';

    function draw() {
      const filtered = tasks.filter((t) => activeFilter === 'all' || t.category === activeFilter);
      const sections = ['Priority', 'This Week'];
      let html = '';
      sections.forEach((section) => {
        const rows = filtered.filter((t) => t.section === section);
        if (!rows.length) return;
        html += `<span class="section-label" style="margin-bottom:6px;flex-shrink:0;${section === 'This Week' ? 'margin-top:10px;' : ''}">${section}</span>`;
        rows.forEach((t) => {
          const checked = state[t.id] ? 'checked' : '';
          html += `
            <div class="todo-row">
              <input type="checkbox" id="${t.id}" ${checked}>
              <label for="${t.id}">
                <div class="todo-text ${section === 'This Week' ? 'upcoming' : ''}">${t.text}</div>
                <div class="todo-meta">${t.meta}</div>
              </label>
              <div class="tag-dot" style="background:${TAG_COLOR[t.tag] || 'var(--status-blue)'}"></div>
            </div>`;
        });
      });
      document.getElementById('todo-list').innerHTML = html || '<span class="section-label">Nothing in this filter</span>';

      tasks.forEach((t) => {
        const cb = document.getElementById(t.id);
        if (!cb) return;
        cb.addEventListener('change', () => {
          state[t.id] = cb.checked;
          window.OpsData.saveTaskState(state);
        });
      });
    }

    document.getElementById('filter-pills').addEventListener('click', (e) => {
      const btn = e.target.closest('.pill');
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      document.querySelectorAll('#filter-pills .pill').forEach((p) => {
        p.classList.toggle('pill-active', p === btn);
        p.classList.toggle('pill-idle', p !== btn);
      });
      draw();
    });

    draw();

    // Sync dot reflects live-source status (see data-sources.js TODOs)
    const status = window.OpsData.getSyncStatus();
    const dot = document.getElementById('sync-dot');
    dot.className = 'sync-dot ' + (status === 'ok' ? 'sync-ok' : status === 'error' ? 'sync-error' : 'sync-pending');
  }

  function init() {
    renderTopbar();
    renderCalendar();
    window.OpsData.subscribeActiveDeal((deal) => {
      renderDeal(deal);
      renderTopbar(); // sync status changes once Firebase confirms connection
    });
    renderFinancials();
    renderTasks();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
