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
   * TODO(live): read from the Obsidian vault (the FlipOps XO project note
   * for the active deal) or Firebase Realtime Database if the phase/task
   * tracker moves there. Whichever source is used, this should return the
   * single current active deal — JH Mountain Development runs one deal
   * at a time through the AIXO program phases.
   */
  getActiveDeal() {
    return {
      name: '179 Vista Drive',
      meta: 'AIXO Program · Nebo, NC 28761',
      status: 'ACTIVE',
      priorDeal: { name: '67 Vista', status: 'CLOSED' },
      profit: '$51K',
      invested: '$8K',
      close: "Q3 '27",
      phase: 1, // 1-5: Acquire, Permit, Build, C/O, Close
      phaseName: 'Acquisition',
      nextTask: 'Title report review + go/no-go',
      nextTaskMeta: 'Due Sep 22 · Will',
      notes: '',
    };
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
   * TODO(live): reflect real connection state to Google Calendar /
   * GitHub / Firebase once wired — 'ok' | 'pending' | 'error'.
   */
  getSyncStatus() {
    return 'pending'; // no live sources wired yet
  },
};
