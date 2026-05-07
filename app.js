/* ═══════════════════════════════════════════════════════
   HYROX TRAINING LOGGER — app.js
   Supabase-backed cross-device sync
═══════════════════════════════════════════════════════ */

/* ── SUPABASE SETUP ── */
let sbClient = null;

function saveConfig() {
  let url = document.getElementById('sb-url').value.trim();
  const key = document.getElementById('sb-key').value.trim();
  if (!url || !key) { showConfigErr('Please fill in both fields.'); return; }
  // Strip any trailing slashes or paths — just keep the base URL
  url = url.replace(/\/(rest|auth|storage|realtime).*$/,'').replace(/\/+$/,'');
  if (!url.startsWith('https://')) { showConfigErr('URL should start with https://'); return; }
  localStorage.setItem('sb_url', url);
  localStorage.setItem('sb_key', key);
  initSupabase(url, key);
}

function showConfigErr(msg) {
  const e = document.getElementById('config-err');
  e.textContent = msg; e.classList.add('on');
}

async function initSupabase(url, key) {
  try {
    sbClient = window.supabase.createClient(url, key);
    // Just connect — don't test, go straight in
    document.getElementById('config-screen').classList.add('hidden');
    await loadHistory();
    renderDayPills();
    renderDay();
    setTimeout(()=>{ const c=document.querySelector('.ex-card'); if(c) c.classList.add('open'); },100);
    setSyncStatus('ok','Synced');
  } catch(e) {
    showConfigErr('Could not connect — check your URL and key.');
  }
}

function setSyncStatus(state, label) {
  const btn = document.getElementById('sync-btn');
  btn.className = 'sync-btn ' + state;
  btn.textContent = label;
}

async function syncNow() {
  setSyncStatus('syncing', 'Syncing…');
  await loadHistory();
  renderHistory();
  setSyncStatus('ok', 'Synced');
}

/* ── INIT ── */
(async function init() {
  const url = localStorage.getItem('sb_url');
  const key = localStorage.getItem('sb_key');
  if (url && key) {
    await initSupabase(url, key);
  }
  // If no config, config screen stays visible
})();

/* ═══════════════════════════════════════════════════════
   YOUTUBE VIDEO LINKS
═══════════════════════════════════════════════════════ */
const VIDEOS = {
  'Back squat':'https://www.youtube.com/watch?v=bEv6CCg2BC8',
  'Romanian deadlift':'https://www.youtube.com/watch?v=hCDzSR6bW10',
  'Bulgarian split squat':'https://www.youtube.com/watch?v=2C-uNgKwPLE',
  'Leg press':'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
  'Leg curl':'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
  'Cable pull-through':'https://www.youtube.com/watch?v=pYcpY20QaE8',
  'Glute drive machine':'https://www.youtube.com/watch?v=SEdqd1n0cvg',
  'Nordic curl':'https://www.youtube.com/watch?v=F8ZdHbMgAT8',
  'Sled push':'https://www.youtube.com/watch?v=C9p0PBCvFRk',
  'Sled drag':'https://www.youtube.com/watch?v=C9p0PBCvFRk',
  'Flat DB press':'https://www.youtube.com/watch?v=QsYre__-aro',
  'Incline DB press':'https://www.youtube.com/watch?v=8iPEnn-ltC8',
  'Cable fly':'https://www.youtube.com/watch?v=Iwe6AmxVf7o',
  'Incline cable fly':'https://www.youtube.com/watch?v=Iwe6AmxVf7o',
  'Machine chest press':'https://www.youtube.com/watch?v=xUm0BiZCX_g',
  'Flat barbell bench press':'https://www.youtube.com/watch?v=rT7DgCr-3pg',
  'Seated cable row':'https://www.youtube.com/watch?v=GZbfZ033f74',
  'Seated row':'https://www.youtube.com/watch?v=GZbfZ033f74',
  'Lat pulldown':'https://www.youtube.com/watch?v=CAwf7n6Luuc',
  'Single-arm DB row':'https://www.youtube.com/watch?v=roCP6wCXPqo',
  'Single-arm cable row':'https://www.youtube.com/watch?v=roCP6wCXPqo',
  'Face pull':'https://www.youtube.com/watch?v=rep-qVOkqgk',
  'Tricep pushdown':'https://www.youtube.com/watch?v=2-LAMcpzODU',
  'Cable overhead tricep ext':'https://www.youtube.com/watch?v=d_KZxkY_0cM',
  'Cable bicep curl':'https://www.youtube.com/watch?v=NFzTWp2qpiE',
  'Incline DB curl':'https://www.youtube.com/watch?v=soxrZlIl35U',
  'Hammer curl':'https://www.youtube.com/watch?v=zC3nLlEvin4',
  'Bicep curl':'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
  'Chest-supported row':'https://www.youtube.com/watch?v=dOJFnhsHFhg',
  'Weighted pull-up':'https://www.youtube.com/watch?v=eGo4IYlbE5g',
  'Pendlay row':'https://www.youtube.com/watch?v=SFG7LLFO-no',
  'Trap bar deadlift':'https://www.youtube.com/watch?v=hHstPuT_8AQ',
  'Conventional deadlift':'https://www.youtube.com/watch?v=op9kVnSso6Q',
  'DB reverse lunge':'https://www.youtube.com/watch?v=xrjMxOzMKAE',
  'Cable woodchop':'https://www.youtube.com/watch?v=UPGhELZ-F2g',
  'Ab wheel rollout':'https://www.youtube.com/watch?v=FiE_oKJFtME',
  'Hanging knee raise':'https://www.youtube.com/watch?v=Pr1ieGZ5atk',
  'Hanging leg raise':'https://www.youtube.com/watch?v=Pr1ieGZ5atk',
  'Landmine rotation':'https://www.youtube.com/watch?v=6F_WlAEH10A',
  'Ski erg':'https://www.youtube.com/watch?v=aDNVT0rF2-g',
  'Wall ball':'https://www.youtube.com/watch?v=fpUD0mcFp_0',
  'Farmers carry':'https://www.youtube.com/watch?v=Fkzk_RqlYig',
  'Rowing':'https://www.youtube.com/watch?v=zQ82RYIFLN8',
  'Burpee broad jump':'https://www.youtube.com/watch?v=3oGD0s7h6no',
  'KB swing':'https://www.youtube.com/watch?v=YSxHifyI6s8',
  'Assault bike':'https://www.youtube.com/watch?v=BI7A-tCFSqI',
};


/* ═══════════════════════════════════════════════════════
   EXERCISE GIFs — Tenor/Giphy public embed IDs
   Each maps to a looping animation of the movement
═══════════════════════════════════════════════════════ */
const EXERCISE_GIFS = {
  squat:       'https://media.tenor.com/Eq3IxGMuFLUAAAAM/barbell-squat.gif',
  rdl:         'https://media.tenor.com/2A1ztk1oGM0AAAAM/rdl-romanian-deadlift.gif',
  bss:         'https://media.tenor.com/eJbERlGN1HEAAAAM/bulgarian-split-squat.gif',
  legpress:    'https://media.tenor.com/1cTGKCx3QFAAAAAM/leg-press.gif',
  legcurl:     'https://media.tenor.com/CiHPBz-Q5ZQAAAAM/leg-curl.gif',
  glutedrive:  'https://media.tenor.com/Xy6GQR2n3VUAAAAM/hip-thrust.gif',
  sled:        'https://media.tenor.com/kFlRJMF6_IMAAAAM/sled-push.gif',
  nordic:      'https://media.tenor.com/oLJ3Ua73qFYAAAAM/nordic-curl.gif',
  pullthrough: 'https://media.tenor.com/c2KNR6UqY3MAAAAM/cable-pull-through.gif',
  dbpress:     'https://media.tenor.com/qrx1U3bPdVEAAAAM/dumbbell-bench-press.gif',
  inclinepress:'https://media.tenor.com/eiPUDfOXqe4AAAAM/incline-dumbbell-press.gif',
  cablefly:    'https://media.tenor.com/Tl8nZ8WT-LIAAAAM/cable-fly.gif',
  machinepress:'https://media.tenor.com/xUm0BiZCX_gAAAAM/chest-press-machine.gif',
  cablerow:    'https://media.tenor.com/rQkxKkGQB2EAAAAM/seated-cable-row.gif',
  pulldown:    'https://media.tenor.com/JEIDYbxaHAsAAAAM/lat-pulldown.gif',
  dbrow:       'https://media.tenor.com/Dc3MhXIRxd8AAAAM/dumbbell-row.gif',
  facepull:    'https://media.tenor.com/rep-qVOkqgkAAAAM/face-pull.gif',
  pullup:      'https://media.tenor.com/SbGODFMPdlEAAAAM/pull-up-weighted.gif',
  pendlay:     'https://media.tenor.com/SFG7LLFO-noAAAAM/pendlay-row.gif',
  csrow:       'https://media.tenor.com/dOJFnhsHFhgAAAAM/chest-supported-row.gif',
  pushdown:    'https://media.tenor.com/2-LAMcpzODUAAAAM/tricep-pushdown.gif',
  curl:        'https://media.tenor.com/ykJmrZ5v0OoAAAAM/bicep-curl.gif',
  skierg:      'https://media.tenor.com/aDNVT0rF2-gAAAAM/ski-erg.gif',
  wallball:    'https://media.tenor.com/fpUD0mcFp_0AAAAM/wall-ball.gif',
  farmerscarry:'https://media.tenor.com/Fkzk_RqlYigAAAAM/farmers-carry.gif',
  rowing:      'https://media.tenor.com/zQ82RYIFLN8AAAAM/rowing-machine.gif',
  burpee:      'https://media.tenor.com/3oGD0s7h6noAAAAM/burpee-broad-jump.gif',
  kbswing:     'https://media.tenor.com/YSxHifyI6s8AAAAM/kettlebell-swing.gif',
  bike:        'https://media.tenor.com/BI7A-tCFSqIAAAAM/assault-bike.gif',
  trapbar:     'https://media.tenor.com/hHstPuT_8AQAAAAM/trap-bar-deadlift.gif',
  woodchop:    'https://media.tenor.com/UPGhELZ-F2gAAAAM/cable-woodchop.gif',
  abwheel:     'https://media.tenor.com/FiE_oKJFtMEAAAAM/ab-wheel-rollout.gif',
  hangingknee: 'https://media.tenor.com/Pr1ieGZ5atkAAAAM/hanging-knee-raise.gif',
  landmine:    'https://media.tenor.com/6F_WlAEH10AAAAAM/landmine-rotation.gif',
};

function getExerciseMedia(diagramKey, exerciseName) {
  const gif = EXERCISE_GIFS[diagramKey];
  if (gif) {
    return `<div class="ex-gif-wrap">
      <img src="${gif}" alt="${exerciseName}" class="ex-gif"
        onerror="this.parentElement.innerHTML='<div class=\'ex-gif-fallback\'>${exerciseName}</div>'"
        loading="lazy">
    </div>`;
  }
  return `<div class="ex-gif-wrap"><div class="ex-gif-fallback">${exerciseName}</div></div>`;
}

