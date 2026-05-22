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
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = './auth.html';
    return;
  }
  currentUser = user;
  console.log(`✅ Logged in as: ${user.email}`);
  await loadStateFromFirestore();
  populateKametiDropdowns();
  renderDashboard();
  updateTopbarUser();   // ← Topbar update karo
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
    showToast('Logout mein masla aaya', 'danger');
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
    showToast('Data save mein masla aaya ⚠️', 'warn');
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
    showToast('Data load mein masla aaya ⚠️', 'warn');
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
let isDark = true;
function toggleTheme() {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('themeIcon').className = isDark ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
  showToast(isDark ? 'Dark mode on 🌙' : 'Light mode on ☀️', '');
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
    <div>Active Committees: <strong>${state.committees.length}</strong> — ${state.members.length} total members</div>
  </div>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-label"><i class="bi bi-people me-1"></i>Total Members</div><div class="stat-val c-text">${state.members.length}</div></div>
    <div class="stat-card"><div class="stat-label"><i class="bi bi-collection me-1"></i>Collected</div><div class="stat-val c-green">${formatRs(totalCollected)}</div></div>
    <div class="stat-card"><div class="stat-label"><i class="bi bi-hourglass me-1"></i>Pending</div><div class="stat-val c-warn">${formatRs(totalPending)}</div></div>
    <div class="stat-card"><div class="stat-label"><i class="bi bi-journal-check me-1"></i>Payments</div><div class="stat-val c-text">${state.payments.filter(p => p.type === 'paid').length}/${state.payments.length}</div></div>
  </div>`;

  state.committees.forEach(c => {
    const members  = state.members.filter(m => m.committeeId === c.id);
    const paid     = members.filter(m => m.status === 'paid').length;
    const pct      = members.length ? Math.round((paid / members.length) * 100) : 0;
    const collected = state.payments.filter(p => p.committeeId === c.id && p.type === 'paid').reduce((s, p) => s + p.amount, 0);
    const fillClass = pct < 50 ? 'warn-fill' : '';
    const badgeMonths = `Month ${c.currentMonth}/${c.totalMembers}`;

    html += `<div class="committee-card">
      <div class="comm-head">
        <div>
          <div class="comm-title" style="cursor:pointer" onclick="openKametiDetail(${c.id})">${c.name}</div>
          <div class="comm-meta">Monthly · ${formatRs(c.monthlyAmount)}/member · ${c.totalMembers} members</div>
        </div>
        <span class="badge badge-month">${badgeMonths}</span>
      </div>
      <div class="prog-wrap">
        <div class="prog-bg"><div class="prog-fill ${fillClass}" style="width:${pct}%"></div></div>
        <div class="prog-meta"><span>${formatRs(collected)} collected</span><span>${pct}% paid</span></div>
      </div>
      <div class="divider"></div>
      <div class="sec-label">Is month ki collection</div>`;

    members.forEach(m => {
      const statusIcon  = m.status === 'paid' ? 'bi-check-circle-fill' : m.status === 'late' ? 'bi-x-circle-fill' : 'bi-hourglass-split';
      const statusClass = m.status === 'paid' ? 's-paid' : m.status === 'late' ? 's-late' : 's-pending';
      const statusText  = m.status === 'paid' ? `Paid · ${formatRs(c.monthlyAmount)}` : m.status === 'late' ? 'Late — Fine Applied' : 'Pending';
      html += `<div class="member-row">
        <div class="mem-left">
          <div class="mem-avatar" style="background:${colorForMember(m)}">${initials(m.name)}</div>
          <div><div class="mem-name">${m.name}</div><div class="mem-sub">Member #${m.turn}</div></div>
        </div>
        <span class="mem-status ${statusClass}" onclick="openMemberDetail(${m.id})"><i class="bi ${statusIcon} me-1"></i>${statusText}</span>
      </div>`;
    });

    html += `<div class="action-row">
      <button class="btn-ghost" onclick="navigate('payments')"><i class="bi bi-journal-text me-1"></i>Payment Log</button>
      <button class="btn-ghost" onclick="openKametiDetail(${c.id})"><i class="bi bi-info-circle me-1"></i>Details</button>
    </div></div>`;
  });

  if (state.committees.length === 0) {
    html += `<div class="empty-state"><i class="bi bi-people"></i><p>Koi committee nahi. Nayi kameti banayein!</p></div>`;
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
    document.getElementById('memberList').innerHTML = `<div class="empty-state"><i class="bi bi-person-x"></i><p>Koi member nahi mila</p></div>`;
    return;
  }

  document.getElementById('memberList').innerHTML = filtered.map(m => {
    const c = getCommittee(m.committeeId);
    const badgeClass = m.status === 'paid' ? 'badge-active' : m.status === 'late' ? '' : 'badge-month';
    const badgeStyle = m.status === 'late' ? 'background:rgba(239,68,68,.1);color:#ef4444;border:1px solid rgba(239,68,68,.2)' : '';
    const statusLabel = m.status.charAt(0).toUpperCase() + m.status.slice(1);
    return `<div class="member-card" onclick="openMemberDetail(${m.id})">
      <div class="mc-avatar" style="background:${colorForMember(m)}">${initials(m.name)}</div>
      <div class="mc-info">
        <div class="mc-name">${m.name}</div>
        <div class="mc-sub">Member #${m.turn} · ${c?.name || '—'}</div>
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

  if (filtered.length === 0) {
    document.getElementById('paymentList').innerHTML = `<div class="empty-state"><i class="bi bi-cash-stack"></i><p>Koi payment record nahi</p></div>`;
    return;
  }

  const grouped = {};
  [...filtered].reverse().forEach(p => {
    const cId = p.committeeId || 0;
    if (!grouped[cId]) grouped[cId] = [];
    grouped[cId].push(p);
  });

  let html = '';
  Object.keys(grouped).forEach(cId => {
    const c = getCommittee(parseInt(cId));
    const groupPayments = grouped[cId];
    const groupTotal = groupPayments.filter(p => p.type === 'paid').reduce((s, p) => s + p.amount, 0);
    const paidCount  = groupPayments.filter(p => p.type === 'paid').length;

    html += `<div class="pay-group">
      <div class="pay-group-header">
        <div class="pay-group-left">
          <div class="pay-group-dot"></div>
          <div>
            <div class="pay-group-name">${c?.name || 'Unknown Committee'}</div>
            <div class="pay-group-meta">${groupPayments.length} entries · ${paidCount} paid</div>
          </div>
        </div>
        <div class="pay-group-total">${formatRs(groupTotal)}</div>
      </div>
      <div class="pay-group-items">`;

    groupPayments.forEach(p => {
      const m = getMember(p.memberId);
      const typeClass = p.type === 'paid' ? 'pi-paid' : p.type === 'late' ? 'pi-late' : 'pi-pending';
      const typeIcon  = p.type === 'paid' ? 'bi-check-circle-fill' : p.type === 'late' ? 'bi-x-circle-fill' : 'bi-hourglass-split';
      html += `<div class="pay-item">
        <div class="pi-left">
          <div class="pi-avatar" style="background:${m ? colorForMember(m) : '#334155'}">${m ? initials(m.name) : '?'}</div>
          <div>
            <div class="pi-name">${m?.name || 'Unknown'}</div>
            <div class="pi-sub">${p.date}${p.notes ? ' · ' + p.notes : ''}</div>
          </div>
        </div>
        <div class="pi-right">
          <div class="pi-amount ${typeClass}">${formatRs(p.amount)}</div>
          <div class="pi-type ${typeClass}"><i class="bi ${typeIcon} me-1"></i>${p.type}</div>
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
function openMemberDetail(memberId) {
  const m = getMember(memberId);
  const c = getCommittee(m.committeeId);
  const payments = state.payments.filter(p => p.memberId === memberId);

  document.getElementById('mdTitle').textContent = m.name;
  document.getElementById('mdBody').innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
      <div style="width:54px;height:54px;border-radius:50%;background:${colorForMember(m)};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#fff;flex-shrink:0;">${initials(m.name)}</div>
      <div>
        <div style="font-weight:600;font-size:15px;">${m.name}</div>
        <div style="font-size:12px;color:var(--text3);">Member #${m.turn} · ${c?.name || '—'}</div>
        <div style="font-size:12px;color:var(--text3);">${m.phone}</div>
      </div>
    </div>
    <div style="background:var(--card2);border-radius:12px;padding:12px;margin-bottom:14px;">
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Payment History</div>
      ${payments.length === 0 ? '<p style="font-size:12px;color:var(--text3)">Koi payment nahi</p>' :
        payments.map(p => `
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;">
            <span>${p.date}</span>
            <span style="color:${p.type === 'paid' ? 'var(--accent)' : p.type === 'late' ? 'var(--danger)' : 'var(--warn)'};font-weight:600">${formatRs(p.amount)} · ${p.type}</span>
          </div>`).join('')}
    </div>`;

  document.getElementById('mdActions').innerHTML = `
    <button class="btn-ghost" onclick="closeModal('memberDetailModal');openModal('recordPaymentModal');setTimeout(()=>{document.getElementById('payMember').value='${m.id}'},100)">
      <i class="bi bi-cash me-1"></i>Payment Record
    </button>
    <button class="btn-danger-ghost" onclick="deleteMember(${m.id})">
      <i class="bi bi-trash me-1"></i>Delete
    </button>`;

  openModal('memberDetailModal');
}
window.openMemberDetail = openMemberDetail;

function deleteMember(memberId) {
  const m = getMember(memberId);
  if (!confirm(`"${m.name}" delete karna chahte hain?`)) return;
  state.members  = state.members.filter(x => x.id !== memberId);
  state.payments = state.payments.filter(p => p.memberId !== memberId);
  closeModal('memberDetailModal');
  showToast(`${m.name} delete ho gaye`, 'danger');
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
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:12px;color:var(--text2)">Total Members</span><span style="font-size:12px;font-weight:600">${c.totalMembers}</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:12px;color:var(--text2)">Monthly Amount</span><span style="font-size:12px;font-weight:600">${formatRs(c.monthlyAmount)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:12px;color:var(--text2)">Start Date</span><span style="font-size:12px;font-weight:600">${c.startDate}</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:12px;color:var(--text2)">Current Month</span><span style="font-size:12px;font-weight:600">${c.currentMonth}/${c.totalMembers}</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:12px;color:var(--text2)">Paid This Month</span><span style="font-size:12px;font-weight:600;color:var(--accent)">${paid}/${members.length}</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0"><span style="font-size:12px;color:var(--text2)">Total Collected</span><span style="font-size:12px;font-weight:600;color:var(--accent)">${formatRs(totalCollected)}</span></div>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn-ghost" style="flex:1" onclick="closeModal('kametiDetailModal');openModal('addMemberModal');setTimeout(()=>{document.getElementById('nmKameti').value='${c.id}'},100)"><i class="bi bi-person-plus me-1"></i>Add Member</button>
      <button class="btn-danger-ghost" style="flex:1" onclick="deleteKameti(${committeeId})"><i class="bi bi-trash me-1"></i>Delete</button>
    </div>`;
  openModal('kametiDetailModal');
}
window.openKametiDetail = openKametiDetail;

function deleteKameti(committeeId) {
  const c = getCommittee(committeeId);
  if (!confirm(`"${c.name}" delete karna chahte hain? Sab members aur payments bhi hata diye jayenge.`)) return;
  state.committees = state.committees.filter(x => x.id !== committeeId);
  const mIds = state.members.filter(m => m.committeeId === committeeId).map(m => m.id);
  state.members  = state.members.filter(m => m.committeeId !== committeeId);
  state.payments = state.payments.filter(p => !mIds.includes(p.memberId));
  closeModal('kametiDetailModal');
  showToast(`"${c.name}" delete ho gayi`, 'danger');
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

  if (!name)               { showToast('Committee ka naam likhein!', 'warn'); return; }
  if (!members || members < 1) { showToast('Members ki tadaad likhein!', 'warn'); return; }
  if (!amount  || amount  < 1) { showToast('Monthly amount likhein!', 'warn'); return; }

  const newC = { id: state.nextId.committee++, name, totalMembers: members, monthlyAmount: amount, startDate: date || today(), currentMonth: 1, winnersHistory: [] };
  state.committees.push(newC);
  closeModal('newKametiModal');
  document.getElementById('nkName').value = '';
  document.getElementById('nkMembers').value = '';
  document.getElementById('nkAmount').value = '';
  showToast(`"${name}" successfully create ho gayi! ✅`, '');
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

  if (!name)        { showToast('Member ka naam likhein!', 'warn'); return; }
  if (!committeeId) { showToast('Committee select karein!', 'warn'); return; }

  const c = getCommittee(committeeId);
  const existingInComm = state.members.filter(m => m.committeeId === committeeId);
  if (existingInComm.length >= c.totalMembers) { showToast('Yeh committee bhar chuki hai!', 'warn'); return; }

  const colorIdx = state.nextId.member % COLORS.length;
  const newM = { id: state.nextId.member++, name, phone: phone || '—', committeeId, status: 'pending', color: COLORS[colorIdx], turn: existingInComm.length + 1 };
  state.members.push(newM);
  state.payments.push({ id: state.nextId.payment++, memberId: newM.id, committeeId, amount: c.monthlyAmount, date: today(), type: 'pending', notes: '' });

  closeModal('addMemberModal');
  document.getElementById('nmName').value  = '';
  document.getElementById('nmPhone').value = '';
  showToast(`${name} ko ${c.name} mein add kar diya! ✅`, '');
  renderDashboard(); renderMembers(); renderPayments();
  saveState();
}
window.addMember = addMember;

// ─────────────────────────────────────────────────────────────────────────────
// RECORD PAYMENT
// ─────────────────────────────────────────────────────────────────────────────
function populatePayMembers() {
  const cId     = parseInt(document.getElementById('payKameti').value);
  const members = state.members.filter(m => m.committeeId === cId);
  document.getElementById('payMember').innerHTML = members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
}
window.populatePayMembers = populatePayMembers;

function recordPayment() {
  const committeeId = parseInt(document.getElementById('payKameti').value);
  const memberId    = parseInt(document.getElementById('payMember').value);
  const amount      = parseInt(document.getElementById('payAmount').value);
  const date        = document.getElementById('payDate').value;
  const notes       = document.getElementById('payNotes').value.trim();

  if (!amount || amount < 1) { showToast('Amount daakhil karein!', 'warn'); return; }
  if (!memberId)             { showToast('Member select karein!', 'warn'); return; }

  const m = getMember(memberId);
  const existing = state.payments.find(p => p.memberId === memberId && p.committeeId === committeeId && p.type !== 'paid');
  if (existing) { existing.type = 'paid'; existing.amount = amount; existing.date = date || today(); existing.notes = notes; }
  else          { state.payments.push({ id: state.nextId.payment++, memberId, committeeId, amount, date: date || today(), type: 'paid', notes }); }
  m.status = 'paid';

  closeModal('recordPaymentModal');
  document.getElementById('payAmount').value = '';
  document.getElementById('payNotes').value  = '';
  showToast(`${m.name} ka ${formatRs(amount)} record ho gaya! 💰`, '');
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
    : '<option value="">No pending members</option>';
}
window.populateFineMembers = populateFineMembers;

function applyFine() {
  const memberId = parseInt(document.getElementById('fineMember').value);
  const fineAmt  = parseInt(document.getElementById('fineAmount').value);
  const reason   = document.getElementById('fineReason').value.trim();

  if (!memberId)          { showToast('Member select karein!', 'warn'); return; }
  if (!fineAmt || fineAmt < 1) { showToast('Fine amount likhein!', 'warn'); return; }

  const m = getMember(memberId);
  m.status = 'late';
  const existing = state.payments.find(p => p.memberId === memberId && p.type !== 'paid');
  if (existing) { existing.type = 'late'; existing.amount += fineAmt; existing.notes = `Fine: ${formatRs(fineAmt)}${reason ? ' · ' + reason : ''}`; }

  closeModal('fineModal');
  document.getElementById('fineAmount').value = '';
  document.getElementById('fineReason').value = '';
  showToast(`${m.name} par ${formatRs(fineAmt)} fine apply ho gaya! ⚠️`, 'warn');
  renderDashboard(); renderMembers(); renderPayments();
  saveState();
}
window.applyFine = applyFine;

// ─────────────────────────────────────────────────────────────────────────────
// DROPDOWNS
// ─────────────────────────────────────────────────────────────────────────────
function populateKametiDropdowns() {
  const opts   = state.committees.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  const noOpts = '<option value="">Pehle committee banayein</option>';
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
  infoEl.innerHTML = `<span style="color:var(--accent);font-weight:600">${eligible.length}</span> eligible members · <span style="color:var(--text3)">${wonIds.length} pehle se winner ban chuke hain</span>`;

  const wrap = document.getElementById('qaCardsWrap');
  wrap.innerHTML = eligible.length === 0
    ? `<div style="color:var(--text3);font-size:12px;padding:10px">Tamam members draw ho chuke hain.</div>`
    : eligible.map(m => `<div class="qa-card" id="qacard-${m.id}" title="${m.name}">${initials(m.name)}</div>`).join('');

  document.getElementById('qaResult').style.display = 'none';
  const btn = document.getElementById('qaDrawBtn');
  btn.disabled = eligible.length === 0;
  btn.innerHTML = eligible.length === 0 ? 'Koi eligible member nahi' : '<i class="bi bi-shuffle me-2"></i>Draw Karein';
}
window.populateQaMembers = populateQaMembers;

function startQuranAndazi() {
  const cId = parseInt(document.getElementById('qaKameti').value);
  if (!cId) { showToast('Committee select karein!', 'warn'); return; }

  const c = getCommittee(cId);
  if (!c.winnersHistory) c.winnersHistory = [];
  const wonIds   = c.winnersHistory.map(w => w.memberId);
  const members  = state.members.filter(m => m.committeeId === cId);
  const eligible = members.filter(m => !wonIds.includes(m.id));

  if (eligible.length === 0) { showToast('Koi eligible member nahi!', 'warn'); return; }

  const btn = document.getElementById('qaDrawBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Draw ho raha hai...';

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
      const winnerIdx = Math.floor(Math.random() * eligible.length);
      const winner    = eligible[winnerIdx];

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
          <div class="qa-result-label">Is Maah Ka Winner</div>
          <div class="qa-result-name">${winner.name}</div>
          <div class="qa-result-sub">${c.name} · Member #${winner.turn}</div>
          <div class="qa-result-turn">Draw #${c.winnersHistory.length}</div>
          ${c.winnersHistory.length > 1 ? `
          <div class="qa-history">
            <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Pichle Winners</div>
            ${[...c.winnersHistory].reverse().slice(1).map(w =>
              `<div class="qa-history-item"><span>${w.name}</span><span>Draw #${w.turn} · ${w.date}</span></div>`
            ).join('')}
          </div>` : ''}`;

        showToast(`🎉 ${winner.name} is maah ka winner! Mubarak!`, '');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-arrow-repeat me-2"></i>Dubara Draw Karein';
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
onAuthStateChanged(auth, (user) => {
  console.log("AUTH USER:", user);
});
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("READY USER:", user.uid);
  }
});
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = './auth.html';
    return;
  }

  currentUser = user;

  console.log("LOGGED IN:", currentUser.uid);

  await loadStateFromFirestore();
  populateKametiDropdowns();
  renderDashboard();
  updateTopbarUser();
});