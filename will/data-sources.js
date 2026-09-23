/* ==========================================================================
   Ops Dashboard — data sources (THE WIRING SEAM)
   ==========================================================================
   Everything in this file is a stand-in. Each function below is where the
   next build phase plugs in a real source. dashboard.js never talks to a
   backend directly — it only calls these functions — so wiring up live
   data means rewriting the bodies here, not touching layout/render code.

   Wiring plan per function is noted above each one.
   ========================================================================== */

window.OpsData = {

  /**
   * TODO(live): Google Calendar API (calendar.events.list) for the
   * primary calendar(s), mapped to { tag: 'red'|'amber'|'blue', label, time }
   * using the existing tomato/banana/blue color coding from Google Calendar
   * event colors. Needs OAuth — likely a small serverless function on
   * Netlify (functions/calendar.js) since this can't hit Google's API
   * with a bare API key for a private calendar.
   */
  getCalendarEvents() {
    return {
      today: [
        { tag: 'red', label: 'A-Shift · Station 12', time: '07:00 – 19:00' },
        { tag: 'amber', label: '179 Vista — Contractor Walkthrough', time: '14:00 – 15:30' },
      ],
      week: [
        { tag: 'amber', label: 'Nebo Land — Title Review', time: 'Tue 10:00' },
        { tag: 'red', label: 'B-Shift · Station 12', time: 'Wed 07:00' },
        { tag: 'blue', label: 'Powerlifting · Gym', time: 'Thu 06:00' },
        { tag: 'amber', label: 'Investor Call — AIXO Project 1', time: 'Fri 13:00' },
        { tag: 'blue', label: 'Range Day · VOD Tactical', time: 'Sat 09:00' },
      ],
    };
  },

  /**
   * LIVE: reads the same Firebase Realtime Database node the checklist at
   * jhmtndev.com/dashboard writes to (jhm/project1 — 179 Vista). Deal
   * identity, projected profit, and target close date aren't tracked in
   * Firebase (only per-task checked/note/amount are), so those stay as
   * config below until there's a real source for them. Phase progress,
   * next task, and total invested are all computed live from the same
   * data Hank and Will check off on the checklist page.
   *
   * subscribeActiveDeal(callback) fires immediately with the current
   * state and again every time the checklist changes — checking a box on
   * /dashboard updates this dashboard without a refresh.
   */
  _dealFirebaseApp: null,
  subscribeActiveDeal(callback) {
    const schema = window.ChecklistSchema;
    const DEAL_META = {
      name: '179 Vista Drive',
      meta: 'AIXO Program · Nebo, NC 28761',
      priorDeal: { name: '67 Vista', status: 'CLOSED' },
      profit: '$51K',       // TODO(live): not tracked in Firebase yet
      close: "Q3 '27",      // TODO(live): not tracked in Firebase yet
    };

    function computeDeal(state) {
      const tasks = (state && state.tasks) || {};
      let totalSpend = 0;
      let currentPhaseIndex = 0;
      let currentPhaseFound = false;
      let firstIncomplete = null;

      schema.phases.forEach((ph, pi) => {
        let phaseAllDone = true;
        ph.sections.forEach((sec, si) => {
          sec.items.forEach((item, ii) => {
            const key = `${ph.id}_${si}_${ii}`;
            const t = tasks[key] || {};
            const amt = parseFloat(t.amount || 0);
            if (!isNaN(amt)) totalSpend += amt;
            if (!t.checked) {
              phaseAllDone = false;
              if (!firstIncomplete) {
                firstIncomplete = { text: item.t, owner: item.o, phaseTitle: ph.title };
              }
            }
          });
        });
        if (!phaseAllDone && !currentPhaseFound) {
          currentPhaseIndex = pi;
          currentPhaseFound = true;
        }
      });
      if (!currentPhaseFound) currentPhaseIndex = schema.phases.length - 1;

      return {
        ...DEAL_META,
        status: 'ACTIVE',
        invested: '$' + Math.round(totalSpend).toLocaleString(),
        phase: currentPhaseIndex + 1,
        phaseCount: schema.phases.length,
        phaseName: schema.phases[currentPhaseIndex].title,
        phaseLabels: schema.phases.map((p) => p.short),
        nextTask: firstIncomplete ? firstIncomplete.text : 'All checklist items complete 🎉',
        nextTaskMeta: firstIncomplete ? `${firstIncomplete.phaseTitle} · ${firstIncomplete.owner}` : '179 Vista',
        notes: '',
      };
    }

    try {
      if (!this._dealFirebaseApp) {
        firebase.initializeApp(schema.firebaseConfig);
        this._dealFirebaseApp = true;
      }
      const ref = firebase.database().ref(schema.projectPath);
      ref.on('value', (snap) => {
        this._syncStatus = 'ok';
        callback(computeDeal(snap.val()));
      }, (err) => {
        this._syncStatus = 'error';
        console.error('Firebase read failed:', err);
        callback(computeDeal(null));
      });
    } catch (e) {
      this._syncStatus = 'error';
      console.error('Firebase init failed:', e);
      callback(computeDeal(null));
    }
  },

  /**
   * TODO(live): GitHub API (Issues or Projects) against the
   * jhmtndev/JHMTNDEV-tracker repo, filtered/labeled by category
   * (Real Estate / LBFD / Personal). Checking a box here should PATCH
   * the issue closed; adding a task should create an issue. Needs a
   * GitHub token stored as a Netlify env var, called from a serverless
   * function — never expose the token client-side.
   */
  getTasks() {
    return [
      { id: 't1', text: 'Call Hank — title review status update', meta: '179 Vista · Due today', category: 'Real Estate', tag: 'red', section: 'Priority' },
      { id: 't2', text: 'Review Nebo 28761 title report', meta: 'Project 2 · Due Sep 22', category: 'Real Estate', tag: 'amber', section: 'Priority' },
      { id: 't3', text: 'Prep investor deck for AIXO call — 179 Vista', meta: 'JH Mountain · Due Sep 24', category: 'Real Estate', tag: 'amber', section: 'Priority' },
      { id: 't4', text: 'Update LLC annual report — JH Mountain', meta: 'Entities · Sep 26', category: 'Real Estate', tag: 'blue', section: 'This Week' },
      { id: 't5', text: 'VOD Tactical — update membership price sheet', meta: 'Range · Sep 27', category: 'Personal', tag: 'amber', section: 'This Week' },
      { id: 't6', text: 'Post weekly content — IG + YouTube', meta: 'Social · Sep 28', category: 'Personal', tag: 'blue', section: 'This Week' },
      { id: 't7', text: 'Confirm Clayton delivery window — 179 Vista', meta: '179 Vista · Sep 30', category: 'Real Estate', tag: 'amber', section: 'This Week' },
    ];
  },

  /**
   * Financial snapshot fields stay manual for v1 (per plan) — persisted
   * to localStorage for now. TODO(live, later phase): move this to a
   * small persistent store (Firebase RTDB alongside the checklist data)
   * if it needs to follow Will across devices instead of per-browser.
   */
  loadFinancials() {
    try {
      const raw = localStorage.getItem('ops-dashboard-financials');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  },
  saveFinancials(data) {
    try {
      localStorage.setItem('ops-dashboard-financials', JSON.stringify(data));
    } catch (e) { /* best-effort */ }
  },

  loadTaskState() {
    try {
      const raw = localStorage.getItem('ops-dashboard-task-state');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  },
  saveTaskState(state) {
    try {
      localStorage.setItem('ops-dashboard-task-state', JSON.stringify(state));
    } catch (e) { /* best-effort */ }
  },

  /**
   * Overall sync status shown top-right and on the task panel.
   * Reflects the Firebase deal connection now that it's live; Calendar
   * and GitHub tasks still need wiring, so this stays 'pending' until
   * all three sources report in (see subscribeActiveDeal above).
   */
  _syncStatus: 'pending',
  getSyncStatus() {
    return this._syncStatus;
  },
};