/* ═══════════════════════════════════════════════════════
   MOBILITY / RECOVERY DIAGRAMS
═══════════════════════════════════════════════════════ */
const MOBILITY_DIAGRAMS = {
  hipflexor:`<svg viewBox="0 0 100 120" fill="none"><circle cx="55" cy="14" r="9" fill="#8fe8c4" opacity=".9"/><line x1="55" y1="23" x2="52" y2="52" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="52" y1="38" x2="38" y2="44" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="52" y1="38" x2="66" y2="44" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="52" y1="52" x2="40" y2="54" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="40" y1="54" x2="30" y2="80" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="30" y1="80" x2="24" y2="100" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="52" y1="52" x2="64" y2="54" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="64" y1="54" x2="72" y2="75" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="72" y1="75" x2="88" y2="78" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="30" cy="100" rx="10" ry="4" fill="#8fe8c4" opacity=".25" stroke="#8fe8c4" stroke-width="1"/><line x1="8" y1="104" x2="92" y2="104" stroke="#7a7f8a" stroke-width="1" stroke-dasharray="5,4"/><path d="M58 48 Q68 38 72 50" stroke="#8fe8c4" stroke-width="1.5" fill="none" opacity=".7"/><text x="50" y="116" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">lunge position, push hips fwd</text></svg>`,
  hamfloss:`<svg viewBox="0 0 100 120" fill="none"><circle cx="50" cy="22" r="9" fill="#8fe8c4" opacity=".9"/><line x1="50" y1="31" x2="48" y2="58" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="48" y1="44" x2="32" y2="50" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="48" y1="44" x2="64" y2="50" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="48" y1="58" x2="38" y2="60" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="38" y1="60" x2="30" y2="92" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="48" y1="58" x2="58" y2="60" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="58" y1="60" x2="72" y2="92" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><path d="M38 60 Q34 76 30 92" stroke="#8fe8c4" stroke-width="2" stroke-dasharray="3,2" fill="none" opacity=".7"/><text x="50" y="112" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">soft knees, hinge forward</text></svg>`,
  pigeon:`<svg viewBox="0 0 100 120" fill="none"><line x1="5" y1="95" x2="95" y2="95" stroke="#7a7f8a" stroke-width="1" stroke-dasharray="5,4"/><circle cx="30" cy="52" r="9" fill="#8fe8c4" opacity=".9"/><line x1="30" y1="61" x2="50" y2="78" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="30" y1="68" x2="14" y2="64" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="78" x2="42" y2="95" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="78" x2="62" y2="82" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="62" y1="82" x2="82" y2="78" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="82" y1="78" x2="90" y2="95" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><text x="50" y="110" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">front shin across, sink hips</text></svg>`,
  thoracic:`<svg viewBox="0 0 100 120" fill="none"><ellipse cx="50" cy="88" rx="44" ry="10" fill="#242830" stroke="#8fe8c4" stroke-width="1.5"/><circle cx="30" cy="52" r="9" fill="#8fe8c4" opacity=".9"/><line x1="30" y1="61" x2="50" y2="80" stroke="#f0f0ee" stroke-width="4" stroke-linecap="round"/><line x1="30" y1="66" x2="12" y2="60" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="80" x2="68" y2="74" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="80" x2="40" y2="88" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="80" x2="62" y2="88" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><path d="M28 56 Q38 44 48 54" stroke="#8fe8c4" stroke-width="1.5" fill="none" opacity=".7"/><text x="50" y="112" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">roller across upper back, rotate</text></svg>`,
  doorwaypec:`<svg viewBox="0 0 100 120" fill="none"><rect x="5" y="5" width="8" height="110" rx="2" fill="#242830" stroke="#7a7f8a" stroke-width="1"/><rect x="87" y="5" width="8" height="110" rx="2" fill="#242830" stroke="#7a7f8a" stroke-width="1"/><circle cx="50" cy="38" r="9" fill="#8fe8c4" opacity=".9"/><line x1="50" y1="47" x2="50" y2="82" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="56" x2="13" y2="56" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="56" x2="87" y2="56" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="82" x2="38" y2="85" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="82" x2="62" y2="85" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><text x="50" y="108" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">arms at 90 deg, lean fwd gently</text></svg>`,
  crossbody:`<svg viewBox="0 0 100 120" fill="none"><circle cx="50" cy="22" r="9" fill="#8fe8c4" opacity=".9"/><line x1="50" y1="31" x2="50" y2="65" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="42" x2="22" y2="52" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="52" x2="14" y2="44" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="42" x2="72" y2="48" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="72" y1="48" x2="60" y2="38" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><path d="M72 48 Q78 42 82 48 Q78 54 72 48" stroke="#8fe8c4" stroke-width="1.5" fill="none" opacity=".6"/><line x1="50" y1="65" x2="40" y2="68" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="40" y1="68" x2="34" y2="96" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="65" x2="60" y2="68" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="60" y1="68" x2="66" y2="96" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><text x="50" y="112" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">pull arm across chest, hold</text></svg>`,
  bandER:`<svg viewBox="0 0 100 120" fill="none"><circle cx="50" cy="20" r="9" fill="#8fe8c4" opacity=".9"/><line x1="50" y1="29" x2="50" y2="62" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="38" x2="30" y2="42" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="30" y1="42" x2="26" y2="58" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="38" x2="70" y2="42" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="70" y1="42" x2="82" y2="32" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><path d="M70 42 Q76 36 82 32" stroke="#8fe8c4" stroke-width="2" fill="none"/><circle cx="70" cy="42" r="3.5" fill="#8fe8c4" opacity=".4" stroke="#8fe8c4" stroke-width="1"/><line x1="26" y1="52" x2="10" y2="52" stroke="#8fe8c4" stroke-width="2" stroke-dasharray="3,2"/><line x1="50" y1="62" x2="40" y2="65" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="40" y1="65" x2="34" y2="95" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="62" x2="60" y2="65" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="60" y1="65" x2="66" y2="95" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><text x="50" y="112" text-anchor="middle" fill="#8fe8c4" font-size="8" font-family="Barlow Condensed">elbow pinned, rotate outward</text></svg>`,
  ytw:`<svg viewBox="0 0 100 120" fill="none"><circle cx="50" cy="55" r="8" fill="#8fe8c4" opacity=".9"/><line x1="50" y1="63" x2="50" y2="85" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="85" x2="40" y2="110" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="85" x2="60" y2="110" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="65" x2="24" y2="42" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="65" x2="76" y2="42" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><text x="24" y="36" text-anchor="middle" fill="#8fe8c4" font-size="10" font-family="Barlow Condensed" font-weight="700">Y</text><text x="76" y="36" text-anchor="middle" fill="#8fe8c4" font-size="10" font-family="Barlow Condensed" font-weight="700">Y</text><text x="50" y="20" text-anchor="middle" fill="#8fe8c4" font-size="9" font-family="Barlow Condensed">Y · T · W positions</text><text x="50" y="116" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">lie prone, raise in each shape</text></svg>`,
  sleeper:`<svg viewBox="0 0 100 120" fill="none"><line x1="5" y1="85" x2="95" y2="85" stroke="#7a7f8a" stroke-width="1" stroke-dasharray="5,4"/><circle cx="20" cy="50" r="9" fill="#8fe8c4" opacity=".9"/><line x1="20" y1="59" x2="55" y2="72" stroke="#f0f0ee" stroke-width="4" stroke-linecap="round"/><line x1="20" y1="64" x2="8" y2="72" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="55" y1="72" x2="55" y2="85" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="38" y1="66" x2="30" y2="82" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="38" y1="66" x2="50" y2="56" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><path d="M50 56 Q58 48 62 56" stroke="#8fe8c4" stroke-width="1.5" fill="none" opacity=".7"/><text x="50" y="108" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">lie on shoulder, push wrist down</text></svg>`,
  figure4:`<svg viewBox="0 0 100 120" fill="none"><line x1="5" y1="95" x2="95" y2="95" stroke="#7a7f8a" stroke-width="1" stroke-dasharray="5,4"/><circle cx="50" cy="22" r="9" fill="#8fe8c4" opacity=".9"/><line x1="50" y1="31" x2="50" y2="62" stroke="#f0f0ee" stroke-width="3" stroke-linecap="round"/><line x1="50" y1="48" x2="34" y2="52" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="48" x2="66" y2="52" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="62" x2="38" y2="64" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="38" y1="64" x2="28" y2="88" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="62" x2="62" y2="64" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="62" y1="64" x2="58" y2="82" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="58" y1="82" x2="36" y2="76" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><path d="M36 76 Q34 70 38 64" stroke="#8fe8c4" stroke-width="1.5" fill="none" opacity=".7"/><text x="50" y="112" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">ankle on knee, pull toward chest</text></svg>`,
  hip9090:`<svg viewBox="0 0 100 120" fill="none"><line x1="5" y1="95" x2="95" y2="95" stroke="#7a7f8a" stroke-width="1" stroke-dasharray="5,4"/><circle cx="50" cy="30" r="9" fill="#8fe8c4" opacity=".9"/><line x1="50" y1="39" x2="50" y2="65" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="65" x2="28" y2="68" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="68" x2="24" y2="95" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="65" x2="72" y2="80" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="72" y1="80" x2="82" y2="78" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><text x="14" y="60" fill="#8fe8c4" font-size="7" font-family="Barlow Condensed">90</text><text x="74" y="72" fill="#8fe8c4" font-size="7" font-family="Barlow Condensed">90</text><text x="50" y="112" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">both knees at 90 degrees, sit tall</text></svg>`,
  worldsgreatest:`<svg viewBox="0 0 100 120" fill="none"><line x1="5" y1="100" x2="95" y2="100" stroke="#7a7f8a" stroke-width="1" stroke-dasharray="5,4"/><circle cx="34" cy="38" r="9" fill="#8fe8c4" opacity=".9"/><line x1="34" y1="47" x2="50" y2="70" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="34" y1="54" x2="14" y2="48" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="14" y1="48" x2="10" y2="32" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="34" y1="54" x2="52" y2="60" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="70" x2="36" y2="72" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="36" y1="72" x2="22" y2="100" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="70" x2="64" y2="72" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="64" y1="72" x2="78" y2="100" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><circle cx="10" cy="32" r="5" fill="#8fe8c4" opacity=".3"/><text x="50" y="115" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">lunge + rotation + reach</text></svg>`,
  foamroll:`<svg viewBox="0 0 100 120" fill="none"><ellipse cx="50" cy="88" rx="44" ry="10" fill="#242830" stroke="#8fe8c4" stroke-width="1.5"/><circle cx="22" cy="50" r="9" fill="#8fe8c4" opacity=".9"/><line x1="22" y1="59" x2="60" y2="80" stroke="#f0f0ee" stroke-width="4.5" stroke-linecap="round"/><line x1="22" y1="64" x2="8" y2="62" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="60" y1="80" x2="48" y2="88" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="60" y1="80" x2="74" y2="88" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><path d="M30 66 Q45 58 58 66" stroke="#8fe8c4" stroke-width="1.5" fill="none" opacity=".6" stroke-dasharray="3,2"/><text x="50" y="112" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">slow rolls, pause on tight spots</text></svg>`,
  sauna:`<svg viewBox="0 0 100 120" fill="none"><rect x="10" y="20" width="80" height="75" rx="6" fill="#1c1f23" stroke="#f0b94a" stroke-width="1.5"/><rect x="18" y="28" width="64" height="12" rx="3" fill="#242830" stroke="#7a7f8a" stroke-width="1"/><rect x="18" y="44" width="64" height="12" rx="3" fill="#242830" stroke="#7a7f8a" stroke-width="1"/><rect x="18" y="60" width="64" height="12" rx="3" fill="#242830" stroke="#7a7f8a" stroke-width="1"/><circle cx="30" cy="34" r="5" fill="#f0b94a" opacity=".8"/><circle cx="50" cy="50" r="5" fill="#f0b94a" opacity=".6"/><circle cx="70" cy="66" r="5" fill="#f0b94a" opacity=".4"/><path d="M30 14 Q33 8 30 2" stroke="#f0b94a" stroke-width="1.5" fill="none" opacity=".6"/><path d="M50 14 Q53 8 50 2" stroke="#f0b94a" stroke-width="1.5" fill="none" opacity=".6"/><path d="M70 14 Q73 8 70 2" stroke="#f0b94a" stroke-width="1.5" fill="none" opacity=".6"/><text x="50" y="108" text-anchor="middle" fill="#f0b94a" font-size="8" font-family="Barlow Condensed">heat, recovery, adaptation</text></svg>`,
  run:`<svg viewBox="0 0 100 120" fill="none"><circle cx="55" cy="16" r="9" fill="#f05a5a" opacity=".9"/><line x1="55" y1="25" x2="50" y2="55" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="36" x2="34" y2="28" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="36" x2="68" y2="44" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="55" x2="38" y2="58" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="38" y1="58" x2="28" y2="85" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="85" x2="18" y2="100" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="55" x2="62" y2="58" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="62" y1="58" x2="72" y2="78" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="72" y1="78" x2="82" y2="95" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="5" y1="100" x2="95" y2="100" stroke="#7a7f8a" stroke-width="1" stroke-dasharray="5,4"/><text x="50" y="115" text-anchor="middle" fill="#f05a5a" font-size="8" font-family="Barlow Condensed">zone 2, conversational pace</text></svg>`,
  recovery:`<svg viewBox="0 0 100 120" fill="none"><circle cx="30" cy="82" r="22" fill="none" stroke="#7a7f8a" stroke-width="1.5"/><circle cx="30" cy="82" r="4" fill="#7a7f8a"/><circle cx="30" cy="82" r="14" fill="none" stroke="#f07a4a" stroke-width="1" stroke-dasharray="5,3" opacity=".5"/><line x1="30" y1="58" x2="44" y2="44" stroke="#7a7f8a" stroke-width="2"/><line x1="44" y1="44" x2="38" y2="34" stroke="#7a7f8a" stroke-width="2"/><line x1="44" y1="44" x2="52" y2="34" stroke="#7a7f8a" stroke-width="2"/><circle cx="68" cy="46" r="9" fill="#f07a4a" opacity=".9"/><line x1="68" y1="55" x2="64" y2="62" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><line x1="64" y1="60" x2="52" y2="36" stroke="#f0f0ee" stroke-width="2" stroke-linecap="round"/><line x1="64" y1="62" x2="50" y2="82" stroke="#f0f0ee" stroke-width="2.5" stroke-linecap="round"/><text x="55" y="112" text-anchor="middle" fill="#f07a4a" font-size="8" font-family="Barlow Condensed">HR under 120bpm, easy pace</text></svg>`,
  rest:`<svg viewBox="0 0 100 120" fill="none"><rect x="15" y="55" width="70" height="40" rx="6" fill="#1c1f23" stroke="#7a7f8a" stroke-width="1.5"/><rect x="15" y="45" width="24" height="18" rx="4" fill="#242830" stroke="#7a7f8a" stroke-width="1"/><circle cx="50" cy="42" r="14" fill="#1c1f23" stroke="#7a7f8a" stroke-width="1.5"/><line x1="50" y1="32" x2="50" y2="42" stroke="#7a7f8a" stroke-width="1.5" stroke-linecap="round"/><line x1="50" y1="42" x2="58" y2="48" stroke="#7a7f8a" stroke-width="1.5" stroke-linecap="round"/><path d="M35 25 Q38 18 35 12" stroke="#7a7f8a" stroke-width="1.5" fill="none" opacity=".5"/><path d="M50 22 Q53 15 50 9" stroke="#7a7f8a" stroke-width="1.5" fill="none" opacity=".5"/><path d="M65 25 Q68 18 65 12" stroke="#7a7f8a" stroke-width="1.5" fill="none" opacity=".5"/><text x="50" y="108" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">rest, where growth happens</text></svg>`,
};

