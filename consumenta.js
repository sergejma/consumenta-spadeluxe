/* ============================================================
   Consumenta 2026 · Countdown, freie Slots, Interesse, Bestätigung
   Ergänzt ../app.js und muss davor eingebunden sein: Beim Absenden schreibt
   dieses Skript Interesse und Herkunft als Text in das Feld „Description".
   Erst danach sendet app.js. Der Termin selbst wird am Telefon abgestimmt.

   Freie Slots (Festlegung Sergej, 22.10.2026): Jeder Besucher sieht eine Zahl,
   die mit den Tagen sinkt. Start SLOTS.start beim ersten Besuch, je Tag minus
   eins, nie unter SLOTS.min. Gespeichert im Browser (localStorage).
   ============================================================ */

(() => {
  'use strict';

  const MESSE = {
    start: '2026-10-31',
    ende: '2026-11-08',
  };
  const SLOTS = { start: 7, min: 3, speicher: 'spa_consumenta_slots_seit' };

  const params = new URLSearchParams(window.location.search);
  const ohne = (params.get('ohne') || '').split(',');

  // ?ohne=header (nur für ganzseitige Bildschirmfotos): ohne die feste Kopfzeile, app.js prüft vorher, ob sie da ist.
  if (ohne.indexOf('header') !== -1) {
    const kopf = document.getElementById('site-header');
    if (kopf) kopf.remove();
  }
  // ?ohne=cookies (nur für Bildschirmfotos): zählt wie „Nur Notwendige", app.js zeigt dann kein Banner.
  if (ohne.indexOf('cookies') !== -1) {
    try {
      if (!localStorage.getItem('cookie-consent')) localStorage.setItem('cookie-consent', 'essential');
    } catch (e) { /* privater Modus */ }
  }

  // ---------- Vorschau der Bestätigung ----------
  // ?vorschau=danke legt den Eintrag an, den app.js nach dem Absenden selbst schreibt;
  // app.js zeigt dann beim Laden sofort die Bestätigung. ?vorschau=formular setzt zurück.
  const vorschau = params.get('vorschau');
  if (vorschau === 'danke') {
    try { sessionStorage.setItem('spa_lead_consumenta', JSON.stringify({ first: 'Anna', funnel: 'consumenta', ort: 'Nürnberg (Fürth)' })); } catch (e) { /* privater Modus */ }
  } else if (vorschau === 'formular') {
    try { sessionStorage.removeItem('spa_lead_consumenta'); } catch (e) { /* privater Modus */ }
  }

  // ---------- Datumshelfer ----------
  function datum(iso) {
    const t = iso.split('-').map(Number);
    return new Date(t[0], t[1] - 1, t[2]);
  }

  // ---------- Countdown im Hero ----------
  const countdown = document.querySelector('[data-countdown]');
  if (countdown) {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const bisStart = Math.round((datum(MESSE.start) - heute) / 86400000);
    let text;
    if (bisStart > 1) text = 'noch ' + bisStart + ' Tage';
    else if (bisStart === 1) text = 'morgen geht es los';
    else if (bisStart === 0) text = 'heute geht es los';
    else if (heute <= datum(MESSE.ende)) text = 'läuft gerade';
    else text = 'vorbei';
    countdown.textContent = text;
  }

  // ---------- Freie Slots je Besucher ----------
  function freieSlots() {
    let seit = null;
    try {
      seit = Number(localStorage.getItem(SLOTS.speicher)) || null;
      if (!seit) { seit = Date.now(); localStorage.setItem(SLOTS.speicher, String(seit)); }
    } catch (e) { seit = Date.now(); }
    const tage = Math.floor((Date.now() - seit) / 86400000);
    return Math.max(SLOTS.min, SLOTS.start - tage);
  }
  const slots = freieSlots();
  document.querySelectorAll('[data-frei-kurz]').forEach((el) => {
    const gross = /^[A-ZÄÖÜ]/.test(el.textContent.trim());
    el.textContent = (gross ? 'Nur noch ' : 'nur noch ') + slots;
  });

  // ---------- Interesse (Chips) ----------
  const chips = document.querySelectorAll('[data-interesse] .chip');
  let interesse = 'Whirlpool';
  chips.forEach((chip) => {
    if (chip.getAttribute('aria-pressed') === 'true') interesse = chip.dataset.wert || interesse;
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      interesse = chip.dataset.wert || '';
    });
  });

  // ---------- Absenden: Interesse und Herkunft in die Beschreibung, dann app.js ----------
  const form = document.getElementById('lead-form');
  const beschreibung = document.getElementById('lead-description');
  const herkunft = document.getElementById('lead-herkunft');
  if (form) {
    form.addEventListener('submit', () => {
      const teile = ['Consumenta 2026, Slot reserviert, Termin wird am Telefon abgestimmt', 'Interesse: ' + (interesse || 'keine Angabe')];
      if (herkunft && herkunft.value) teile.push('Erfahren über: ' + herkunft.value);
      if (beschreibung) beschreibung.value = teile.join(' · ');
    }, true);
  }
})();
