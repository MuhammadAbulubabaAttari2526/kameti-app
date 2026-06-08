// ═══════════════════════════════════════
// FIREBASE IMPORTS + AUTH GUARD
// ═══════════════════════════════════════
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Firebase Config ───────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyC502LUYaUErGskXF3kQtNBBa-a5gEOsKE",
  authDomain: "committee-app-11cf8.firebaseapp.com",
  projectId: "committee-app-11cf8",
  storageBucket: "committee-app-11cf8.firebasestorage.app",
  messagingSenderId: "534059750392",
  appId: "1:534059750392:web:4071f528b3033905b73c0d"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth        = getAuth(firebaseApp);
const db          = getFirestore(firebaseApp);

// ── Current user ──────────────────────────────────────────────────────────────
let currentUser = null;

// ── Auth Guard ────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// SPLASH SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function setSplashStatus(msg, pct) {
  const statusEl = document.getElementById('splashStatus');
  const fillEl   = document.getElementById('splashBarFill');
  if (statusEl) statusEl.textContent = msg;
  if (fillEl)   fillEl.style.width   = pct + '%';
}

function hideSplash() {
  const splash = document.getElementById('splashScreen');
  const app    = document.getElementById('app');
  if (!splash) return;
  setSplashStatus('Ready!', 100);
  setTimeout(() => {
    splash.classList.add('splash-hide');
    if (app) app.style.opacity = '1';
    setTimeout(() => splash.remove(), 600);
  }, 400);
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH GUARD
// ─────────────────────────────────────────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = './auth.html';
    return;
  }
  currentUser = user;
  console.log(`✅ Logged in as: ${user.email}`);

  setSplashStatus('User verified ✓', 30);
  await new Promise(r => setTimeout(r, 200));

  setSplashStatus('Loading your data...', 55);
  await loadStateFromFirestore();

  setSplashStatus('Setting up committees...', 80);
  await new Promise(r => setTimeout(r, 150));

  populateKametiDropdowns();
  renderDashboard();
  renderMembers();
  renderPayments();
  updateTopbarUser();
  if (typeof window.applyLang === 'function') window.applyLang();

  hideSplash();
});

// ─────────────────────────────────────────────────────────────────────────────
// TOPBAR USER INFO + LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
function updateTopbarUser() {
  if (!currentUser) return;

  const name  = currentUser.displayName || currentUser.email.split('@')[0];
  const email = currentUser.email;
  const av    = name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  // Avatar initials
  const avatarEl = document.getElementById('topbarAvatar');
  const udAvatarEl = document.getElementById('udAvatar');
  if (avatarEl)   avatarEl.textContent  = av;
  if (udAvatarEl) udAvatarEl.textContent = av;

  // Name in button
  const nameEl = document.getElementById('topbarUserName');
  if (nameEl) nameEl.textContent = name.split(' ')[0]; // First name only

  // Dropdown detail
  const udNameEl  = document.getElementById('udName');
  const udEmailEl = document.getElementById('udEmail');
  if (udNameEl)  udNameEl.textContent  = name;
  if (udEmailEl) udEmailEl.textContent = email;
}

// Toggle dropdown
function toggleUserMenu() {
  const dd = document.getElementById('userDropdown');
  if (dd) dd.classList.toggle('open');
}
function closeUserMenu() {
  const dd = document.getElementById('userDropdown');
  if (dd) dd.classList.remove('open');
}
// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const wrap = document.getElementById('userMenuWrap');
  if (wrap && !wrap.contains(e.target)) closeUserMenu();
});
window.toggleUserMenu = toggleUserMenu;
window.closeUserMenu  = closeUserMenu;

// Logout with confirm modal
function handleLogout() {
  closeUserMenu();
  openModal('logoutModal');
}
async function confirmLogout() {
  try {
    await signOut(auth);
    showToast('Logout ho gaye. Allah Hafiz! 👋', 'warn');
    setTimeout(() => { window.location.href = './auth.html'; }, 800);
  } catch (err) {
    showToast(t('toast_logout_error'), 'danger');
  }
}
window.handleLogout  = handleLogout;
window.confirmLogout = confirmLogout;

// ─────────────────────────────────────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────────────────────────────────────
const COLORS = [
  'linear-gradient(135deg,#10b981,#065f46)',
  'linear-gradient(135deg,#3b82f6,#1e3a8a)',
  'linear-gradient(135deg,#f59e0b,#92400e)',
  'linear-gradient(135deg,#ef4444,#991b1b)',
  'linear-gradient(135deg,#8b5cf6,#4c1d95)',
  'linear-gradient(135deg,#06b6d4,#164e63)',
  'linear-gradient(135deg,#ec4899,#831843)',
  'linear-gradient(135deg,#84cc16,#365314)',
];

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL STATE
// ─────────────────────────────────────────────────────────────────────────────
let state = {
  committees: [],
  members: [],
  payments: [],
  nextId: { committee: 1, member: 1, payment: 1 },
  filters: { member: 'all', payment: 'all' },
};

// ─────────────────────────────────────────────────────────────────────────────
// FIRESTORE — users/{uid}/appData/main
// ─────────────────────────────────────────────────────────────────────────────
function userDocRef() {
  return doc(db, 'users', currentUser.uid, 'appData', 'main');
}

async function saveStateToFirestore() {
  try {
    await setDoc(userDocRef(), {
      committees: state.committees,
      members:    state.members,
      payments:   state.payments,
      nextId:     state.nextId,
    });
  } catch (e) {
    console.error('Firestore save error:', e);
    showToast(t('toast_save_error'), 'warn');
  }
}