function getExtraDiagram(ext) {
  const t = ext.type;
  const l = (ext.label||'').toLowerCase();
  if (t==='run') return MOBILITY_DIAGRAMS.run;
  if (t==='sauna') return MOBILITY_DIAGRAMS.sauna;
  if (t==='recovery') return MOBILITY_DIAGRAMS.recovery;
  if (t==='rest') return MOBILITY_DIAGRAMS.rest;
  if (l.includes('hip flexor')) return MOBILITY_DIAGRAMS.hipflexor;
  if (l.includes('hamstring')) return MOBILITY_DIAGRAMS.hamfloss;
  if (l.includes('pigeon')) return MOBILITY_DIAGRAMS.pigeon;
  if (l.includes('thoracic')) return MOBILITY_DIAGRAMS.thoracic;
  if (l.includes('pec')||l.includes('doorway')) return MOBILITY_DIAGRAMS.doorwaypec;
  if (l.includes('cross-body')||l.includes('shoulder')) return MOBILITY_DIAGRAMS.crossbody;
  if (l.includes('ytw')) return MOBILITY_DIAGRAMS.ytw;
  if (l.includes('sleeper')) return MOBILITY_DIAGRAMS.sleeper;
  if (l.includes('figure')||l.includes('glute')) return MOBILITY_DIAGRAMS.figure4;
  if (l.includes('90/90')||l.includes('hip')) return MOBILITY_DIAGRAMS.hip9090;
  if (l.includes('greatest')) return MOBILITY_DIAGRAMS.worldsgreatest;
  if (l.includes('foam')||l.includes('full body')) return MOBILITY_DIAGRAMS.foamroll;
  if (t==='rehab') return MOBILITY_DIAGRAMS.bandER;
  if (t==='mobility') return MOBILITY_DIAGRAMS.foamroll;
  return MOBILITY_DIAGRAMS.foamroll;
}

/* ═══════════════════════════════════════════════════════
   PROGRAMME DATA
═══════════════════════════════════════════════════════ */
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function getWeekBand(w) {
  w = parseInt(w);
  if (w <= 2) return '12';
  if (w <= 4) return '34';
  if (w <= 6) return '56';
  if (w === 7) return '7';
  return '8';
}

