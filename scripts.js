// scripts.js

// ─── STATE ───
let state = {
  users: { 'demo@hidan.io': { pass: 'demo123', name: 'Demo User', plan: 'Pro', token: 'HIDAN-PRO1-X9K2-7Q8M', since: 'Jun 2025', scans: 3 } },
  currentUser: null,
  scanResults: null,
  scanHistory: [],
  activeTab: 'overview'
};

// ─── PAGE ROUTING ───
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ─── AUTH ───
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('form-login').classList.toggle('hidden', tab !== 'login');
  document.getElementById('form-register').classList.toggle('hidden', tab !== 'register');
  clearAuthMessages();
}

function clearAuthMessages() {
  document.getElementById('auth-error').style.display = 'none';
  document.getElementById('auth-success').style.display = 'none';
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg; el.style.display = 'block';
}

function showAuthSuccess(msg) {
  const el = document.getElementById('auth-success');
  el.textContent = msg; el.style.display = 'block';
}

function doLogin() {
  clearAuthMessages();
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  if (!email || !pass) return showAuthError('Please fill in all fields.');
  const u = state.users[email];
  if (!u || u.pass !== pass) return showAuthError('Invalid email or password.');
  state.currentUser = { email, ...u };
  enterDashboard();
}

function doRegister() {
  clearAuthMessages();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value;
  if (!name || !email || !pass) return showAuthError('Please fill in all fields.');
  if (pass.length < 6) return showAuthError('Password must be at least 6 characters.');
  if (state.users[email]) return showAuthError('This email is already registered.');
  const token = 'HIDAN-' + Math.random().toString(36).substr(2,4).toUpperCase() + '-' + Math.random().toString(36).substr(2,4).toUpperCase() + '-' + Math.random().toString(36).substr(2,4).toUpperCase();
  state.users[email] = { pass, name, plan: 'None', token, since: new Date().toLocaleDateString('en-US',{month:'short',year:'numeric'}), scans: 0 };
  showAuthSuccess('Account created! You can now sign in.');
  setTimeout(() => switchTab('login'), 1200);
}

function doLogout() {
  state.currentUser = null;
  state.scanResults = null;
  showPage('page-landing');
}

function enterDashboard() {
  const u = state.currentUser;
  document.getElementById('topbar-username').textContent = u.email;
  document.getElementById('topbar-plan').textContent = u.plan.toUpperCase();
  document.getElementById('acct-name').textContent = u.name;
  document.getElementById('acct-email').textContent = u.email;
  document.getElementById('acct-since').textContent = u.since;
  document.getElementById('acct-token').textContent = u.token;
  document.getElementById('acct-plan').textContent = u.plan + ' · Monthly';
  document.getElementById('acct-scans').textContent = u.scans + ' / Unlimited';
  document.getElementById('user-token').textContent = u.token;
  document.getElementById('agent-cmd').textContent = 'python hidan_agent_v1.8.py --token ' + u.token;
  const renews = new Date(); renews.setMonth(renews.getMonth() + 1);
  document.getElementById('acct-renews').textContent = renews.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
  showPage('page-dashboard');
  showDashTab('overview');
}

// ─── PRICING ───
function selectPlan(plan) {
  showToast('Opening checkout for ' + plan + ' plan...');
  setTimeout(() => showPage('page-auth'), 900);
}

// ─── DASHBOARD TABS ───
function showDashTab(tab) {
  document.querySelectorAll('#dash-content > div').forEach(d => d.classList.add('hidden'));
  document.getElementById('tab-' + tab).classList.remove('hidden');
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  const items = document.querySelectorAll('.sidebar-item');
  const labels = ['overview','scan','history','files','prefetch','events','deleted','download','account'];
  const idx = labels.indexOf(tab);
  if (idx >= 0) items[idx < 3 ? idx : idx + 1].classList.add('active');
  state.activeTab = tab;
}

// ─── SCAN SIMULATION ───
const SCAN_LINES = [
  '[INIT]    Loading Hidan Scanner v1.8...',
  '[SYSTEM]  OS: Windows 11 · Machine: DESKTOP-7K92M',
  '[SYSTEM]  Drives: C:\\ D:\\',
  '[TEMP]    Scanning User Temp directory...',
  '[TEMP]    Scanning System Temp directory...',
  '[DL]      Scanning Downloads folder...',
  '[DL]      Scanning Desktop...',
  '[PREFETCH] Reading C:\\Windows\\Prefetch...',
  '[EVENTS]  Querying Application Event Log...',
  '[EVENTS]  Filtering for Event IDs 1000 and 1001...',
  '[DELETED] Checking Recycle Bin...',
  '[DELETED] Scanning temp trace files...',
  '[SCAN]    Starting full drive scan on C:\\...',
  '[SCAN]    Scanning drive C:\\ — depth 8 max...',
  '[SCAN]    Drive C:\\ complete — 1,284 files processed',
  '[RESULT]  Building scan report...',
  '[DONE]    Scan complete. Uploading results...',
  '[SERVER]  Results received and stored securely.',
];

