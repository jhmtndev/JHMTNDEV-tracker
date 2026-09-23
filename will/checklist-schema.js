/* ==========================================================================
   Checklist schema — mirrors jhmtndev.com/dashboard
   ==========================================================================
   Firebase stores ONLY the live state per task (checked / note / amount),
   keyed by "{phaseId}_{sectionIndex}_{itemIndex}". The task TEXT, owner,
   and phase structure live in dashboard.html's own PHASES constant, not in
   Firebase. So this file mirrors that structure (titles + item text + owner
   only — duration/notes/docs trimmed since this dashboard doesn't need
   them) to compute "what phase are we in" and "what's the next task."

   IMPORTANT: if the checklist structure on jhmtndev.com/dashboard changes
   (tasks added/removed/reordered), this file needs the same edit or the
   phase/next-task numbers here will drift from the real tracker. The
   longer-term fix is pulling PHASES out of dashboard.html into one shared
   JSON file both pages load — worth doing once this is stable.
   ========================================================================== */

window.ChecklistSchema = {
  firebaseConfig: {
    apiKey: "AIzaSyB4kTOOoAWja67qyVhSpaArSOW-25UhgtU",
    authDomain: "jhmtndev-dashboard.firebaseapp.com",
    databaseURL: "https://jhmtndev-dashboard-default-rtdb.firebaseio.com",
    projectId: "jhmtndev-dashboard",
    storageBucket: "jhmtndev-dashboard.firebasestorage.app",
    messagingSenderId: "1072891591745",
    appId: "1:1072891591745:web:28030309bc57ce74c0dac0",
  },
  projectPath: 'jhm/project1', // 179 Vista

  phases: [
    { id: 'p0', short: 'Pre-Close', title: 'Land under contract — pre-close',
      sections: [
        { items: [
          { t: 'Land deposit paid — permission to perc test obtained', o: 'Owner' },
          { t: 'Health department permit and inspection scheduled', o: 'Hank' },
          { t: 'Equipment mobilized for perc test', o: 'Hank' },
          { t: 'Perc test completed — results received', o: 'Hank' },
          { t: 'Septic design finalized (Boyds)', o: 'Hank' },
          { t: 'Septic permit application prepared — ready to submit', o: 'Hank' },
          { t: 'Well permit application prepared — ready to submit', o: 'Hank' },
          { t: 'Building permit application prepared', o: 'Hank' },
          { t: 'Survey completed (if required)', o: 'Owner' },
          { t: 'Site plan drafted', o: 'Hank' },
        ]},
        { items: [
          { t: 'Horizontal construction quote received', o: 'Hank' },
          { t: 'Septic contractor confirmed and scheduled', o: 'Hank' },
          { t: 'Well driller soft-scheduled — 3 drillers on hook', o: 'Owner' },
          { t: 'Unit selected, pricing locked, build slot reserved', o: 'Brock' },
          { t: 'Full funding stack verified and ready to wire', o: 'Will' },
          { t: 'Investor agreements signed — wire date confirmed', o: 'Will' },
        ]},
      ]},
    { id: 'p1', short: 'Close & Horiz.', title: 'Land close & horizontal construction',
      sections: [
        { items: [
          { t: 'Close on raw land', o: 'Owner' },
          { t: 'Submit septic permit application', o: 'Hank' },
          { t: 'Submit well permit application', o: 'Hank' },
          { t: 'Submit building permit application', o: 'Hank' },
          { t: 'Wire deposit to manufacturer', o: 'Will' },
        ]},
        { items: [
          { t: 'Land clearing and grading begins', o: 'Hank' },
          { t: 'Home location pinned out on lot', o: 'Hank' },
          { t: 'Well location confirmed — permitting & scheduling started', o: 'Hank' },
          { t: 'Septic system installed', o: 'Hank' },
          { t: 'Septic permit received', o: 'Hank' },
          { t: 'Final grade confirmed', o: 'Hank' },
          { t: 'Grass seed, lime, and straw spread', o: 'Hank' },
          { t: 'Footers poured', o: 'Subs' },
          { t: 'Manufactured unit order confirmed — build in progress', o: 'Brock' },
        ]},
      ]},
    { id: 'p2', short: 'Delivery & Set', title: 'Unit delivery & set',
      sections: [
        { items: [
          { t: 'Home delivered to site', o: 'Subs' },
          { t: 'Set crew installs unit on footers — building married', o: 'Subs' },
          { t: 'Marriage inspection passed', o: 'Owner' },
          { t: 'Siding and trim-out crew completes exterior', o: 'Subs' },
          { t: 'Deck installer contacted and scheduled', o: 'Owner' },
        ]},
      ]},
    { id: 'p3', short: 'Sub-Work', title: 'Sub work — utilities & exterior finish',
      sections: [
        { items: [
          { t: 'Electrical rough-in and panel installed', o: 'Subs' },
          { t: 'Power company contacted — site visit scheduled', o: 'Owner' },
          { t: 'Electrical inspection passed', o: 'Owner' },
          { t: 'Meter installed on meter base', o: 'Utility Co.' },
        ]},
        { items: [
          { t: 'Plumbing rough-in and connection installed', o: 'Subs' },
          { t: 'Plumbing inspection passed', o: 'Owner' },
        ]},
        { items: [
          { t: 'HVAC installed', o: 'Subs' },
          { t: 'HVAC inspection passed', o: 'Owner' },
        ]},
        { items: [
          { t: 'Well drilled and connected', o: 'Owner' },
        ]},
        { items: [
          { t: 'Gutters installed', o: 'Subs' },
          { t: 'Decks installed', o: 'Subs' },
          { t: 'Footers for underpinning dug and poured', o: 'Subs' },
          { t: 'Under-skirt brick laid', o: 'Subs' },
          { t: 'Vapor barrier installed', o: 'Subs' },
        ]},
      ]},
    { id: 'p4', short: 'Inspect & List', title: 'Inspections, punch-out & list',
      sections: [
        { items: [
          { t: 'Final inspection and Certificate of Occupancy obtained', o: 'Owner' },
          { t: 'Power on — startup of electrical, HVAC, and water', o: 'Owner' },
        ]},
        { items: [
          { t: 'Fix-it and cleaning crew — full punch list', o: 'Owner' },
          { t: 'Realtor listing agreement signed (both members required)', o: 'Owner' },
          { t: 'Professional photos and listing prep', o: 'Owner' },
        ]},
        { items: [
          { t: 'Property listed for sale', o: 'Owner' },
          { t: 'Offer accepted', o: 'Owner' },
          { t: 'Buyer inspection cleared', o: 'Owner' },
          { t: 'CLOSED — collect profit', o: 'Owner' },
        ]},
        { items: [
          { t: 'Next lot under contract', o: 'Owner' },
          { t: 'Phase 0 checklist initiated for Deal #2', o: 'Owner' },
        ]},
      ]},
  ],
};