const PROGRAMME = {
  Monday: {
    focus: 'Lower body strength', type: 'gym',
    exercises: {
      '12': [
        {n:'Back squat',s:3,r:'8',m:['Quads','Glutes','Hamstrings'],c:'Bar on traps, chest up. Break hips and knees simultaneously. Knees track over toes.',d:'squat'},
        {n:'Romanian deadlift',s:3,r:'10',m:['Hamstrings','Glutes'],c:'Hinge at hips, soft knee, bar stays close to legs. Feel hamstring stretch at bottom.',d:'rdl'},
        {n:'Bulgarian split squat',s:3,r:'8 each',m:['Quads','Glutes'],c:'Rear foot elevated, torso upright. Drive through front heel. Control the descent.',d:'bss'},
        {n:'Leg press',s:3,r:'10',m:['Quads','Glutes'],c:'Feet shoulder-width, full range — thighs to chest. Don\'t lock out knees.',d:'legpress'},
        {n:'Leg curl',s:3,r:'12',m:['Hamstrings'],c:'Lie prone. Curl heel to glute, pause, lower with control. Hips stay down.',d:'legcurl'},
        {n:'Cable pull-through',s:3,r:'12',m:['Glutes','Hamstrings'],c:'Hinge at hips, cable between legs. Drive hips forward, squeeze glutes at top.',d:'pullthrough'},
      ],
      '34': [
        {n:'Back squat',s:4,r:'6',m:['Quads','Glutes','Hamstrings'],c:'Heavier this phase. Setup perfect before every rep. Brace hard.',d:'squat'},
        {n:'Romanian deadlift',s:4,r:'8',m:['Hamstrings','Glutes'],c:'Strict hinge. No lower back rounding. Load up.',d:'rdl'},
        {n:'Bulgarian split squat',s:3,r:'8 each',m:['Quads','Glutes'],c:'Rear foot elevated, torso upright. Drive through front heel.',d:'bss'},
        {n:'Leg press',s:4,r:'8',m:['Quads','Glutes'],c:'Full range. Controlled eccentric.',d:'legpress'},
        {n:'Leg curl',s:3,r:'10',m:['Hamstrings'],c:'Slow and deliberate. Feel the hamstring.',d:'legcurl'},
        {n:'Glute drive machine',s:3,r:'12',m:['Glutes'],c:'Shoulders on pad, feet flat. Drive hips up explosively. Pause at top.',d:'glutedrive'},
      ],
      '56': [
        {n:'Back squat',s:4,r:'5',m:['Quads','Glutes','Hamstrings'],c:'Heavy sets. Move well. No grinding reps.',d:'squat'},
        {n:'Romanian deadlift',s:4,r:'6',m:['Hamstrings','Glutes'],c:'Heavy hinge. Tight lats, strict form.',d:'rdl'},
        {n:'Sled push',s:3,r:'20m',m:['Quads','Glutes','Calves'],c:'Low body position, arms extended. Drive through legs. Short powerful steps.',d:'sled'},
        {n:'Leg press',s:3,r:'8',m:['Quads','Glutes'],c:'Full range. Heavy.',d:'legpress'},
        {n:'Nordic curl',s:3,r:'6',m:['Hamstrings'],c:'4-second eccentric. Catch with hands. Very demanding — start low.',d:'nordic'},
        {n:'Leg curl',s:3,r:'8',m:['Hamstrings'],c:'Controlled. Feel every rep.',d:'legcurl'},
      ],
      '7': [
        {n:'Back squat',s:5,r:'4',m:['Quads','Glutes','Hamstrings'],c:'Peak week. Heaviest squats of the programme.',d:'squat'},
        {n:'Romanian deadlift',s:4,r:'6',m:['Hamstrings','Glutes'],c:'Keep the hinge strict. No lower back rounding.',d:'rdl'},
        {n:'Sled push',s:4,r:'20m heavy',m:['Quads','Glutes'],c:'Race pace effort. Heavy load, explosive drive.',d:'sled'},
        {n:'Leg press',s:3,r:'8',m:['Quads','Glutes'],c:'Full range, controlled eccentric.',d:'legpress'},
        {n:'Leg curl',s:3,r:'8',m:['Hamstrings'],c:'Slow and deliberate.',d:'legcurl'},
        {n:'Nordic curl',s:3,r:'6',m:['Hamstrings'],c:'4s eccentric. Catch with hands if needed.',d:'nordic'},
      ],
      '8': [
        {n:'Back squat',s:3,r:'5',m:['Quads','Glutes','Hamstrings'],c:'Taper — same weight as week 7, one less set.',d:'squat'},
        {n:'Romanian deadlift',s:3,r:'8',m:['Hamstrings','Glutes'],c:'Same weight, less volume. Quality focus.',d:'rdl'},
        {n:'Bulgarian split squat',s:3,r:'6 each',m:['Quads','Glutes'],c:'Light and controlled.',d:'bss'},
        {n:'Leg curl',s:3,r:'10',m:['Hamstrings'],c:'Light to moderate. Flush the legs.',d:'legcurl'},
      ],
    },
    extras: [
      {type:'mobility',dot:'dot-mob',label:'Mobility — hips & hamstrings',dur:'+10 min',desc:'Hip flexor kneeling stretch · hamstring floss · ankle circles · pigeon pose'},
      {type:'sauna',dot:'dot-sau',label:'Sauna — 15–20 min',dur:'+15–20 min',desc:'Post-gym, before evening run. Helps flush the morning session.',cue:'Hydrate well before you run this evening.'},
      {type:'run',dot:'dot-run',label:'Easy 5k run',dur:'evening',desc:'Zone 2 — conversational pace. Should feel easy throughout.',logFields:['Distance (km)','Time','Avg HR']},
    ]
  },
  Tuesday: {
    focus: 'Chest + upper body + rehab', type: 'gym',
    exercises: {
      '12': [
        {n:'Flat DB press',s:3,r:'10',m:['Chest','Triceps','Front delt'],c:'DBs allow natural shoulder path. Retract scapula. Lower to chest, press up and slightly in.',d:'dbpress'},
        {n:'Cable fly',s:3,r:'12',m:['Chest'],c:'Arms slightly bent throughout. Wide arc inward. Feel the stretch at the outside, squeeze inside.',d:'cablefly'},
        {n:'Seated cable row',s:3,r:'10',m:['Lats','Rhomboids','Biceps'],c:'Sit tall, pull to lower chest, elbows tucked. Squeeze shoulder blades. Slow return.',d:'cablerow'},
        {n:'Lat pulldown',s:3,r:'10',m:['Lats','Biceps'],c:'Slight lean back. Pull bar to upper chest. Elbows drive down and back.',d:'pulldown'},
        {n:'Face pull',s:3,r:'15',m:['Rear delt','Rotator cuff'],c:'Cable at face height. Pull to forehead, elbows flare wide. Never skip this.',d:'facepull'},
        {n:'Tricep pushdown',s:3,r:'12',m:['Triceps'],c:'Elbows fixed at sides. Full extension. Control the return.',d:'pushdown'},
      ],
      '34': [
        {n:'Flat DB press',s:4,r:'8',m:['Chest','Triceps'],c:'Heavier now. Controlled 2s down, explosive up. Scapula retracted throughout.',d:'dbpress'},
        {n:'Incline DB press',s:3,r:'10',m:['Upper chest','Front delt'],c:'30–45 degree incline. Elbows at 45° to body — not flared wide. Targets upper chest safely.',d:'inclinepress'},
        {n:'Cable fly',s:3,r:'12',m:['Chest'],c:'Wide arc. Feel the stretch. Squeeze at the top.',d:'cablefly'},
        {n:'Chest-supported row',s:4,r:'8',m:['Lats','Rhomboids','Rear delt'],c:'Lie chest on incline bench. Row DBs up, elbows flared. No lower back involvement.',d:'csrow'},
        {n:'Lat pulldown',s:3,r:'10',m:['Lats','Biceps'],c:'Slight lean back. Elbows drive down and back.',d:'pulldown'},
        {n:'Face pull',s:3,r:'15',m:['Rear delt','Rotator cuff'],c:'Cable at face height. Elbows flare wide. Always.',d:'facepull'},
      ],
      '56': [
        {n:'Flat DB press',s:4,r:'6',m:['Chest','Triceps'],c:'Heavy sets. Controlled descent, strong drive. Log the weight.',d:'dbpress'},
        {n:'Incline DB press',s:3,r:'8',m:['Upper chest'],c:'30–45 degree incline. Elbows at 45°. Push through the sticking point.',d:'inclinepress'},
        {n:'Cable fly',s:3,r:'10',m:['Chest'],c:'Heavier cable. Slow eccentric. Squeeze hard at top.',d:'cablefly'},
        {n:'Weighted pull-up',s:3,r:'5',m:['Lats','Biceps'],c:'Belt weight. Full dead hang start. Pull chest to bar. Don\'t kip.',d:'pullup'},
        {n:'Pendlay row',s:4,r:'6',m:['Lats','Rhomboids','Traps'],c:'Bar rests on floor each rep. Explosive pull, horizontal back. Control descent.',d:'pendlay'},
        {n:'Face pull',s:3,r:'15',m:['Rear delt','Rotator cuff'],c:'Non-negotiable. Every week. Elbows wide.',d:'facepull'},
      ],
      '7': [
        {n:'Flat DB press',s:4,r:'6',m:['Chest','Triceps'],c:'Peak week — heaviest DB press of the programme.',d:'dbpress'},
        {n:'Incline DB press',s:4,r:'8',m:['Upper chest'],c:'Heavy. Elbows at 45°. Strong finish.',d:'inclinepress'},
        {n:'Cable fly',s:3,r:'10',m:['Chest'],c:'Heavy cable. Maximum stretch and squeeze.',d:'cablefly'},
        {n:'Weighted pull-up',s:4,r:'5',m:['Lats','Biceps'],c:'Heaviest belt weight yet. Full ROM.',d:'pullup'},
        {n:'Pendlay row',s:4,r:'5',m:['Lats','Rhomboids'],c:'Bar starts on floor. Explosive concentric, controlled eccentric.',d:'pendlay'},
        {n:'Face pull',s:3,r:'15',m:['Rear delt','Rotator cuff'],c:'Increase resistance if 15 feels easy.',d:'facepull'},
      ],
      '8': [
        {n:'Flat DB press',s:3,r:'8',m:['Chest','Triceps'],c:'Taper — moderate weight. Quality over load.',d:'dbpress'},
        {n:'Cable fly',s:3,r:'12',m:['Chest'],c:'Light-moderate. Feel the muscle.',d:'cablefly'},
        {n:'Lat pulldown',s:3,r:'8',m:['Lats','Biceps'],c:'Controlled. Good form.',d:'pulldown'},
        {n:'Seated row',s:3,r:'10',m:['Lats','Rhomboids'],c:'Controlled. Feel each muscle working.',d:'cablerow'},
        {n:'Face pull',s:3,r:'15',m:['Rear delt','Rotator cuff'],c:'Still never skip.',d:'facepull'},
      ],
    },
    extras: [
      {type:'rehab',dot:'dot-mob',label:'Rotator cuff rehab',dur:'+10 min',desc:'Band external rotation 3×15 · Side-lying ER 3×12 · YTW raise 3×10 · Sleeper stretch 2×30s each',cue:'Never skip this. The shoulder gets stronger every week you do it.'},
      {type:'mobility',dot:'dot-mob',label:'Mobility — thoracic & shoulder',dur:'+8 min',desc:'Thoracic rotation on foam roller · pec doorway stretch · cross-body shoulder stretch'},
      {type:'sauna',dot:'dot-sau',label:'Sauna — 15–20 min',dur:'+15–20 min',desc:'Heat exposure enhances recovery and muscle protein synthesis.'},
    ]
  },
  Wednesday: {
    focus: 'Conditioning / intervals', type: 'conditioning',
    exercises: {
      '12': [
        {n:'Ski erg',s:3,r:'500m',m:['Lats','Core','Shoulders'],c:'Arms drive down explosively, hinge at hips simultaneously. Find a sustainable pace.',d:'skierg'},
        {n:'Sled push',s:3,r:'20m',m:['Quads','Glutes','Calves'],c:'Low body position, arms extended. Drive through legs. Short powerful steps.',d:'sled'},
        {n:'Burpee broad jump',s:3,r:'8',m:['Full body'],c:'Chest to floor, explosive jump forward. Land soft. Hyrox staple.',d:'burpee'},
        {n:'KB swing',s:3,r:'15',m:['Glutes','Hamstrings','Core'],c:'Hip hinge — not a squat. Bell floats to shoulder height from hip drive. Squeeze glutes at top.',d:'kbswing'},
        {n:'Assault bike',s:3,r:'30s all-out',m:['Full body'],c:'Arms and legs working together. All-out effort. Rest 2 min between rounds.',d:'bike'},
      ],
      '34': [
        {n:'Ski erg',s:4,r:'750m',m:['Lats','Core','Shoulders'],c:'Find your race pace — not a sprint, not a cruise. Even splits.',d:'skierg'},
        {n:'Sled push',s:4,r:'25m',m:['Quads','Glutes','Calves'],c:'Load it heavier this phase. Low and powerful.',d:'sled'},
        {n:'Wall ball',s:4,r:'15',m:['Quads','Shoulders','Core'],c:'Full squat, throw to target on the way up. Catch and absorb on descent. Don\'t break rhythm.',d:'wallball'},
        {n:'Farmers carry',s:4,r:'30m',m:['Grip','Core','Traps'],c:'Heavy dumbbells or trap bar. Chest up, short stride, brace core. Key Hyrox event.',d:'farmerscarry'},
        {n:'Rowing',s:4,r:'250m',m:['Lats','Legs','Core'],c:'Drive legs first, then lean back, then pull arms. 60% legs, 20% body, 20% arms.',d:'rowing'},
      ],
      '56': [
        {n:'Ski erg',s:4,r:'1km',m:['Lats','Core','Shoulders'],c:'Race distance. Even splits. Don\'t go out too hard.',d:'skierg'},
        {n:'Sled push',s:4,r:'30m',m:['Quads','Glutes','Calves'],c:'Race-specific load. Consistent pace throughout.',d:'sled'},
        {n:'Wall ball',s:4,r:'20',m:['Quads','Shoulders','Core'],c:'Unbroken sets if possible. Breathe at top of each rep.',d:'wallball'},
        {n:'Burpee broad jump',s:4,r:'10',m:['Full body'],c:'Consistent rhythm. Don\'t sprint and die — find a pace you can sustain.',d:'burpee'},
        {n:'Rowing',s:4,r:'500m',m:['Lats','Legs','Core'],c:'Hyrox distance. Strong drive, controlled recovery. Target 1:50–2:00/500m.',d:'rowing'},
      ],
      '7': [
        {n:'Ski erg',s:5,r:'1km',m:['Lats','Core','Shoulders'],c:'Peak week — 5 full rounds. Hardest conditioning session. Dig in.',d:'skierg'},
        {n:'Sled push',s:5,r:'30m',m:['Quads','Glutes','Calves'],c:'Heavy load. Race effort. Go.',d:'sled'},
        {n:'Wall ball',s:5,r:'20',m:['Quads','Shoulders','Core'],c:'Unbroken. Find a breathing rhythm on the way up.',d:'wallball'},
        {n:'Burpee broad jump',s:5,r:'10',m:['Full body'],c:'Consistent. Don\'t sandbag early rounds.',d:'burpee'},
        {n:'Rowing',s:5,r:'500m',m:['Lats','Legs','Core'],c:'Strong finish on each piece. Leave it on the erg.',d:'rowing'},
      ],
      '8': [
        {n:'Ski erg',s:3,r:'500m',m:['Lats','Core','Shoulders'],c:'Taper. Crisp technique. Feel good.',d:'skierg'},
        {n:'Sled push',s:3,r:'20m',m:['Quads','Glutes'],c:'Light load, race technique. Sharp and snappy.',d:'sled'},
        {n:'Wall ball',s:3,r:'10',m:['Quads','Shoulders'],c:'Easy pace. Maintain rhythm.',d:'wallball'},
        {n:'Rowing',s:3,r:'250m',m:['Lats','Legs'],c:'Comfortable pace. Flush, don\'t fatigue.',d:'rowing'},
      ],
    },
    extras: [
      {type:'sauna',dot:'dot-sau',label:'Sauna — 15–20 min',dur:'+15–20 min',desc:'Post-conditioning. You\'ve sweated a lot — hydrate before entering.',cue:'Substitute any week: outdoor intervals 5×800m with 90s rest instead of gym circuit.'},
    ]
  },
  Thursday: {
    focus: 'Full body + chest + core', type: 'gym',
    exercises: {
      '12': [
        {n:'Trap bar deadlift',s:3,r:'8',m:['Hamstrings','Glutes','Quads','Back'],c:'Stand inside bar, hinge to grip handles. Push floor away. Chest tall.',d:'trapbar'},
        {n:'DB reverse lunge',s:3,r:'10 each',m:['Quads','Glutes'],c:'Step back, lower rear knee just above floor. Drive through front foot to stand. Stay upright.',d:'bss'},
        {n:'Machine chest press',s:3,r:'10',m:['Chest','Triceps'],c:'Fixed path keeps shoulder stable. Retract scapula. Full extension at top, controlled return.',d:'machinepress'},
        {n:'Cable woodchop',s:3,r:'12 each',m:['Core','Obliques'],c:'Cable high. Rotate and pull diagonally across body. Core fights the cable — resist the rotation.',d:'woodchop'},
        {n:'Ab wheel rollout',s:3,r:'8',m:['Core','Lats'],c:'Start from knees. Roll out slowly, back flat. Only go as far as you can return without sagging.',d:'abwheel'},
        {n:'Hanging knee raise',s:3,r:'10',m:['Lower abs','Hip flexors'],c:'Dead hang. Pull knees to chest. Lower with control — don\'t swing.',d:'hangingknee'},
      ],
      '34': [
        {n:'Trap bar deadlift',s:4,r:'6',m:['Hamstrings','Glutes','Quads','Back'],c:'Heavier this phase. Setup perfect before every rep. Brace and drive.',d:'trapbar'},
        {n:'DB reverse lunge',s:3,r:'10 each',m:['Quads','Glutes'],c:'Step back, lower rear knee just above floor. Drive through front foot.',d:'bss'},
        {n:'Machine chest press',s:4,r:'8',m:['Chest','Triceps'],c:'Heavier now. Controlled descent, strong press.',d:'machinepress'},
        {n:'Incline cable fly',s:3,r:'12',m:['Upper chest'],c:'Incline bench, cables low. Wide arc upward. Targets upper chest safely.',d:'cablefly'},
        {n:'Ab wheel rollout',s:3,r:'10',m:['Core','Lats'],c:'From knees. Push range further each week. Back stays flat.',d:'abwheel'},
        {n:'Hanging knee raise',s:3,r:'12',m:['Lower abs'],c:'Controlled. No swinging. Pause briefly at top.',d:'hangingknee'},
        {n:'Landmine rotation',s:3,r:'10 each',m:['Core','Obliques'],c:'Bar in landmine. Arms extended, rotate bar side to side. Hips stay square.',d:'landmine'},
      ],
      '56': [
        {n:'Conventional deadlift',s:4,r:'4',m:['Hamstrings','Glutes','Back'],c:'Barbell. Hip-width stance. Bar over mid-foot. Hinge down, lats tight, rip the floor. Heavy.',d:'trapbar'},
        {n:'Sled drag',s:3,r:'20m',m:['Hamstrings','Glutes'],c:'Face away from sled. Walk forward, sled drags behind. High steps, strong pull.',d:'sled'},
        {n:'Flat barbell bench press',s:3,r:'5',m:['Chest','Triceps','Front delt'],c:'Use a spotter. Scapula firmly retracted and depressed before unracking. Bar to chest, drive up.',d:'dbpress'},
        {n:'Cable fly',s:3,r:'10',m:['Chest'],c:'Heavier cable. Full stretch to strong squeeze.',d:'cablefly'},
        {n:'Ab wheel rollout',s:3,r:'10',m:['Core'],c:'From feet if back stays flat. Maximum anti-extension.',d:'abwheel'},
        {n:'Hanging leg raise',s:3,r:'12',m:['Lower abs'],c:'Legs straight to horizontal. Controlled return. No swinging.',d:'hangingknee'},
      ],
      '7': [
        {n:'Conventional deadlift',s:5,r:'4',m:['Hamstrings','Glutes','Back'],c:'Peak week. Heaviest deadlifts of the programme. Setup is everything.',d:'trapbar'},
        {n:'Sled drag',s:4,r:'20m',m:['Hamstrings','Glutes'],c:'Heavy load. Race-specific effort.',d:'sled'},
        {n:'Flat barbell bench press',s:4,r:'5',m:['Chest','Triceps'],c:'Peak chest on Thursday. Spotter required. Strong and controlled.',d:'dbpress'},
        {n:'Cable fly',s:3,r:'10',m:['Chest'],c:'Maximum stretch. Heavy.',d:'cablefly'},
        {n:'Ab wheel rollout',s:4,r:'10',m:['Core'],c:'From feet. Maximum anti-extension effort.',d:'abwheel'},
        {n:'Hanging leg raise',s:4,r:'12',m:['Lower abs'],c:'Straight legs to horizontal. Controlled.',d:'hangingknee'},
        {n:'Landmine rotation',s:3,r:'12 each',m:['Core','Obliques'],c:'Last heavy core day. Leave it all here.',d:'landmine'},
      ],
      '8': [
        {n:'Trap bar deadlift',s:3,r:'5',m:['Hamstrings','Glutes','Back'],c:'Taper. Same weight as recent sessions, one set less.',d:'trapbar'},
        {n:'Sled drag',s:3,r:'20m',m:['Hamstrings','Glutes'],c:'Moderate load. Stay sharp.',d:'sled'},
        {n:'Machine chest press',s:3,r:'8',m:['Chest','Triceps'],c:'Light-moderate. Flush the chest.',d:'machinepress'},
        {n:'Ab wheel rollout',s:3,r:'8',m:['Core'],c:'Controlled. Don\'t push to failure this week.',d:'abwheel'},
        {n:'Hanging knee raise',s:3,r:'10',m:['Lower abs'],c:'Clean reps. No swinging.',d:'hangingknee'},
      ],
    },
    extras: [
      {type:'mobility',dot:'dot-mob',label:'Mobility — glutes & hips',dur:'+10 min',desc:'Figure-4 glute stretch · piriformis · supine spinal twist · 90/90 hip'},
      {type:'sauna',dot:'dot-sau',label:'Sauna — 20 min',dur:'+20 min',desc:'Best sauna day — no gym until Friday. Longer sit, full recovery benefit.'},
    ]
  },
  Friday: {
    focus: 'Active recovery + mobility', type: 'recovery',
    exercises: {},
    extras: [
      {type:'recovery',dot:'dot-rec',label:'Active recovery cardio',dur:'15 min',desc:'Light rowing or assault bike — easy pace, HR under 120 bpm. Gets blood moving without taxing the body.',logFields:['Duration (min)','Machine used']},
      {type:'mobility',dot:'dot-mob',label:'Full body mobility session',dur:'+25 min',desc:'Foam roll: quads, IT band, lats, upper back · Hip 90/90 · World\'s greatest stretch · Quad/hip flexor · Shoulder cross-body · Doorway pec stretch · Lat stretch · Thoracic extension over roller · Wrist circles',cue:'Most important session for your flexibility — never skip this even if you skip the cardio.'},
      {type:'sauna',dot:'dot-sau',label:'Sauna — 20–25 min',dur:'+20–25 min',desc:'Longest sauna of the week. Parasympathetic, anti-inflammatory. Great for mental reset too.'},
    ]
  },
  Saturday: {
    focus: 'Rest', type: 'rest',
    exercises: {},
    extras: [
      {type:'rest',dot:'dot-rest',label:'Full rest day',dur:'all day',desc:'No structured training. Gentle walk if you want to move. Eat well, sleep early.',cue:'Recovery is where adaptation happens. Don\'t feel guilty about resting.'},
    ]
  },
  Sunday: { focus: 'Long run', type: 'run', exercises: {}, extras: [] }
};