const MOCK_RESULTS = {
  files: [
    { name: 'loader.exe', path: 'C:\\Users\\User\\AppData\\Local\\Temp\\loader.exe', mtime: '2025-06-18 14:32:11', size: '412.3 KB', flags: ['Executable in temp directory', 'Suspicious filename: loader', 'Modified within last 14 days'], status: 'flagged' },
    { name: 'update.bat', path: 'C:\\Users\\User\\Downloads\\update.bat', mtime: '2025-06-20 09:11:05', size: '3.1 KB', flags: ['Script in downloads folder', 'Modified within last 14 days'], status: 'flagged' },
    { name: 'document.pdf.exe', path: 'C:\\Users\\User\\Desktop\\document.pdf.exe', mtime: '2025-06-15 21:44:01', size: '88.7 KB', flags: ['Double file extension (disguise pattern)', 'Executable in user directory'], status: 'flagged' },
    { name: 'chrome_updater.exe', path: 'C:\\Program Files\\Chrome\\chrome_updater.exe', mtime: '2025-05-10 08:02:33', size: '1,204.0 KB', flags: [], status: 'clean' },
  ],
  prefetch: [
    { name: 'LOADER-8A3F21CD.pf', path: 'C:\\Windows\\Prefetch\\LOADER-8A3F21CD.pf', mtime: '2025-06-19 18:02:44', size: '52.4 KB', flags: ["Contains keyword 'loader'", 'Modified within last 14 days'], status: 'flagged' },
    { name: 'INJECT-C22F91AB.pf', path: 'C:\\Windows\\Prefetch\\INJECT-C22F91AB.pf', mtime: '2025-06-17 22:55:10', size: '38.1 KB', flags: ["Contains keyword 'inject'", 'Modified within last 14 days'], status: 'flagged' },
    { name: 'CHROME-4D912345.pf', path: 'C:\\Windows\\Prefetch\\CHROME-4D912345.pf', mtime: '2025-06-22 10:30:00', size: '44.8 KB', flags: [], status: 'clean' },
  ],
  events: [
    { name: 'loader.exe', id: '1000', time: '2025-06-18 14:33:02', path: 'C:\\Users\\User\\AppData\\Local\\Temp\\loader.exe', module: 'ntdll.dll', exception: '0xc0000005', flags: ["Suspicious keyword: 'loader'"], status: 'flagged' },
    { name: 'chrome.exe', id: '1000', time: '2025-06-20 09:01:55', path: 'C:\\Program Files\\Google\\Chrome\\chrome.exe', module: 'chrome.dll', exception: '0xc0000374', flags: [], status: 'warn' },
    { name: 'explorer.exe', id: '1001', time: '2025-06-21 07:22:11', path: 'C:\\Windows\\explorer.exe', module: 'explorerframe.dll', exception: 'N/A', flags: [], status: 'clean' },
  ],
  deleted: [
    { name: '$RXK22P1.exe', path: 'C:\\$Recycle.Bin\\S-1-5-21...\\$RXK22P1.exe', mtime: '2025-06-16 23:10:44', size: '204.0 KB', flags: ['Recently deleted executable', 'Modified within last 14 days'], status: 'flagged' },
    { name: 'tmp_8f3a.tmp', path: 'C:\\Windows\\Temp\\tmp_8f3a.tmp', mtime: '2025-06-21 15:00:22', size: '1.2 KB', flags: [], status: 'clean' },
  ]
};

function startScan() {
  const btn = document.getElementById('btn-scan');
  btn.disabled = true;
  btn.textContent = '⏳ SCANNING...';
  const prog = document.getElementById('scan-progress');
  prog.classList.add('active');
  const log = document.getElementById('scan-log');
  log.innerHTML = '';
  const fill = document.getElementById('progress-fill');
  fill.style.width = '0%';
  let i = 0;
  const interval = setInterval(() => {
    if (i < SCAN_LINES.length) {
      const line = document.createElement('div');
      line.className = 'scan-log-line';
      line.textContent = SCAN_LINES[i];
      log.appendChild(line);
      fill.style.width = Math.round((i+1)/SCAN_LINES.length * 100) + '%';
      i++;
    } else {
      clearInterval(interval);
      btn.disabled = false;
      btn.textContent = '▶ START FULL SCAN';
      finalizeScan();
    }
  }, 280);
}