async function loadStateFromFirestore() {
  try {
    const snap = await getDoc(userDocRef());
    if (snap.exists()) {
      const data = snap.data();
      state = {
        ...state,
        committees: data.committees || [],
        members:    data.members    || [],
        payments:   data.payments   || [],
        nextId:     data.nextId     || { committee: 1, member: 1, payment: 1 },
      };
    }
  } catch (e) {
    console.error('Firestore load error:', e);
    showToast(t('toast_load_error'), 'warn');
  }
}

// backward-compat alias
function saveState() { saveStateToFirestore(); }

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function getMember(id)     { return state.members.find(m => m.id === id); }
function getCommittee(id)  { return state.committees.find(c => c.id === id); }
function formatRs(n)       { return 'Rs ' + Number(n).toLocaleString('en-PK'); }
function initials(name)    { return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); }
function colorForMember(m) { return m.color || COLORS[m.id % COLORS.length]; }
function today()           { return new Date().toISOString().split('T')[0]; }

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.getElementById('nav-' + page).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'dashboard') renderDashboard();
  if (page === 'members')   renderMembers();
  if (page === 'payments')  renderPayments();
}
window.navigate = navigate;

// ─────────────────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────────────────
let isDark = localStorage.getItem('kametiTheme') !== 'light';
// Apply saved theme immediately
document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