function getSundayExtras(w) {
  w = parseInt(w);
  const isPk=w===7, isTp=w===8, isI=w>=5;
  const dist = w<=2?'7k':w<=4?'8k':isPk?'10k':isTp?'6k':'9k';
  const pace = isI&&!isTp ? 'Steady pace, then final 10–15 min at threshold (comfortably hard).' : 'Steady aerobic pace throughout. HR zone 2 — you should be able to hold a conversation.';
  return [{type:'run',dot:'dot-run',label:`Long run — ${dist}`,dur:'morning or evening',desc:pace,logFields:['Distance (km)','Time','Avg HR','Pace /km'],cue:isTp?'Taper week — keep it easy. Save your legs.':''}];
}

/* ═══════════════════════════════════════════════════════
   SVG DIAGRAMS
═══════════════════════════════════════════════════════ */
const DIAGRAMS = {
squat:`<svg viewBox="0 0 100 130" fill="none"><circle cx="50" cy="16" r="9" fill="#c8f04a"/><rect x="15" y="23" width="70" height="5" rx="2" fill="#8fe8c4" opacity=".8"/><line x1="50" y1="28" x2="46" y2="56" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="46" y1="38" x2="20" y2="26" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="46" y1="38" x2="78" y2="26" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="46" y1="56" x2="36" y2="56" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="46" y1="56" x2="56" y2="56" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="36" y1="56" x2="28" y2="90" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="90" x2="30" y2="115" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="56" y1="56" x2="64" y2="90" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="64" y1="90" x2="62" y2="115" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="30" y1="115" x2="20" y2="120" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="62" y1="115" x2="72" y2="120" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><text x="50" y="130" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">parallel depth</text></svg>`,
rdl:`<svg viewBox="0 0 100 130" fill="none"><circle cx="65" cy="12" r="9" fill="#c8f04a"/><line x1="65" y1="21" x2="25" y2="42" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="42" y1="31" x2="42" y2="65" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="27" y1="38" x2="27" y2="72" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><rect x="16" y="68" width="38" height="5" rx="2" fill="#8fe8c4" opacity=".8"/><line x1="65" y1="50" x2="60" y2="90" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="65" y1="50" x2="70" y2="90" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="60" y1="90" x2="55" y2="115" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="70" y1="90" x2="74" y2="115" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><path d="M65 50 Q68 70 60 90" stroke="#c8f04a" stroke-width="1.5" stroke-dasharray="3,2" fill="none" opacity=".7"/><text x="50" y="130" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">hinge not squat</text></svg>`,
bss:`<svg viewBox="0 0 100 130" fill="none"><circle cx="45" cy="15" r="9" fill="#c8f04a"/><line x1="45" y1="24" x2="45" y2="55" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="45" y1="35" x2="28" y2="43" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><rect x="19" y="41" width="10" height="5" rx="2" fill="#c8f04a" opacity=".8"/><line x1="45" y1="35" x2="62" y2="43" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><rect x="62" y="41" width="10" height="5" rx="2" fill="#c8f04a" opacity=".8"/><line x1="45" y1="55" x2="35" y2="58" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="35" y1="58" x2="28" y2="90" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="28" y1="90" x2="24" y2="112" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="45" y1="55" x2="55" y2="58" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="55" y1="58" x2="65" y2="74" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="65" y1="74" x2="74" y2="67" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><rect x="70" y="63" width="24" height="6" rx="2" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><text x="50" y="128" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">rear foot elevated</text></svg>`,
legpress:`<svg viewBox="0 0 100 130" fill="none"><rect x="8" y="75" width="38" height="10" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><rect x="8" y="40" width="10" height="38" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><circle cx="24" cy="37" r="8" fill="#c8f04a"/><line x1="24" y1="45" x2="33" y2="70" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="33" y1="70" x2="55" y2="50" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="33" y1="70" x2="60" y2="57" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><rect x="65" y="38" width="10" height="42" rx="3" fill="#242830" stroke="#c8f04a" stroke-width="1.5"/><text x="50" y="115" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">full depth, no lockout</text></svg>`,
legcurl:`<svg viewBox="0 0 100 130" fill="none"><rect x="10" y="48" width="80" height="10" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><circle cx="78" cy="40" r="8" fill="#c8f04a"/><line x1="78" y1="48" x2="38" y2="50" stroke="#c8f04a" stroke-width="4.5" stroke-linecap="round"/><line x1="38" y1="50" x2="24" y2="50" stroke="#8fe8c4" stroke-width="3.5" stroke-linecap="round"/><line x1="24" y1="50" x2="18" y2="34" stroke="#8fe8c4" stroke-width="3.5" stroke-linecap="round"/><circle cx="18" cy="43" r="7" fill="#242830" stroke="#c8f04a" stroke-width="1.5"/><text x="50" y="80" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">hips stay down</text></svg>`,
glutedrive:`<svg viewBox="0 0 100 130" fill="none"><rect x="4" y="38" width="18" height="26" rx="4" fill="#242830" stroke="#8fe8c4" stroke-width="1.5"/><circle cx="44" cy="24" r="8" fill="#c8f04a"/><line x1="18" y1="50" x2="44" y2="32" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="44" y1="32" x2="55" y2="56" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="55" y1="56" x2="44" y2="88" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="55" y1="56" x2="66" y2="88" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="44" y1="88" x2="33" y2="93" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="66" y1="88" x2="77" y2="93" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><path d="M48 50 Q55 44 62 50" stroke="#c8f04a" stroke-width="2" fill="none"/><text x="50" y="110" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">squeeze glutes at top</text></svg>`,
sled:`<svg viewBox="0 0 100 130" fill="none"><rect x="58" y="82" width="36" height="7" rx="2" fill="#242830" stroke="#8fe8c4" stroke-width="1.5"/><rect x="78" y="48" width="7" height="38" rx="2" fill="#242830" stroke="#8fe8c4" stroke-width="1.5"/><rect x="70" y="52" width="20" height="10" rx="2" fill="#1c1f23" stroke="#c8f04a" stroke-width="1"/><rect x="70" y="63" width="20" height="10" rx="2" fill="#1c1f23" stroke="#c8f04a" stroke-width="1"/><circle cx="26" cy="22" r="9" fill="#c8f04a"/><line x1="26" y1="31" x2="48" y2="57" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="38" y1="44" x2="75" y2="54" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="38" y1="50" x2="75" y2="60" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="48" y1="57" x2="37" y2="57" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="37" y1="57" x2="27" y2="85" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="48" y1="57" x2="52" y2="88" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><text x="40" y="108" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">low body, short steps</text></svg>`,
nordic:`<svg viewBox="0 0 100 130" fill="none"><rect x="50" y="82" width="44" height="7" rx="2" fill="#242830" stroke="#8fe8c4" stroke-width="1.5"/><line x1="62" y1="78" x2="50" y2="55" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="55" x2="34" y2="40" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><circle cx="27" cy="33" r="8" fill="#c8f04a"/><line x1="34" y1="44" x2="14" y2="58" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><path d="M62 78 Q56 66 50 55" stroke="#8fe8c4" stroke-width="2" stroke-dasharray="3,2" fill="none"/><text x="50" y="110" text-anchor="middle" fill="#c8f04a" font-size="8" font-family="Barlow Condensed">4s down, use hands</text></svg>`,
pullthrough:`<svg viewBox="0 0 100 130" fill="none"><rect x="4" y="82" width="10" height="36" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><circle cx="9" cy="95" r="5" fill="#1c1f23" stroke="#8fe8c4" stroke-width="1.5"/><line x1="14" y1="95" x2="40" y2="90" stroke="#8fe8c4" stroke-width="1.5" stroke-dasharray="4,2"/><circle cx="56" cy="34" r="9" fill="#c8f04a"/><line x1="56" y1="43" x2="56" y2="72" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="56" y1="55" x2="42" y2="66" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><path d="M48 66 Q56 60 64 66" stroke="#c8f04a" stroke-width="2" fill="none"/><line x1="56" y1="72" x2="44" y2="74" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="44" y1="74" x2="38" y2="100" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="56" y1="72" x2="68" y2="74" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="68" y1="74" x2="72" y2="100" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><text x="55" y="118" text-anchor="middle" fill="#c8f04a" font-size="8" font-family="Barlow Condensed">squeeze glutes at top</text></svg>`,
dbpress:`<svg viewBox="0 0 100 130" fill="none"><rect x="8" y="46" width="84" height="10" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><circle cx="50" cy="36" r="8" fill="#c8f04a"/><line x1="50" y1="44" x2="50" y2="78" stroke="#c8f04a" stroke-width="3" stroke-linecap="round"/><line x1="50" y1="52" x2="24" y2="44" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="24" y1="44" x2="18" y2="32" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><rect x="8" y="26" width="14" height="7" rx="2" fill="#1c1f23" stroke="#c8f04a" stroke-width="1.5"/><line x1="50" y1="52" x2="76" y2="44" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="76" y1="44" x2="82" y2="32" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><rect x="78" y="26" width="14" height="7" rx="2" fill="#1c1f23" stroke="#c8f04a" stroke-width="1.5"/><text x="50" y="110" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">retract scapula first</text></svg>`,
inclinepress:`<svg viewBox="0 0 100 130" fill="none"><rect x="10" y="55" width="80" height="8" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1" transform="rotate(-20,50,59)"/><rect x="60" y="68" width="7" height="38" rx="2" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><circle cx="28" cy="34" r="8" fill="#c8f04a"/><line x1="28" y1="42" x2="55" y2="53" stroke="#c8f04a" stroke-width="3" stroke-linecap="round"/><line x1="28" y1="46" x2="12" y2="38" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="38" x2="8" y2="26" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><rect x="2" y="20" width="12" height="7" rx="2" fill="#1c1f23" stroke="#c8f04a" stroke-width="1.5"/><line x1="40" y1="51" x2="56" y2="44" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="56" y1="44" x2="60" y2="32" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><rect x="55" y="26" width="12" height="7" rx="2" fill="#1c1f23" stroke="#c8f04a" stroke-width="1.5"/><text x="50" y="112" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">elbows at 45 degrees</text></svg>`,
cablefly:`<svg viewBox="0 0 100 130" fill="none"><rect x="2" y="20" width="8" height="50" rx="2" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><circle cx="6" cy="35" r="4" fill="#1c1f23" stroke="#8fe8c4" stroke-width="1.5"/><rect x="90" y="20" width="8" height="50" rx="2" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><circle cx="94" cy="35" r="4" fill="#1c1f23" stroke="#8fe8c4" stroke-width="1.5"/><line x1="10" y1="35" x2="36" y2="55" stroke="#8fe8c4" stroke-width="1.5" stroke-dasharray="3,2"/><line x1="90" y1="35" x2="64" y2="55" stroke="#8fe8c4" stroke-width="1.5" stroke-dasharray="3,2"/><circle cx="50" cy="40" r="9" fill="#c8f04a"/><line x1="50" y1="49" x2="50" y2="82" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="56" x2="36" y2="56" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="56" x2="64" y2="56" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="36" y1="56" x2="12" y2="38" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="64" y1="56" x2="88" y2="38" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><text x="50" y="110" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">wide arc, squeeze inside</text></svg>`,
machinepress:`<svg viewBox="0 0 100 130" fill="none"><rect x="5" y="30" width="12" height="70" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><rect x="83" y="30" width="12" height="70" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><line x1="17" y1="60" x2="40" y2="56" stroke="#8fe8c4" stroke-width="2"/><line x1="83" y1="60" x2="60" y2="56" stroke="#8fe8c4" stroke-width="2"/><circle cx="50" cy="38" r="9" fill="#c8f04a"/><line x1="50" y1="47" x2="50" y2="80" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="56" x2="40" y2="56" stroke="#c8f04a" stroke-width="2" stroke-linecap="round"/><line x1="40" y1="56" x2="17" y2="60" stroke="#c8f04a" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="56" x2="60" y2="56" stroke="#c8f04a" stroke-width="2" stroke-linecap="round"/><line x1="60" y1="56" x2="83" y2="60" stroke="#c8f04a" stroke-width="2" stroke-linecap="round"/><rect x="25" y="70" width="50" height="14" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><text x="50" y="112" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">fixed path, safe shoulder</text></svg>`,
cablerow:`<svg viewBox="0 0 100 130" fill="none"><rect x="4" y="25" width="10" height="76" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><circle cx="9" cy="60" r="5" fill="#1c1f23" stroke="#8fe8c4" stroke-width="1.5"/><line x1="14" y1="60" x2="44" y2="64" stroke="#8fe8c4" stroke-width="1.5" stroke-dasharray="4,2"/><circle cx="66" cy="42" r="9" fill="#c8f04a"/><line x1="66" y1="51" x2="62" y2="78" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="62" y1="62" x2="44" y2="65" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="62" y1="67" x2="44" y2="68" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><rect x="36" y="78" width="28" height="7" rx="2" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><text x="52" y="108" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">squeeze shoulder blades</text></svg>`,
pulldown:`<svg viewBox="0 0 100 130" fill="none"><rect x="14" y="10" width="72" height="5" rx="2" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><line x1="26" y1="15" x2="28" y2="32" stroke="#8fe8c4" stroke-width="1.5" stroke-dasharray="3,2"/><line x1="74" y1="15" x2="72" y2="32" stroke="#8fe8c4" stroke-width="1.5" stroke-dasharray="3,2"/><rect x="22" y="30" width="56" height="5" rx="2.5" fill="#8fe8c4" opacity=".7"/><circle cx="50" cy="48" r="9" fill="#c8f04a"/><line x1="50" y1="53" x2="28" y2="35" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="53" x2="72" y2="35" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="57" x2="48" y2="88" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><rect x="18" y="87" width="24" height="7" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><rect x="52" y="87" width="24" height="7" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><text x="50" y="112" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">elbows down and back</text></svg>`,
facepull:`<svg viewBox="0 0 100 130" fill="none"><rect x="4" y="12" width="10" height="40" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><circle cx="9" cy="26" r="5" fill="#1c1f23" stroke="#8fe8c4" stroke-width="1.5"/><line x1="14" y1="26" x2="35" y2="30" stroke="#8fe8c4" stroke-width="2"/><line x1="35" y1="30" x2="42" y2="24" stroke="#8fe8c4" stroke-width="1.5"/><line x1="35" y1="30" x2="42" y2="36" stroke="#8fe8c4" stroke-width="1.5"/><circle cx="74" cy="30" r="9" fill="#c8f04a"/><line x1="74" y1="36" x2="42" y2="24" stroke="#c8f04a" stroke-width="2" stroke-linecap="round"/><line x1="74" y1="36" x2="42" y2="36" stroke="#c8f04a" stroke-width="2" stroke-linecap="round"/><text x="44" y="16" text-anchor="middle" fill="#8fe8c4" font-size="7" font-family="Barlow Condensed">elbows wide</text><line x1="74" y1="39" x2="74" y2="74" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="74" y1="74" x2="62" y2="77" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="62" y1="77" x2="56" y2="108" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="74" y1="74" x2="84" y2="77" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="84" y1="77" x2="88" y2="108" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><text x="60" y="124" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">pull to forehead</text></svg>`,
csrow:`<svg viewBox="0 0 100 130" fill="none"><rect x="12" y="44" width="76" height="9" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1" transform="rotate(-18,50,49)"/><rect x="58" y="61" width="7" height="38" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><circle cx="24" cy="34" r="8" fill="#c8f04a"/><line x1="24" y1="42" x2="62" y2="54" stroke="#c8f04a" stroke-width="4" stroke-linecap="round"/><line x1="34" y1="46" x2="30" y2="60" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="48" y1="50" x2="44" y2="65" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><rect x="22" y="38" width="13" height="6" rx="2" fill="#1c1f23" stroke="#c8f04a" stroke-width="1.5"/><rect x="36" y="43" width="13" height="6" rx="2" fill="#1c1f23" stroke="#c8f04a" stroke-width="1.5"/><text x="50" y="110" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">chest stays on pad</text></svg>`,
pullup:`<svg viewBox="0 0 100 130" fill="none"><rect x="12" y="12" width="76" height="6" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1.5"/><rect x="40" y="78" width="20" height="9" rx="3" fill="#1c1f23" stroke="#c8f04a" stroke-width="1.5"/><circle cx="50" cy="34" r="9" fill="#c8f04a"/><line x1="50" y1="40" x2="28" y2="18" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="40" x2="72" y2="18" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="43" x2="50" y2="76" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="76" x2="42" y2="78" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="42" y1="78" x2="38" y2="108" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="76" x2="58" y2="78" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="58" y1="78" x2="62" y2="108" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><text x="50" y="124" text-anchor="middle" fill="#c8f04a" font-size="8" font-family="Barlow Condensed">dead hang, no kip</text></svg>`,
pendlay:`<svg viewBox="0 0 100 130" fill="none"><rect x="8" y="88" width="84" height="6" rx="2" fill="#8fe8c4" opacity=".7"/><rect x="6" y="75" width="10" height="22" rx="2" fill="#1c1f23" stroke="#8fe8c4" stroke-width="1"/><rect x="84" y="75" width="10" height="22" rx="2" fill="#1c1f23" stroke="#8fe8c4" stroke-width="1"/><circle cx="50" cy="22" r="9" fill="#c8f04a"/><line x1="50" y1="31" x2="50" y2="60" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="42" x2="30" y2="46" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="42" x2="70" y2="46" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><rect x="24" y="43" width="52" height="5" rx="2" fill="#c8f04a" opacity=".7"/><line x1="50" y1="60" x2="40" y2="64" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="40" y1="64" x2="33" y2="90" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="60" x2="60" y2="64" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="60" y1="64" x2="65" y2="90" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><text x="50" y="112" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">bar resets each rep</text></svg>`,
pushdown:`<svg viewBox="0 0 100 130" fill="none"><rect x="36" y="8" width="28" height="5" rx="2" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><line x1="50" y1="13" x2="50" y2="28" stroke="#8fe8c4" stroke-width="1.5" stroke-dasharray="3,2"/><rect x="40" y="26" width="20" height="5" rx="2" fill="#8fe8c4" opacity=".7"/><circle cx="50" cy="44" r="9" fill="#c8f04a"/><line x1="50" y1="53" x2="50" y2="84" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="60" x2="37" y2="50" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="37" y1="50" x2="37" y2="74" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="60" x2="63" y2="50" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="63" y1="50" x2="63" y2="74" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><circle cx="37" cy="50" r="3.5" fill="#c8f04a" opacity=".5" stroke="#c8f04a" stroke-width="1"/><circle cx="63" cy="50" r="3.5" fill="#c8f04a" opacity=".5" stroke="#c8f04a" stroke-width="1"/><text x="50" y="108" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">elbows fixed</text></svg>`,
curl:`<svg viewBox="0 0 100 130" fill="none"><circle cx="50" cy="18" r="9" fill="#c8f04a"/><line x1="50" y1="27" x2="50" y2="62" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="38" x2="32" y2="46" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="32" y1="46" x2="28" y2="30" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><rect x="18" y="24" width="13" height="7" rx="2" fill="#1c1f23" stroke="#c8f04a" stroke-width="1.5"/><line x1="50" y1="38" x2="68" y2="46" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="68" y1="46" x2="72" y2="30" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><rect x="69" y="24" width="13" height="7" rx="2" fill="#1c1f23" stroke="#c8f04a" stroke-width="1.5"/><circle cx="32" cy="46" r="3.5" fill="#c8f04a" opacity=".5" stroke="#c8f04a" stroke-width="1"/><circle cx="68" cy="46" r="3.5" fill="#c8f04a" opacity=".5" stroke="#c8f04a" stroke-width="1"/><line x1="50" y1="62" x2="40" y2="65" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="40" y1="65" x2="35" y2="94" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="62" x2="60" y2="65" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="60" y1="65" x2="64" y2="94" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><text x="50" y="112" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">elbows pinned</text></svg>`,
skierg:`<svg viewBox="0 0 100 130" fill="none"><rect x="44" y="6" width="12" height="82" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><rect x="38" y="6" width="24" height="15" rx="2" fill="#1c1f23" stroke="#c8f04a" stroke-width="1"/><line x1="44" y1="28" x2="24" y2="44" stroke="#8fe8c4" stroke-width="2"/><line x1="56" y1="28" x2="76" y2="44" stroke="#8fe8c4" stroke-width="2"/><circle cx="50" cy="44" r="9" fill="#c8f04a"/><line x1="50" y1="53" x2="48" y2="72" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="58" x2="26" y2="48" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="58" x2="74" y2="48" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="48" y1="72" x2="38" y2="75" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="38" y1="75" x2="33" y2="100" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="48" y1="72" x2="56" y2="75" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="56" y1="75" x2="60" y2="100" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><text x="50" y="118" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">arms + hip hinge</text></svg>`,
wallball:`<svg viewBox="0 0 100 130" fill="none"><rect x="88" y="4" width="12" height="122" fill="#1c1f23" stroke="#242830" stroke-width="1"/><rect x="88" y="24" width="12" height="7" fill="#8fe8c4" opacity=".5"/><circle cx="52" cy="42" r="7" fill="#c8f04a" opacity=".7"/><circle cx="34" cy="72" r="9" fill="#c8f04a"/><line x1="34" y1="81" x2="34" y2="100" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="34" y1="88" x2="22" y2="84" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="22" y1="84" x2="28" y2="66" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="34" y1="88" x2="52" y2="78" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="52" y1="78" x2="54" y2="48" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="34" y1="100" x2="22" y2="106" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="22" y1="106" x2="17" y2="124" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="34" y1="100" x2="48" y2="106" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="48" y1="106" x2="50" y2="124" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/></svg>`,
farmerscarry:`<svg viewBox="0 0 100 130" fill="none"><circle cx="50" cy="18" r="9" fill="#c8f04a"/><line x1="50" y1="27" x2="50" y2="62" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="38" x2="28" y2="40" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="28" y1="40" x2="26" y2="82" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="38" x2="72" y2="40" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="72" y1="40" x2="74" y2="82" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><rect x="14" y="80" width="18" height="9" rx="3" fill="#1c1f23" stroke="#c8f04a" stroke-width="1.5"/><rect x="68" y="80" width="18" height="9" rx="3" fill="#1c1f23" stroke="#c8f04a" stroke-width="1.5"/><line x1="50" y1="62" x2="40" y2="65" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="40" y1="65" x2="32" y2="95" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="62" x2="60" y2="65" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="60" y1="65" x2="66" y2="88" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><text x="50" y="118" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">chest up, brace core</text></svg>`,
rowing:`<svg viewBox="0 0 100 130" fill="none"><rect x="4" y="96" width="92" height="7" rx="2" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><rect x="4" y="76" width="16" height="24" rx="4" fill="#1c1f23" stroke="#8fe8c4" stroke-width="1.5"/><circle cx="12" cy="88" r="6" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><line x1="18" y1="88" x2="46" y2="66" stroke="#8fe8c4" stroke-width="1.5" stroke-dasharray="3,2"/><circle cx="66" cy="50" r="9" fill="#c8f04a"/><line x1="66" y1="59" x2="58" y2="84" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="62" y1="65" x2="46" y2="67" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="62" y1="70" x2="46" y2="70" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><rect x="36" y="64" width="12" height="8" rx="2" fill="#8fe8c4" opacity=".5"/><line x1="58" y1="84" x2="40" y2="88" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="40" y1="88" x2="25" y2="96" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><text x="50" y="118" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">legs then lean then arms</text></svg>`,
burpee:`<svg viewBox="0 0 100 130" fill="none"><line x1="4" y1="108" x2="96" y2="108" stroke="#7a7f8a" stroke-width="1" stroke-dasharray="5,4"/><circle cx="18" cy="86" r="7" fill="#c8f04a" opacity=".3"/><line x1="18" y1="93" x2="46" y2="100" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round" opacity=".3"/><circle cx="74" cy="28" r="8" fill="#c8f04a"/><line x1="74" y1="36" x2="74" y2="64" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="74" y1="44" x2="58" y2="29" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="74" y1="44" x2="90" y2="29" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="74" y1="64" x2="64" y2="68" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="64" y1="68" x2="58" y2="92" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="74" y1="64" x2="84" y2="68" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="84" y1="68" x2="88" y2="92" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><text x="55" y="124" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">chest to floor, jump fwd</text></svg>`,
kbswing:`<svg viewBox="0 0 100 130" fill="none"><circle cx="50" cy="24" r="9" fill="#c8f04a"/><line x1="50" y1="33" x2="50" y2="62" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="45" x2="30" y2="34" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="45" x2="36" y2="30" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><rect x="16" y="22" width="20" height="16" rx="4" fill="#1c1f23" stroke="#c8f04a" stroke-width="1.5"/><path d="M21 22 Q26 15 31 22" stroke="#8fe8c4" stroke-width="1.5" fill="none"/><line x1="50" y1="62" x2="40" y2="65" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="40" y1="65" x2="34" y2="95" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="62" x2="60" y2="65" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="60" y1="65" x2="64" y2="95" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><path d="M42 58 Q50 53 58 58" stroke="#c8f04a" stroke-width="2" fill="none"/><text x="50" y="112" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">hip drive not arms</text></svg>`,
bike:`<svg viewBox="0 0 100 130" fill="none"><circle cx="30" cy="86" r="22" fill="none" stroke="#8fe8c4" stroke-width="2"/><circle cx="30" cy="86" r="4" fill="#8fe8c4"/><circle cx="30" cy="86" r="14" fill="none" stroke="#c8f04a" stroke-width="1" stroke-dasharray="6,3" opacity=".5"/><line x1="30" y1="62" x2="44" y2="46" stroke="#8fe8c4" stroke-width="2"/><line x1="44" y1="46" x2="38" y2="36" stroke="#8fe8c4" stroke-width="2"/><line x1="44" y1="46" x2="52" y2="36" stroke="#8fe8c4" stroke-width="2"/><circle cx="68" cy="48" r="9" fill="#c8f04a"/><line x1="68" y1="57" x2="64" y2="64" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="64" y1="62" x2="52" y2="38" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="64" y1="64" x2="50" y2="84" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><text x="55" y="118" text-anchor="middle" fill="#c8f04a" font-size="8" font-family="Barlow Condensed">all-out effort</text></svg>`,
trapbar:`<svg viewBox="0 0 100 130" fill="none"><polygon points="50,70 34,76 26,90 34,104 66,104 74,90 66,76" fill="none" stroke="#8fe8c4" stroke-width="2" opacity=".8"/><line x1="8" y1="90" x2="26" y2="90" stroke="#8fe8c4" stroke-width="2.5"/><line x1="74" y1="90" x2="92" y2="90" stroke="#8fe8c4" stroke-width="2.5"/><rect x="4" y="82" width="7" height="18" rx="2" fill="#1c1f23" stroke="#c8f04a" stroke-width="1"/><rect x="89" y="82" width="7" height="18" rx="2" fill="#1c1f23" stroke="#c8f04a" stroke-width="1"/><circle cx="50" cy="34" r="9" fill="#c8f04a"/><line x1="50" y1="43" x2="46" y2="68" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="46" y1="58" x2="34" y2="78" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="46" y1="58" x2="64" y2="78" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="46" y1="68" x2="36" y2="70" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="36" y1="70" x2="30" y2="100" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="46" y1="68" x2="56" y2="70" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="56" y1="70" x2="60" y2="100" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><text x="50" y="120" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">push floor away</text></svg>`,
woodchop:`<svg viewBox="0 0 100 130" fill="none"><rect x="4" y="8" width="10" height="34" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1"/><circle cx="9" cy="18" r="4" fill="#1c1f23" stroke="#8fe8c4" stroke-width="1.5"/><line x1="13" y1="18" x2="44" y2="60" stroke="#8fe8c4" stroke-width="1.5" stroke-dasharray="4,2"/><circle cx="58" cy="44" r="9" fill="#c8f04a"/><line x1="58" y1="53" x2="58" y2="82" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="58" y1="60" x2="44" y2="62" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="44" y1="62" x2="34" y2="82" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><path d="M50 56 Q60 50 68 60" stroke="#c8f04a" stroke-width="1.5" fill="none"/><line x1="58" y1="82" x2="47" y2="85" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="47" y1="85" x2="42" y2="112" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="58" y1="82" x2="69" y2="85" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="69" y1="85" x2="72" y2="112" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><text x="50" y="126" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">hips square</text></svg>`,
abwheel:`<svg viewBox="0 0 100 130" fill="none"><circle cx="36" cy="96" r="11" fill="none" stroke="#c8f04a" stroke-width="2"/><line x1="20" y1="96" x2="52" y2="96" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><circle cx="74" cy="62" r="8" fill="#c8f04a"/><line x1="74" y1="70" x2="52" y2="80" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="60" y1="59" x2="44" y2="90" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="58" y1="65" x2="38" y2="90" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><ellipse cx="56" cy="99" rx="9" ry="4" fill="#8fe8c4" opacity=".2" stroke="#8fe8c4" stroke-width="1"/><text x="50" y="118" text-anchor="middle" fill="#c8f04a" font-size="8" font-family="Barlow Condensed">back flat, no sagging</text></svg>`,
hangingknee:`<svg viewBox="0 0 100 130" fill="none"><rect x="16" y="10" width="68" height="6" rx="3" fill="#242830" stroke="#8fe8c4" stroke-width="1.5"/><circle cx="50" cy="30" r="9" fill="#c8f04a"/><line x1="50" y1="36" x2="30" y2="16" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="36" x2="70" y2="16" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><line x1="50" y1="39" x2="50" y2="72" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="72" x2="38" y2="72" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="38" y1="72" x2="32" y2="56" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="72" x2="62" y2="72" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="62" y1="72" x2="68" y2="56" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="50" y1="72" x2="44" y2="104" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round" opacity=".25" stroke-dasharray="4,3"/><line x1="50" y1="72" x2="56" y2="104" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round" opacity=".25" stroke-dasharray="4,3"/><text x="50" y="120" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">no swinging</text></svg>`,
landmine:`<svg viewBox="0 0 100 130" fill="none"><circle cx="50" cy="108" r="7" fill="#242830" stroke="#8fe8c4" stroke-width="1.5"/><line x1="50" y1="101" x2="43" y2="36" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><rect x="31" y="27" width="20" height="11" rx="3" fill="#1c1f23" stroke="#c8f04a" stroke-width="1.5"/><circle cx="60" cy="44" r="9" fill="#c8f04a"/><line x1="60" y1="53" x2="58" y2="82" stroke="#c8f04a" stroke-width="2.5" stroke-linecap="round"/><line x1="60" y1="60" x2="43" y2="38" stroke="#8fe8c4" stroke-width="2" stroke-linecap="round"/><path d="M40 40 Q56 28 74 40" stroke="#c8f04a" stroke-width="1.5" fill="none" stroke-dasharray="4,3" opacity=".7"/><line x1="58" y1="82" x2="47" y2="84" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="47" y1="84" x2="40" y2="108" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="58" y1="82" x2="69" y2="84" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><line x1="69" y1="84" x2="74" y2="108" stroke="#8fe8c4" stroke-width="2.5" stroke-linecap="round"/><text x="50" y="126" text-anchor="middle" fill="#7a7f8a" font-size="8" font-family="Barlow Condensed">hips square, core rotates</text></svg>`,
};