function finalizeScan() {
  state.scanResults = MOCK_RESULTS;
  const now = new Date();
  const ts = now.toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const totalFlags = [
    MOCK_RESULTS.files.filter(r=>r.status==='flagged').length,
    MOCK_RESULTS.prefetch.filter(r=>r.status==='flagged').length,
    MOCK_RESULTS.events.filter(r=>r.status==='flagged').length,
    MOCK_RESULTS.deleted.filter(r=>r.status==='flagged').length
  ];
  const total = totalFlags.reduce((a,b)=>a+b,0);

  // Update metrics
  document.getElementById('last-scan-time').textContent = 'Last scan: ' + ts + ' · Machine: DESKTOP-7K92M';
  document.getElementById('m-total').textContent = total;
  document.getElementById('m-files').textContent = totalFlags[0];
  document.getElementById('m-prefetch').textContent = totalFlags[1];
  document.getElementById('m-events').textContent = totalFlags[2];
  document.getElementById('m-deleted').textContent = totalFlags[3];

  const labels = ['files','prefetch','events','deleted'];
  labels.forEach((l,idx) => {
    document.getElementById('badge-'+l).textContent = totalFlags[idx];
  });

  // Update metric card style
  const mc = document.getElementById('metric-total');
  mc.classList.toggle('danger', total > 0);
  mc.classList.toggle('ok', total === 0);

  // Add to history
  state.scanHistory.unshift({ ts, flags: total, machine: 'DESKTOP-7K92M' });
  renderHistory();

  // Render category results
  renderCategory('files', MOCK_RESULTS.files, renderFileItem);
  renderCategory('prefetch', MOCK_RESULTS.prefetch, renderPrefetchItem);
  renderCategory('events', MOCK_RESULTS.events, renderEventItem);
  renderCategory('deleted', MOCK_RESULTS.deleted, renderDeletedItem);

  showToast('Scan complete — ' + total + ' flags found');
  if (state.currentUser) state.currentUser.scans++;
  document.getElementById('acct-scans').textContent = (state.currentUser?.scans || 0) + ' / Unlimited';
}

function renderCategory(id, items, renderFn) {
  const el = document.getElementById('results-' + id);
  if (!items.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">✓</div>No items found</div>';
    return;
  }
  el.innerHTML = items.map(renderFn).join('');
}

function renderFileItem(r) {
  const flags = r.flags.map(f => '<div class="flag-reason">'+f+'</div>').join('');
  return `<div class="result-item ${r.status}">
    <div class="result-top">
      <span class="result-name">${r.name}</span>
      <span class="tag ${r.status==='flagged'?'tag-red':r.status==='warn'?'tag-yellow':'tag-green'}">${r.status.toUpperCase()}</span>
    </div>
    <div class="result-path">${r.path}</div>
    <div class="result-meta">Modified: ${r.mtime} &nbsp;·&nbsp; Size: ${r.size}</div>
    ${flags}
  </div>`;
}

function renderPrefetchItem(r) {
  const flags = r.flags.map(f => '<div class="flag-reason">'+f+'</div>').join('');
  return `<div class="result-item ${r.status}">
    <div class="result-top">
      <span class="result-name">${r.name}</span>
      <span class="tag ${r.status==='flagged'?'tag-red':'tag-green'}">${r.status.toUpperCase()}</span>
    </div>
    <div class="result-path">${r.path}</div>
    <div class="result-meta">Modified: ${r.mtime} &nbsp;·&nbsp; Size: ${r.size}</div>
    ${flags}
  </div>`;
}

function renderEventItem(r) {
  const flags = r.flags.map(f => '<div class="flag-reason">'+f+'</div>').join('');
  return `<div class="result-item ${r.status}">
    <div class="result-top">
      <span class="result-name">${r.name}</span>
      <span class="tag tag-gray">ID ${r.id}</span>
      <span class="tag ${r.status==='flagged'?'tag-red':r.status==='warn'?'tag-yellow':'tag-green'}">${r.status.toUpperCase()}</span>
    </div>
    <div class="result-path">${r.path}</div>
    <div class="result-meta">Time: ${r.time} &nbsp;·&nbsp; Module: ${r.module} &nbsp;·&nbsp; Exception: ${r.exception}</div>
    ${flags}
  </div>`;
}

function renderDeletedItem(r) {
  const flags = r.flags.map(f => '<div class="flag-reason">'+f+'</div>').join('');
  return `<div class="result-item ${r.status}">
    <div class="result-top">
      <span class="result-name">${r.name}</span>
      <span class="tag ${r.status==='flagged'?'tag-red':'tag-green'}">${r.status.toUpperCase()}</span>
    </div>
    <div class="result-path">${r.path}</div>
    <div class="result-meta">Modified: ${r.mtime} &nbsp;·&nbsp; Size: ${r.size}</div>
    ${flags}
  </div>`;
}

function renderHistory() {
  const el = document.getElementById('history-body');
  if (!state.scanHistory.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">📂</div>No scan history yet.</div>';
    return;
  }
  el.innerHTML = state.scanHistory.map((h,i) => `
    <div class="history-row">
      <span class="history-date">${h.ts}</span>
      <span style="color:var(--text2)">${h.machine}</span>
      <span class="tag ${h.flags>0?'tag-red':'tag-green'}">${h.flags} flag${h.flags!==1?'s':''}</span>
      <span class="tag tag-green">COMPLETE</span>
      <span class="history-link" onclick="showDashTab('overview')">View →</span>
    </div>`).join('');
}

// ─── TOAST ───
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// Demo: pre-fill login for easy testing
document.getElementById('login-email').value = 'demo@hidan.io';
document.getElementById('login-pass').value = 'demo123';