function toggleTheme() {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  localStorage.setItem('kametiTheme', isDark ? 'dark' : 'light');
  const icon = document.getElementById('themeIcon');
  if (icon) icon.className = isDark ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
  showToast(isDark ? t('dark_mode') : t('light_mode'), '');
}
window.toggleTheme = toggleTheme;

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function renderDashboard() {
  const totalCollected = state.payments.filter(p => p.type === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending   = state.payments.filter(p => p.type === 'pending' || p.type === 'late').reduce((s, p) => s + p.amount, 0);

  let html = `
  <div style="background:var(--accent-light);border:1px solid rgba(16,185,129,.25);border-radius:12px;padding:11px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px;font-size:13px;">
    <div class="pulse-dot"></div>
    <div>${t('active_committees')}: <strong>${state.committees.length}</strong> — ${state.members.length} ${t('total_members_lbl').toLowerCase()}</div>
  </div>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-label"><i class="bi bi-people me-1"></i>${t('total_members_lbl')}</div><div class="stat-val c-text">${state.members.length}</div></div>
    <div class="stat-card"><div class="stat-label"><i class="bi bi-collection me-1"></i>${t('collected_lbl')}</div><div class="stat-val c-green">${formatRs(totalCollected)}</div></div>
    <div class="stat-card"><div class="stat-label"><i class="bi bi-hourglass me-1"></i>${t('pending_lbl')}</div><div class="stat-val c-warn">${formatRs(totalPending)}</div></div>
    <div class="stat-card"><div class="stat-label"><i class="bi bi-journal-check me-1"></i>${t('payments_lbl')}</div><div class="stat-val c-text">${state.payments.filter(p => p.type === 'paid').length}/${state.payments.length}</div></div>
  </div>`;

  state.committees.forEach(c => {
    const members  = state.members.filter(m => m.committeeId === c.id);
    const paid     = members.filter(m => m.status === 'paid').length;
    const pct      = members.length ? Math.round((paid / members.length) * 100) : 0;
    const collected = state.payments.filter(p => p.committeeId === c.id && p.type === 'paid').reduce((s, p) => s + p.amount, 0);
    const fillClass = pct < 50 ? 'warn-fill' : '';
    const badgeMonths = `${t('month_prefix')} ${c.currentMonth}/${c.totalMembers}`;

    html += `<div class="committee-card">
      <div class="comm-head">
        <div>
          <div class="comm-title" style="cursor:pointer" onclick="openKametiDetail(${c.id})">${c.name}</div>
          <div class="comm-meta">${t('monthly')} · ${formatRs(c.monthlyAmount)}/member · ${c.totalMembers} members</div>
        </div>
        <span class="badge badge-month">${badgeMonths}</span>
      </div>
      <div class="prog-wrap">
        <div class="prog-bg"><div class="prog-fill ${fillClass}" style="width:${pct}%"></div></div>
        <div class="prog-meta"><span>${formatRs(collected)} ${t('collected_suffix')}</span><span>${pct}${t('paid_suffix')}</span></div>
      </div>
      <div class="app-divider"></div>
      <div class="sec-label">${t('payment_log')}</div>`;

    members.forEach(m => {
      const statusIcon  = m.status === 'paid' ? 'bi-check-circle-fill' : m.status === 'late' ? 'bi-x-circle-fill' : 'bi-hourglass-split';
      const statusClass = m.status === 'paid' ? 's-paid' : m.status === 'late' ? 's-late' : 's-pending';
      const statusText  = m.status === 'paid' ? `${t('paid_status')} · ${formatRs(c.monthlyAmount)}` : m.status === 'late' ? t('late_status') : t('pending_status');
      html += `<div class="member-row">
        <div class="mem-left">
          <div class="mem-avatar" style="background:${colorForMember(m)}">${initials(m.name)}</div>
          <div><div class="mem-name">${m.name}</div><div class="mem-sub">${t('member_hash')}${m.turn}</div></div>
        </div>
        <span class="mem-status ${statusClass}" onclick="openMemberDetail(${m.id})"><i class="bi ${statusIcon} me-1"></i>${statusText}</span>
      </div>`;
    });

    html += `<div class="action-row">
      <button class="btn-ghost" onclick="navigate('payments')"><i class="bi bi-journal-text me-1"></i>${t('payment_log')}</button>
      <button class="btn-ghost" onclick="openKametiDetail(${c.id})"><i class="bi bi-info-circle me-1"></i>${t('details')}</button>
    </div></div>`;
  });

  if (state.committees.length === 0) {
    html += `<div class="empty-state"><i class="bi bi-people"></i><p>${t('no_committee')}</p></div>`;
  }

  document.getElementById('dashboardContent').innerHTML = html;
  setTimeout(() => {
    document.querySelectorAll('.prog-fill').forEach(bar => {
      const w = bar.style.width; bar.style.width = '0%';
      setTimeout(() => { bar.style.width = w; }, 50);
    });
  }, 50);
}
window.renderDashboard = renderDashboard;

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERS
// ─────────────────────────────────────────────────────────────────────────────
function renderMembers() {
  const q = (document.getElementById('memberSearch')?.value || '').toLowerCase();
  const f = state.filters.member;
  const filtered = state.members.filter(m => {
    const c = getCommittee(m.committeeId);
    const matchQ = m.name.toLowerCase().includes(q) || (c?.name.toLowerCase().includes(q));
    const matchF = f === 'all' || m.status === f;
    return matchQ && matchF;
  });

  if (filtered.length === 0) {
    document.getElementById('memberList').innerHTML = `<div class="empty-state"><i class="bi bi-person-x"></i><p>${t('no_member_found')}</p></div>`;
    return;
  }

  document.getElementById('memberList').innerHTML = filtered.map(m => {
    const c = getCommittee(m.committeeId);
    const badgeClass = m.status === 'paid' ? 'badge-active' : m.status === 'late' ? '' : 'badge-month';
    const badgeStyle = m.status === 'late' ? 'background:rgba(239,68,68,.1);color:#ef4444;border:1px solid rgba(239,68,68,.2)' : '';
    const statusLabel = m.status === 'paid' ? t('paid_status') : m.status === 'late' ? t('late_status') : t('pending_status');
    return `<div class="member-card" onclick="openMemberDetail(${m.id})">
      <div class="mc-avatar" style="background:${colorForMember(m)}">${initials(m.name)}</div>
      <div class="mc-info">
        <div class="mc-name">${m.name}</div>
        <div class="mc-sub">${t('member_hash')}${m.turn} · ${c?.name || '—'}</div>
      </div>
      <span class="mc-badge ${badgeClass}" style="${badgeStyle}">${statusLabel}</span>
    </div>`;
  }).join('');
}
window.renderMembers = renderMembers;

function setMemberFilter(f, el) {
  state.filters.member = f;
  document.querySelectorAll('#memberChips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderMembers();
}
window.setMemberFilter = setMemberFilter;

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────────────────────────────────────
function renderPayments() {
  const f = state.filters.payment;
  const filtered = state.payments.filter(p => f === 'all' || p.type === f);

  // ── Reminder banners: pending/late members ──────────────────────────────────
  const pendingMembers = state.members.filter(m => m.status === 'pending' || m.status === 'late');
  const lateMembers    = state.members.filter(m => m.status === 'late');

  let reminderHtml = '';

  if (lateMembers.length > 0) {
    const names = lateMembers.slice(0, 2).map(m => m.name).join(', ');
    const extra = lateMembers.length > 2 ? ` +${lateMembers.length - 2} ${t('more_lbl')}` : '';
    const withPhone = lateMembers.filter(m => m.phone && m.phone !== '—').length;
    reminderHtml += `
    <div class="reminder-banner">
      <div class="reminder-icon">⚠️</div>
      <div class="reminder-body">
        <div class="reminder-title">${t('late_payment_banner')}</div>
        <div class="reminder-sub">${names}${extra} ${t('late_payment_sub')}</div>
        ${withPhone > 0 ? `<button class="btn-wa-bulk" onclick="sendWaBulk(null)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          ${t('remind_all_btn')} (${withPhone})
        </button>` : ''}
      </div>
      <div class="reminder-count">${lateMembers.length}</div>
    </div>`;
  }

  if (pendingMembers.length > 0) {
    const names = pendingMembers.slice(0, 2).map(m => m.name).join(', ');
    const extra = pendingMembers.length > 2 ? ` +${pendingMembers.length - 2} ${t('more_lbl')}` : '';
    const withPhone = pendingMembers.filter(m => m.phone && m.phone !== '—').length;
    reminderHtml += `
    <div class="reminder-banner" style="border-color:rgba(100,116,139,.3);background:rgba(100,116,139,.07);">
      <div class="reminder-icon">🔔</div>
      <div class="reminder-body">
        <div class="reminder-title" style="color:var(--text2)">${t('pending_payment_banner')} — ${pendingMembers.length} Members</div>
        <div class="reminder-sub">${names}${extra} ${t('pending_payment_sub')}</div>
        ${withPhone > 0 ? `<button class="btn-wa-bulk" style="background:rgba(37,211,102,.12);color:#25d366;border-color:rgba(37,211,102,.3);" onclick="sendWaBulk(null)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          ${t('remind_all_btn')} (${withPhone})
        </button>` : ''}
      </div>
      <div class="reminder-count" style="background:var(--text3)">${pendingMembers.length}</div>
    </div>`;
  }

  if (filtered.length === 0) {
    document.getElementById('paymentList').innerHTML = reminderHtml + `<div class="empty-state"><i class="bi bi-cash-stack"></i><p>${t('no_payments')}</p></div>`;
    return;
  }

  // ── Group payments by committee ─────────────────────────────────────────────
  const grouped = {};
  [...filtered].reverse().forEach(p => {
    const cId = p.committeeId || 0;
    if (!grouped[cId]) grouped[cId] = [];
    grouped[cId].push(p);
  });

  let html = reminderHtml;
  Object.keys(grouped).forEach(cId => {
    const c = getCommittee(parseInt(cId));
    const groupPayments = grouped[cId];
    const groupTotal = groupPayments.filter(p => p.type === 'paid').reduce((s, p) => s + p.amount, 0);
    const paidCount  = groupPayments.filter(p => p.type === 'paid').length;
    const lateCount  = groupPayments.filter(p => p.type === 'late').length;

    const dotStyle = lateCount > 0
      ? 'background:var(--danger);box-shadow:0 0 8px rgba(239,68,68,.4)'
      : 'background:linear-gradient(135deg,var(--accent),var(--accent-d));box-shadow:0 0 8px rgba(16,185,129,.4)';

    html += `<div class="pay-group">
      <div class="pay-group-header">
        <div class="pay-group-left">
          <div class="pay-group-dot" style="${dotStyle}"></div>
          <div>
            <div class="pay-group-name">${c?.name || t('unknown_committee')}</div>
            <div class="pay-group-meta">${groupPayments.length} ${t('entries_lbl')} · ${paidCount} ${t('paid_lbl')}${lateCount > 0 ? ` · <span style="color:var(--danger)">${lateCount} ${t('late_lbl')}</span>` : ''}</div>
          </div>
        </div>
        <div class="pay-group-total">${formatRs(groupTotal)}</div>
      </div>
      <div class="pay-group-items">`;

    groupPayments.forEach(p => {
      const m = getMember(p.memberId);
      const typeClass  = p.type === 'paid' ? 'pi-paid' : p.type === 'late' ? 'pi-late' : 'pi-pending';
      const typeIcon   = p.type === 'paid' ? 'bi-check-circle-fill' : p.type === 'late' ? 'bi-x-circle-fill' : 'bi-hourglass-split';
      const typeLabel  = p.type === 'paid' ? t('paid_status') : p.type === 'late' ? t('late_status') : t('pending_status');
      const needsWa    = (p.type === 'pending' || p.type === 'late') && m && m.phone && m.phone !== '—';

      html += `<div class="pay-item ${typeClass}">
        <div class="pi-left" onclick="openMemberDetail(${p.memberId})" style="cursor:pointer">
          <div class="pi-avatar" style="background:${m ? colorForMember(m) : '#334155'}">${m ? initials(m.name) : '?'}</div>
          <div style="min-width:0">
            <div class="pi-name">${m?.name || t('unknown_member')}</div>
            <div class="pi-sub">${p.date}${p.notes ? ' · ' + p.notes : ''}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:7px;flex-shrink:0;margin-left:8px;">
          ${needsWa ? `<button class="btn-wa-icon" onclick="sendWaReminder(${p.memberId})" title="WhatsApp Reminder">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </button>` : ''}
          <div class="pi-right">
            <div class="pi-amount">${formatRs(p.amount)}</div>
            <div class="pi-type"><i class="bi ${typeIcon} me-1"></i>${typeLabel}</div>
          </div>
        </div>
      </div>`;
    });

    html += `</div></div>`;
  });

  document.getElementById('paymentList').innerHTML = html;
}
window.renderPayments = renderPayments;

function setPayFilter(f, el) {
  state.filters.payment = f;
  document.querySelectorAll('#payChips .chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderPayments();
}
window.setPayFilter = setPayFilter;

// ─────────────────────────────────────────────────────────────────────────────
// MEMBER DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────
// WHATSAPP REMINDER
// ─────────────────────────────────────────────────────────────────────────────
function buildWaMessage(member, committee, type) {
  const amt = formatRs(committee.monthlyAmount);
  if (type === 'late') {
    return `Assalam o Alaikum ${member.name} bhai/sahiba! 🙏\n\n` +
      `*${committee.name}* committee ka payment abhi tak receive nahi hua.\n\n` +
      `💰 Amount: *${amt}*\n` +
      `⚠️ Status: *Late — Fine Applicable*\n\n` +
      `Meherbani karke jald se jald payment karein. Shukriya! 🤲\n\n` +
      `_KametiApp_`;
  }
  return `Assalam o Alaikum ${member.name} bhai/sahiba! 👋\n\n` +
    `*${committee.name}* committee ki maheena payment ki yaad dahaani:\n\n` +
    `💰 Amount: *${amt}*\n` +
    `📅 Status: *Pending*\n\n` +
    `Meherbani karke payment jald karein. Jazak Allah! 🌙\n\n` +
    `_KametiApp_`;
}

function sendWaReminder(memberId) {
  const m = getMember(memberId);
  const c = getCommittee(m.committeeId);
  if (!m || !c) return;

  const rawPhone = (m.phone || '').replace(/\D/g, '');
  if (!rawPhone || rawPhone === '' || m.phone === '—') {
    showToast(`${m.name} ${t('toast_wa_no_phone')}`, 'warn');
    return;
  }

  // Pakistani number normalize: 03xx → 923xx
  let phone = rawPhone;
  if (phone.startsWith('0')) phone = '92' + phone.slice(1);
  else if (!phone.startsWith('92')) phone = '92' + phone;

  const msg  = buildWaMessage(m, c, m.status);
  const url  = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
  showToast(`${m.name} ${t('toast_wa_sent')}`, '');
}
window.sendWaReminder = sendWaReminder;

// Bulk WhatsApp — sab pending/late members ko ek ek kar ke
function sendWaBulk(committeeId) {
  const members = committeeId
    ? state.members.filter(m => m.committeeId === committeeId && (m.status === 'pending' || m.status === 'late'))
    : state.members.filter(m => m.status === 'pending' || m.status === 'late');

  if (members.length === 0) { showToast(t('toast_wa_none_pending'), ''); return; }

  const withPhone = members.filter(m => m.phone && m.phone !== '—');
  if (withPhone.length === 0) { showToast(t('toast_wa_no_phones_any'), 'warn'); return; }

  // Ek ek karke open karta hai with small delay (browsers block multiple popups)
  withPhone.forEach((m, i) => {
    setTimeout(() => sendWaReminder(m.id), i * 800);
  });
  showToast(`${withPhone.length} ${t('toast_wa_bulk_sending')}`, '');
}
window.sendWaBulk = sendWaBulk;

// ─────────────────────────────────────────────────────────────────────────────
// MEMBER DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────
function openMemberDetail(memberId) {
  const m = getMember(memberId);
  const c = getCommittee(m.committeeId);
  const payments = state.payments.filter(p => p.memberId === memberId);
  const hasPhone = m.phone && m.phone !== '—';
  const isPendingOrLate = m.status === 'pending' || m.status === 'late';

  document.getElementById('mdTitle').textContent = m.name;
  document.getElementById('mdBody').innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
      <div style="width:54px;height:54px;border-radius:50%;background:${colorForMember(m)};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#fff;flex-shrink:0;">${initials(m.name)}</div>
      <div style="flex:1">
        <div style="font-weight:600;font-size:15px;">${m.name}</div>
        <div style="font-size:12px;color:var(--text3);">Member #${m.turn} · ${c?.name || '—'}</div>
        <div style="font-size:12px;color:var(--text3);display:flex;align-items:center;gap:6px;margin-top:2px;">
          ${hasPhone
            ? `<i class="bi bi-telephone-fill" style="color:var(--accent)"></i> ${m.phone}`
            : `<i class="bi bi-telephone-x" style="color:var(--text3)"></i> <span style="color:var(--text3)">${t('phone_not_saved')}</span>`
          }
        </div>
      </div>
    </div>
    ${isPendingOrLate && hasPhone ? `
    <div class="wa-reminder-strip" onclick="sendWaReminder(${m.id})">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      <span>${t('wa_reminder_btn')}</span>
      <i class="bi bi-chevron-right" style="margin-left:auto;font-size:11px;opacity:.6"></i>
    </div>` : isPendingOrLate && !hasPhone ? `
    <div style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:10px;padding:9px 12px;margin-bottom:12px;font-size:11px;color:var(--warn);display:flex;align-items:center;gap:8px;">
      <i class="bi bi-exclamation-triangle-fill"></i>
      ${t('wa_save_phone_hint')}
    </div>` : ''}
    <div style="background:var(--card2);border-radius:12px;padding:12px;margin-bottom:14px;">
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">${t('payments_history')}</div>
      ${payments.length === 0 ? `<p style="font-size:12px;color:var(--text3)">${t('no_payments')}</p>` :
        payments.map(p => {
          const pLabel = p.type === 'paid' ? t('paid_status') : p.type === 'late' ? t('late_status') : t('pending_status');
          return `
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;">
            <span>${p.date}</span>
            <span style="color:${p.type === 'paid' ? 'var(--accent)' : p.type === 'late' ? 'var(--danger)' : 'var(--warn)'};font-weight:600">${formatRs(p.amount)} · ${pLabel}</span>
          </div>`;
        }).join('')}
    </div>`;

  document.getElementById('mdActions').innerHTML = `
    <button class="btn-ghost" onclick="closeModal('memberDetailModal');openModal('recordPaymentModal');setTimeout(()=>{document.getElementById('payKameti').value='${m.committeeId}';populatePayMembers();document.getElementById('payMember').value='${m.id}'},100)">
      <i class="bi bi-cash me-1"></i>${t('btn_mark_paid')}
    </button>
    <button class="btn-danger-ghost" onclick="deleteMember(${m.id})">
      <i class="bi bi-trash me-1"></i>${t('btn_delete')}
    </button>`;

  openModal('memberDetailModal');
}
window.openMemberDetail = openMemberDetail;

function deleteMember(memberId) {
  const m = getMember(memberId);
  if (!confirm(`"${m.name}" ${t('confirm_delete_member')}`)) return;
  state.members  = state.members.filter(x => x.id !== memberId);
  state.payments = state.payments.filter(p => p.memberId !== memberId);
  closeModal('memberDetailModal');
  showToast(`${m.name} ${t('toast_member_deleted')}`, 'danger');
  renderDashboard(); renderMembers(); renderPayments();
  saveState();
}
window.deleteMember = deleteMember;

// ─────────────────────────────────────────────────────────────────────────────
// KAMETI DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────
function openKametiDetail(committeeId) {
  const c = getCommittee(committeeId);
  const members = state.members.filter(m => m.committeeId === committeeId);
  const paid    = members.filter(m => m.status === 'paid').length;
  const totalCollected = state.payments.filter(p => p.committeeId === committeeId && p.type === 'paid').reduce((s, p) => s + p.amount, 0);

  document.getElementById('kdTitle').textContent = c.name;
  document.getElementById('kdBody').innerHTML = `
    <div style="background:var(--card2);border-radius:12px;padding:14px;margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:12px;color:var(--text2)">${t('total_members_d')}</span><span style="font-size:12px;font-weight:600">${c.totalMembers}</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:12px;color:var(--text2)">${t('monthly_amount_d')}</span><span style="font-size:12px;font-weight:600">${formatRs(c.monthlyAmount)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:12px;color:var(--text2)">${t('start_date_d')}</span><span style="font-size:12px;font-weight:600">${c.startDate}</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:12px;color:var(--text2)">${t('current_month_d')}</span><span style="font-size:12px;font-weight:600">${c.currentMonth}/${c.totalMembers}</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:12px;color:var(--text2)">${t('paid_this_month_d')}</span><span style="font-size:12px;font-weight:600;color:var(--accent)">${paid}/${members.length}</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0"><span style="font-size:12px;color:var(--text2)">${t('total_collected_d')}</span><span style="font-size:12px;font-weight:600;color:var(--accent)">${formatRs(totalCollected)}</span></div>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn-ghost" style="flex:1" onclick="closeModal('kametiDetailModal');openModal('addMemberModal');setTimeout(()=>{document.getElementById('nmKameti').value='${c.id}'},100)"><i class="bi bi-person-plus me-1"></i>${t('btn_add_member_d')}</button>
      <button class="btn-danger-ghost" style="flex:1" onclick="deleteKameti(${committeeId})"><i class="bi bi-trash me-1"></i>${t('btn_delete')}</button>
    </div>`;
  openModal('kametiDetailModal');
}
window.openKametiDetail = openKametiDetail;

function deleteKameti(committeeId) {
  const c = getCommittee(committeeId);
  if (!confirm(`"${c.name}" ${t('confirm_delete_committee')}`)) return;
  state.committees = state.committees.filter(x => x.id !== committeeId);
  const mIds = state.members.filter(m => m.committeeId === committeeId).map(m => m.id);
  state.members  = state.members.filter(m => m.committeeId !== committeeId);
  state.payments = state.payments.filter(p => !mIds.includes(p.memberId));
  closeModal('kametiDetailModal');
  showToast(`"${c.name}" ${t('toast_committee_deleted')}`, 'danger');
  renderDashboard(); renderMembers(); renderPayments();
  populateKametiDropdowns();
  saveState();
}
window.deleteKameti = deleteKameti;

// ─────────────────────────────────────────────────────────────────────────────
// CREATE KAMETI
// ─────────────────────────────────────────────────────────────────────────────
function createKameti() {
  const name    = document.getElementById('nkName').value.trim();
  const members = parseInt(document.getElementById('nkMembers').value);
  const amount  = parseInt(document.getElementById('nkAmount').value);
  const date    = document.getElementById('nkDate').value;

  if (!name)               { showToast(t('label_comm_name') + (window.currentLang() === 'en' ? ' required!' : ' likhein!'), 'warn'); return; }
  if (!members || members < 1) { showToast(t('label_total_members') + (window.currentLang() === 'en' ? ' required!' : ' likhein!'), 'warn'); return; }
  if (!amount  || amount  < 1) { showToast(t('label_monthly_amt') + (window.currentLang() === 'en' ? ' required!' : ' likhein!'), 'warn'); return; }

  const newC = { id: state.nextId.committee++, name, totalMembers: members, monthlyAmount: amount, startDate: date || today(), currentMonth: 1, winnersHistory: [] };
  state.committees.push(newC);
  closeModal('newKametiModal');
  document.getElementById('nkName').value = '';
  document.getElementById('nkMembers').value = '';
  document.getElementById('nkAmount').value = '';
  showToast(`"${name}" ${t('toast_committee_created')}`, '');
  populateKametiDropdowns();
  renderDashboard();
  saveState();
}
window.createKameti = createKameti;

// ─────────────────────────────────────────────────────────────────────────────
// ADD MEMBER
// ─────────────────────────────────────────────────────────────────────────────
function addMember() {
  const name        = document.getElementById('nmName').value.trim();
  const phone       = document.getElementById('nmPhone').value.trim();
  const committeeId = parseInt(document.getElementById('nmKameti').value);

  if (!name)        { showToast(t('label_fullname') + (window.currentLang() === 'en' ? ' is required!' : ' likhein!'), 'warn'); return; }
  if (!committeeId) { showToast(t('label_committee') + (window.currentLang() === 'en' ? ' required!' : ' select karein!'), 'warn'); return; }

  const c = getCommittee(committeeId);
  const existingInComm = state.members.filter(m => m.committeeId === committeeId);
  if (existingInComm.length >= c.totalMembers) { showToast(`${c.name} ${t('toast_committee_full')}`, 'warn'); return; }

  const colorIdx = state.nextId.member % COLORS.length;
  const newM = { id: state.nextId.member++, name, phone: phone || '—', committeeId, status: 'pending', color: COLORS[colorIdx], turn: existingInComm.length + 1 };
  state.members.push(newM);
  state.payments.push({ id: state.nextId.payment++, memberId: newM.id, committeeId, amount: c.monthlyAmount, date: today(), type: 'pending', notes: '' });

  closeModal('addMemberModal');
  document.getElementById('nmName').value  = '';
  document.getElementById('nmPhone').value = '';
  showToast(`${name} ${t('toast_member_added')} ${c.name}! ✅`, '');
  renderDashboard(); renderMembers(); renderPayments();
  saveState();
}
window.addMember = addMember;

// ─────────────────────────────────────────────────────────────────────────────
// RECORD PAYMENT
// ─────────────────────────────────────────────────────────────────────────────
function populatePayMembers() {
  const cId     = parseInt(document.getElementById('payKameti').value);
  const members = state.members.filter(m => m.committeeId === cId && m.status !== 'paid');
  document.getElementById('payMember').innerHTML = members.length
    ? members.map(m => `<option value="${m.id}">${m.name}</option>`).join('')
    : `<option value="">${t('no_member_found')}</option>`;
}
window.populatePayMembers = populatePayMembers;

function recordPayment() {
  const committeeId = parseInt(document.getElementById('payKameti').value);
  const memberId    = parseInt(document.getElementById('payMember').value);
  const amount      = parseInt(document.getElementById('payAmount').value);
  const date        = document.getElementById('payDate').value;
  const notes       = document.getElementById('payNotes').value.trim();

  if (!amount || amount < 1) { showToast(t('label_amount') + (window.currentLang() === 'en' ? ' required!' : ' daakhil karein!'), 'warn'); return; }
  if (!memberId)             { showToast(t('label_member') + (window.currentLang() === 'en' ? ' required!' : ' select karein!'), 'warn'); return; }

  const m = getMember(memberId);
  const existing = state.payments.find(p => p.memberId === memberId && p.committeeId === committeeId && p.type !== 'paid');
  if (existing) { existing.type = 'paid'; existing.amount = amount; existing.date = date || today(); existing.notes = notes; }
  else          { state.payments.push({ id: state.nextId.payment++, memberId, committeeId, amount, date: date || today(), type: 'paid', notes }); }
  m.status = 'paid';

  // Check karo ke is committee ke sab members paid ho gaye — agar haan toh month increment karo
  const committee = getCommittee(committeeId);
  const allMembers = state.members.filter(mem => mem.committeeId === committeeId);
  const allPaid = allMembers.every(mem => mem.status === 'paid');
  if (allPaid && committee && committee.currentMonth < committee.totalMembers) {
    committee.currentMonth = committee.currentMonth + 1;
    // Agले month ke liye sab members reset karo pending par
    allMembers.forEach(mem => { mem.status = 'pending'; });
    state.payments.push(...allMembers.map(mem => ({
      id: state.nextId.payment++,
      memberId: mem.id,
      committeeId,
      amount: committee.monthlyAmount,
      date: today(),
      type: 'pending',
      notes: ''
    })));
    showToast(`🎉 ${committee.name} — Month ${committee.currentMonth - 1} ${t('toast_month_complete')}`, '');
  }

  closeModal('recordPaymentModal');
  document.getElementById('payAmount').value = '';
  document.getElementById('payNotes').value  = '';
  showToast(`${m.name} ${t('toast_payment_recorded')}`, '');
  renderDashboard(); renderMembers(); renderPayments();
  saveState();
}
window.recordPayment = recordPayment;

// ─────────────────────────────────────────────────────────────────────────────
// FINE
// ─────────────────────────────────────────────────────────────────────────────
function populateFineMembers() {
  const cId     = parseInt(document.getElementById('fineKameti').value);
  const members = state.members.filter(m => m.committeeId === cId && m.status !== 'paid');
  document.getElementById('fineMember').innerHTML = members.length
    ? members.map(m => `<option value="${m.id}">${m.name}</option>`).join('')
    : `<option value="">${t('no_member_found')}</option>`;
}
window.populateFineMembers = populateFineMembers;

function applyFine() {
  const memberId = parseInt(document.getElementById('fineMember').value);
  const fineAmt  = parseInt(document.getElementById('fineAmount').value);
  const reason   = document.getElementById('fineReason').value.trim();

  if (!memberId)          { showToast(t('label_member') + (window.currentLang() === 'en' ? ' required!' : ' select karein!'), 'warn'); return; }
  if (!fineAmt || fineAmt < 1) { showToast(t('label_fine_amt') + (window.currentLang() === 'en' ? ' required!' : ' likhein!'), 'warn'); return; }

  const m = getMember(memberId);
  m.status = 'late';
  const existing = state.payments.find(p => p.memberId === memberId && p.type !== 'paid');
  if (existing) { existing.type = 'late'; existing.amount += fineAmt; existing.notes = `Fine: ${formatRs(fineAmt)}${reason ? ' · ' + reason : ''}`; }
  else { state.payments.push({ id: state.nextId.payment++, memberId, committeeId: m.committeeId, amount: fineAmt, date: today(), type: 'late', notes: `Fine: ${formatRs(fineAmt)}${reason ? ' · ' + reason : ''}` }); }

  closeModal('fineModal');
  document.getElementById('fineAmount').value = '';
  document.getElementById('fineReason').value = '';
  showToast(`${m.name} ${t('toast_fine_applied')}`, 'warn');
  renderDashboard(); renderMembers(); renderPayments();
  saveState();
}
window.applyFine = applyFine;

// ─────────────────────────────────────────────────────────────────────────────
// DROPDOWNS
// ─────────────────────────────────────────────────────────────────────────────
function populateKametiDropdowns() {
  const opts   = state.committees.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  const noOpts = `<option value="">${t('dropdown_no_committee')}</option>`;
  ['nmKameti', 'payKameti', 'fineKameti', 'qaKameti'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = state.committees.length ? opts : noOpts;
  });
  populatePayMembers();
  populateFineMembers();
  populateQaMembers();
}
window.populateKametiDropdowns = populateKametiDropdowns;

// ─────────────────────────────────────────────────────────────────────────────
// MODALS
// ─────────────────────────────────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
  if (['addMemberModal', 'recordPaymentModal', 'fineModal', 'quranAndaziModal'].includes(id)) populateKametiDropdowns();
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}
function closeModalOutside(e, id) {
  if (e.target === document.getElementById(id)) closeModal(id);
}
window.openModal         = openModal;
window.closeModal        = closeModal;
window.closeModalOutside = closeModalOutside;

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────
function showToast(msg, type) {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  const icons = { warn: 'bi-exclamation-triangle-fill', danger: 'bi-x-circle-fill' };
  const icon  = icons[type] || 'bi-check-circle-fill';
  t.innerHTML = `<i class="bi ${icon}"></i> ${msg}`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(-6px)'; t.style.transition = '.3s ease'; setTimeout(() => t.remove(), 300); }, 2800);
}
window.showToast = showToast;

// ─────────────────────────────────────────────────────────────────────────────
// QURAN ANDAZI
// ─────────────────────────────────────────────────────────────────────────────
function populateQaMembers() {
  const cId = parseInt(document.getElementById('qaKameti')?.value);
  if (!cId) return;
  const c       = getCommittee(cId);
  const members = state.members.filter(m => m.committeeId === cId);
  if (!c.winnersHistory) c.winnersHistory = [];
  const wonIds   = c.winnersHistory.map(w => w.memberId);
  const eligible = members.filter(m => !wonIds.includes(m.id));

  const infoEl = document.getElementById('qaEligibleInfo');
  infoEl.innerHTML = `<span style="color:var(--accent);font-weight:600">${eligible.length}</span> ${t('label_eligible').toLowerCase()} · <span style="color:var(--text3)">${wonIds.length} ${t('qa_prev_winners').toLowerCase()}</span>`;

  const wrap = document.getElementById('qaCardsWrap');
  wrap.innerHTML = eligible.length === 0
    ? `<div style="color:var(--text3);font-size:12px;padding:10px">${t('qa_all_done')}</div>`
    : eligible.map(m => `<div class="qa-card" id="qacard-${m.id}" title="${m.name}">${initials(m.name)}</div>`).join('');

  document.getElementById('qaResult').style.display = 'none';
  const btn = document.getElementById('qaDrawBtn');
  btn.disabled = eligible.length === 0;
  btn.innerHTML = eligible.length === 0 ? t('qa_none_eligible') : `<i class="bi bi-shuffle me-2"></i>${t('btn_draw')}`;
}
window.populateQaMembers = populateQaMembers;

function startQuranAndazi() {
  const cId = parseInt(document.getElementById('qaKameti').value);
  if (!cId) { showToast(t('label_select_comm') + '!', 'warn'); return; }

  const c = getCommittee(cId);
  if (!c.winnersHistory) c.winnersHistory = [];
  const wonIds   = c.winnersHistory.map(w => w.memberId);
  const members  = state.members.filter(m => m.committeeId === cId);
  const eligible = members.filter(m => !wonIds.includes(m.id));

  if (eligible.length === 0) { showToast(t('qa_none_eligible') + '!', 'warn'); return; }

  const btn = document.getElementById('qaDrawBtn');
  btn.disabled = true;
  btn.innerHTML = `<i class="bi bi-hourglass-split me-2"></i>${t('btn_drawing')}`;

  const cards = document.querySelectorAll('.qa-card');
  cards.forEach(card => card.classList.add('spinning'));

  let count = 0;
  const totalFlips     = 20 + Math.floor(Math.random() * 15);
  let currentHighlight = -1;

  const interval = setInterval(() => {
    if (currentHighlight >= 0 && eligible[currentHighlight]) {
      const prev = document.getElementById('qacard-' + eligible[currentHighlight].id);
      if (prev) prev.style.transform = '';
    }
    const rnd = Math.floor(Math.random() * eligible.length);
    currentHighlight = rnd;
    const el = document.getElementById('qacard-' + eligible[rnd].id);
    if (el) el.style.transform = 'scale(1.15)';
    count++;

    if (count >= totalFlips) {
      clearInterval(interval);
      const winner = eligible[currentHighlight];

      cards.forEach(card => { card.classList.remove('spinning'); card.style.transform = ''; });

      setTimeout(() => {
        const winEl = document.getElementById('qacard-' + winner.id);
        if (winEl) winEl.classList.add('winner');

        c.winnersHistory.push({ memberId: winner.id, name: winner.name, date: today(), turn: c.winnersHistory.length + 1 });
        saveState();

        const resultEl = document.getElementById('qaResult');
        resultEl.style.display = 'block';
        resultEl.innerHTML = `
          <span class="qa-result-crown">🏆</span>
          <div class="qa-result-label">${t('qa_winner_label')}</div>
          <div class="qa-result-name">${winner.name}</div>
          <div class="qa-result-sub">${c.name} · ${t('member_hash')}${winner.turn}</div>
          <div class="qa-result-turn">Draw #${c.winnersHistory.length}</div>
          ${c.winnersHistory.length > 1 ? `
          <div class="qa-history">
            <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">${t('qa_prev_winners')}</div>
            ${[...c.winnersHistory].reverse().slice(1).map(w =>
              `<div class="qa-history-item"><span>${w.name}</span><span>Draw #${w.turn} · ${w.date}</span></div>`
            ).join('')}
          </div>` : ''}`;

        showToast(`🎉 ${winner.name} ${t('toast_winner')}`, '');
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-arrow-repeat me-2"></i>${t('btn_redraw')}`;
        populateQaMembers();
      }, 300);
    }
  }, 80);
}
window.startQuranAndazi = startQuranAndazi;

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
document.getElementById('nkDate').value  = today();
document.getElementById('payDate').value = today();