/* ═══════════════════════════════════════════════════════
   STATE & HISTORY
═══════════════════════════════════════════════════════ */
let currentDay = 'Monday';
let sessionInputs = {};
let history = [];

async function loadHistory() {
  if (!sbClient) return;
  try {
    const { data, error } = await sbClient.from('sessions').select('*').order('created_at', { ascending: false }).limit(200);
    if (!error && data) history = data;
  } catch(e) {}
}

/* ═══════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════ */
function showPg(id, idx) {
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.nt').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('.bn').forEach(b => b.classList.remove('on'));
  document.getElementById('pg-' + id).classList.add('on');
  document.querySelectorAll('.nt')[idx]?.classList.add('on');
  document.querySelectorAll('.bn')[idx]?.classList.add('on');
  if (id === 'hist') renderHistory();
}

/* ═══════════════════════════════════════════════════════
   DAY PILLS
═══════════════════════════════════════════════════════ */
function renderDayPills() {
  const c = document.getElementById('dpills');
  c.innerHTML = '';
  DAYS.forEach(d => {
    const b = document.createElement('button');
    b.className = 'dp' + (d === currentDay ? ' on' : '');
    b.textContent = d;
    b.onclick = () => {
      currentDay = d;
      renderDay();
      document.querySelectorAll('.dp').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
    };
    c.appendChild(b);
  });
}

/* ═══════════════════════════════════════════════════════
   RENDER SESSION
═══════════════════════════════════════════════════════ */
function renderDay() {
  const w = document.getElementById('wsel').value;
  const band = getWeekBand(w);
  const dayData = PROGRAMME[currentDay];
  sessionInputs = {};

  document.getElementById('s-title').textContent = currentDay + ' — ' + dayData.focus;
  document.getElementById('s-sub').textContent = 'Week ' + w;

  const cont = document.getElementById('session-content');
  cont.innerHTML = '';

  let hasLoggable = false;

  if (dayData.exercises && dayData.exercises[band]) {
    const exs = dayData.exercises[band];
    if (exs.length > 0) hasLoggable = true;
    exs.forEach((ex, i) => cont.appendChild(makeExCard(ex, i, w)));
  }

  let extras = dayData.extras || [];
  if (currentDay === 'Sunday') extras = getSundayExtras(w);
  extras.forEach((ext, i) => {
    if (ext.logFields || ext.type === 'run' || ext.type === 'recovery') hasLoggable = true;
    cont.appendChild(makeInfoCard(ext, i));
  });

  document.getElementById('save-bar').style.display = hasLoggable ? 'flex' : 'none';
  document.getElementById('save-status').textContent = '';
}

/* ── GET PREVIOUS WEEK SUGGESTED WEIGHTS ── */
function getPrevWeights(exName, day, currentWeek) {
  // Find most recent logged session for this day
  const prev = history.find(h => h.day === day && h.week < currentWeek);
  if (!prev) return null;
  const prevEx = (prev.exercises || []).find(e => e.name === exName);
  if (!prevEx) return null;

  const sets = prevEx.sets || [];
  const weights = sets.map(s => parseFloat(s.weight)).filter(w => !isNaN(w) && w > 0);
  if (!weights.length) return null;

  const rpes = sets.map(s => s.rpe).filter(Boolean);
  const avgW = weights.reduce((a,b)=>a+b,0) / weights.length;
  const allEasy = rpes.length > 0 && rpes.every(r=>r==='easy');
  const anyHard = rpes.some(r=>r==='hard');
  const allOk = rpes.length > 0 && rpes.every(r=>r==='ok');

  let suggested;
  if (allEasy) suggested = Math.round((avgW + 5) / 2.5) * 2.5;
  else if (anyHard) suggested = Math.round(avgW / 2.5) * 2.5;
  else if (allOk) suggested = Math.round((avgW + 2.5) / 2.5) * 2.5;
  else suggested = Math.round(avgW / 2.5) * 2.5;

  // Return an array with the suggested weight for each set
  return Array(sets.length || 3).fill(suggested);
}

/* ── EXERCISE CARD ── */
function makeExCard(ex, i, w) {
  const card = document.createElement('div');
  card.className = 'ex-card';
  card.id = 'exc-' + i;

  const setsHtml = Array.from({length:ex.s},(_,s) => `
    <div class="set-row">
      <span class="set-lbl">Set ${s+1}</span>
      <input class="winput" type="number" min="0" step="2.5" placeholder="—" id="w-${i}-${s+1}" oninput="updateSug(${i})">
      <span class="kglabel">kg</span>
      <div class="rpe-wrap">
        <button class="rb" id="rb-${i}-${s+1}-easy" onclick="setRpe(${i},${s+1},'easy')">Easy</button>
        <button class="rb" id="rb-${i}-${s+1}-ok" onclick="setRpe(${i},${s+1},'ok')">OK</button>
        <button class="rb" id="rb-${i}-${s+1}-hard" onclick="setRpe(${i},${s+1},'hard')">Hard</button>
      </div>
    </div>`).join('');

  const prevW = getPrevWeights(ex.n, currentDay, parseInt(w));
  const prevHint = prevW ? '<span class="prev-hint">suggested from last session</span>' : '';

  card.innerHTML = `
    <div class="ex-hdr" onclick="toggleEx(${i})">
      <span class="ex-n">0${i+1}</span>
      <span class="ex-name">${ex.n}</span>
      <span class="ex-meta">${ex.s}\xd7${ex.r}</span>
      <span class="ex-chev">\u25be</span>
    </div>
    <div class="ex-body">
      <div class="diag-wrap">
        <div class="diag-svg">${DIAGRAMS[ex.d] || DIAGRAMS['squat']}</div>
        <div class="diag-info">
          <div class="mtags">${ex.m.map(m=>`<span class="mtag">${m}</span>`).join('')}</div>
          <div class="diag-cue"><b>Key cue</b>${ex.c}</div>
          ${VIDEOS[ex.n] ? `<a href="${VIDEOS[ex.n]}" target="_blank" rel="noopener" class="vid-link">\u25ba Watch on YouTube</a>` : ''}
        </div>
      </div>
      <div class="sets-area">
        <h4>${ex.s} sets \xd7 ${ex.r} ${prevHint}</h4>
        ${setsHtml}
        <textarea class="notes-inp" rows="2" placeholder="Notes for this exercise\u2026" id="enotes-${i}"></textarea>
        <div class="sug-box" id="sug-${i}"><b>Quick suggestion</b><span id="sug-txt-${i}"></span></div>
        <button class="ai-btn" id="ai-btn-${i}" onclick="getAi(${i},'${ex.n.replace(/'/g,"\\'")}',${ex.s},'${ex.r}')">
          <div class="spin" id="spin-${i}"></div>
          Get AI weight recommendation \u2197
        </button>
        <div class="ai-resp" id="ai-resp-${i}"><div class="al">AI recommendation</div><div id="ai-txt-${i}"></div></div>
      </div>
    </div>`;

  if (prevW) {
    for (let s = 1; s <= ex.s; s++) {
      const inp = card.querySelector('#w-' + i + '-' + s);
      if (inp && prevW[s-1] !== undefined) {
        inp.value = prevW[s-1];
        inp.style.borderColor = 'rgba(143,232,196,0.5)';
      }
    }
  }

  sessionInputs['ex-'+i] = { name: ex.n, sets: ex.s, reps: ex.r };
  return card;
}

/* ── INFO CARD ── */
function makeInfoCard(ext, i) {
  const card = document.createElement('div');
  card.className = 'info-card';

  let logHtml = '';
  if (ext.logFields) {
    logHtml = `<div style="margin-top:10px"><div class="log-label">Log your ${ext.type}</div>` +
      ext.logFields.map((f,j) => `<div class="log-field-row"><span class="log-field-label">${f}</span><input class="tinput" type="text" placeholder="—" id="ext-${i}-${j}"></div>`).join('') +
      `<div class="log-label" style="margin-top:12px">How did it feel?</div>
       <div class="feel-row">
         <button class="fb" id="fb-${i}-easy" onclick="setFeel(${i},'easy')">Easy</button>
         <button class="fb" id="fb-${i}-good" onclick="setFeel(${i},'good')">Good</button>
         <button class="fb" id="fb-${i}-tough" onclick="setFeel(${i},'tough')">Tough</button>
       </div></div>`;
  } else if (['run','recovery','sauna','mobility','rehab','rest'].includes(ext.type)) {
    logHtml = `<div style="margin-top:10px"><div class="log-label">How did it feel?</div>
      <div class="feel-row">
        <button class="fb" id="fb-${i}-easy" onclick="setFeel(${i},'easy')">Easy</button>
        <button class="fb" id="fb-${i}-good" onclick="setFeel(${i},'good')">Good</button>
        <button class="fb" id="fb-${i}-tough" onclick="setFeel(${i},'tough')">Tough</button>
      </div></div>`;
  }

  const extraDiag = getExtraDiagram(ext);
  card.innerHTML = `
    <div class="ic-head">
      <div class="ic-dot ${ext.dot}"></div>
      <div class="ic-title">${ext.label}</div>
      <span class="ic-dur">${ext.dur}</span>
    </div>
    <div class="ic-body-row">
      <div class="ic-diag">${extraDiag}</div>
      <div class="ic-text">
        <div class="ic-desc">${ext.desc}</div>
        ${ext.cue ? `<div class="ic-cue">${ext.cue}</div>` : ''}
      </div>
    </div>
    ${logHtml}`;

  sessionInputs['ext-'+i] = { label: ext.label, type: ext.type };
  return card;
}

function toggleEx(i) { document.getElementById('exc-'+i).classList.toggle('open'); }

function setRpe(ei, set, val) {
  ['easy','ok','hard'].forEach(v => document.getElementById(`rb-${ei}-${set}-${v}`)?.classList.remove('easy','ok','hard'));
  document.getElementById(`rb-${ei}-${set}-${val}`)?.classList.add(val);
  if (!sessionInputs['rpe-'+ei]) sessionInputs['rpe-'+ei] = {};
  sessionInputs['rpe-'+ei][set] = val;
  updateSug(ei);
}

function setFeel(i, val) {
  ['easy','good','tough'].forEach(v => document.getElementById(`fb-${i}-${v}`)?.classList.remove('easy','good','tough'));
  document.getElementById(`fb-${i}-${val}`)?.classList.add(val);
  sessionInputs['feel-'+i] = val;
}

function updateSug(ei) {
  const rpes = sessionInputs['rpe-'+ei] || {};
  const weights = [], effs = [];
  Object.keys(rpes).forEach(s => {
    const w = parseFloat(document.getElementById(`w-${ei}-${s}`)?.value);
    if (!isNaN(w) && w > 0) { weights.push(w); effs.push(rpes[s]); }
  });
  if (!weights.length) return;
  const avg = weights.reduce((a,b)=>a+b,0)/weights.length;
  let msg = '';
  if (effs.every(e=>e==='easy')) msg = `All sets felt easy — try ${Math.round((avg+5)/2.5)*2.5}kg next session`;
  else if (effs.some(e=>e==='hard')) msg = `Felt hard — stay at ${Math.round(avg/2.5)*2.5}kg and clean up the reps`;
  else if (effs.every(e=>e==='ok')) msg = `Good working weight — add 2.5kg next session`;
  else msg = `Mixed effort — stay at ${Math.round(avg/2.5)*2.5}kg next session`;
  document.getElementById('sug-txt-'+ei).textContent = msg;
  document.getElementById('sug-'+ei).classList.add('on');
}

async function getAi(ei, name, sets, reps) {
  const btn = document.getElementById('ai-btn-'+ei);
  const spin = document.getElementById('spin-'+ei);
  const resp = document.getElementById('ai-resp-'+ei);
  const txt = document.getElementById('ai-txt-'+ei);
  spin.style.display='block'; btn.disabled=true;
  const rpes = sessionInputs['rpe-'+ei]||{};
  const weights=[], effs=[];
  Object.keys(rpes).forEach(s=>{
    const w=parseFloat(document.getElementById(`w-${ei}-${s}`)?.value);
    if(!isNaN(w)&&w>0){weights.push(w);effs.push(rpes[s]);}
  });
  const notes=document.getElementById('enotes-'+ei)?.value||'';
  const wk=document.getElementById('wsel').value;
  const prompt=`You are a strength coach helping someone train for a Hyrox event. They have a torn rotator cuff (no overhead pressing). They just did ${name} (${sets} sets × ${reps} reps, Week ${wk}/8).\nSets logged: ${weights.map((w,i)=>`${w}kg (${effs[i]||'unrated'})`).join(', ')||'No weights logged yet'}.\nNotes: ${notes||'None'}.\nGive a 3-4 sentence recommendation: (1) weight for next session, (2) one technique tip for this specific exercise, (3) any warning signs to watch for. Be direct and specific.`;
  try {
    const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:prompt}]})});
    const data=await res.json();
    txt.textContent=data.content?.find(b=>b.type==='text')?.text||'No response.';
    resp.classList.add('on');
  } catch(e) { txt.textContent='Could not connect. Check your connection.'; resp.classList.add('on'); }
  spin.style.display='none'; btn.disabled=false;
}

/* ═══════════════════════════════════════════════════════
   SAVE SESSION
═══════════════════════════════════════════════════════ */
async function saveSession() {
  if (!sbClient) { document.getElementById('save-status').textContent = 'Not connected to database.'; return; }
  const w = document.getElementById('wsel').value;
  const band = getWeekBand(w);
  const dayData = PROGRAMME[currentDay];
  const exs = dayData.exercises?.[band] || [];
  const btn = document.getElementById('save-btn');
  const spin = document.getElementById('save-spin');
  spin.style.display='block'; btn.disabled=true;

  const exercises = exs.map((ex,i)=>{
    const sets=[];
    for(let s=1;s<=ex.s;s++){
      const wt=document.getElementById(`w-${i}-${s}`)?.value;
      const rpe=(sessionInputs['rpe-'+i]||{})[s];
      sets.push({set:s,weight:wt||null,rpe:rpe||null});
    }
    return {name:ex.n,reps:ex.r,sets,notes:document.getElementById('enotes-'+i)?.value||''};
  });

  let extras = dayData.extras||[];
  if(currentDay==='Sunday') extras=getSundayExtras(w);
  const extrasLog = extras.map((ext,i)=>({label:ext.label,type:ext.type,feel:sessionInputs['feel-'+i]||null}));

  const entry = {
    week: parseInt(w),
    day: currentDay,
    focus: dayData.focus,
    session_date: new Date().toISOString().split('T')[0],
    exercises: exercises,
    extras: extrasLog,
  };

  try {
    const { error } = await sbClient.from('sessions').insert([entry]);
    if (error) throw error;
    history.unshift({...entry, created_at: new Date().toISOString()});
    document.getElementById('save-status').textContent = 'Saved & synced ✓';
    setSyncStatus('ok','Synced');
    setTimeout(()=>document.getElementById('save-status').textContent='',3000);
  } catch(e) {
    document.getElementById('save-status').textContent = 'Save failed — check connection';
  }
  spin.style.display='none'; btn.disabled=false;
}

/* ═══════════════════════════════════════════════════════
   HISTORY
═══════════════════════════════════════════════════════ */
function renderHistory() {
  const grid = document.getElementById('hist-grid');
  grid.innerHTML = '';
  document.getElementById('hist-sub').textContent = history.length + ' session' + (history.length!==1?'s':'') + ' logged';
  if (!history.length) {
    grid.innerHTML = `<div class="empty"><h3>No sessions yet</h3><p>Log your first session to see your history here.</p></div>`;
    return;
  }
  history.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'h-card';
    const exRows = (entry.exercises||[]).map(ex=>{
      const tags=(ex.sets||[]).filter(s=>s.weight).map(s=>`<span class="hs ${s.rpe||'logged'}">${s.weight}kg${s.rpe?' · '+s.rpe:''}</span>`).join('');
      return tags?`<div class="h-row"><span class="h-exn">${ex.name}</span><div class="h-sets">${tags}</div></div>`:'';
    }).filter(Boolean).join('');
    const extRows=(entry.extras||[]).filter(e=>e.feel).map(e=>`<div class="h-row"><span class="h-exn">${e.label}</span><div class="h-sets"><span class="hs ${e.feel==='easy'?'easy':e.feel==='tough'?'hard':'ok'}">${e.feel}</span></div></div>`).join('');
    const d = entry.session_date || (entry.created_at ? entry.created_at.split('T')[0] : '');
    card.innerHTML=`<h3>Week ${entry.week} — ${entry.day}</h3><div class="h-date">${d} · ${entry.focus}</div>${exRows}${extRows}`;
    grid.appendChild(card);
  });
}
