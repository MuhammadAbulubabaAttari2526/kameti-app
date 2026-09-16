import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithRedirect, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import Topbar from './components/Topbar';
import AuthScreen from './components/AuthScreen';
import DashboardPage from './components/DashboardPage';
import MembersPage from './components/MembersPage';
import PaymentsPage from './components/PaymentsPage';
import CreatePage from './components/CreatePage';
import QuranAndaziModal from './components/QuranAndaziModal';
import FineModal from './components/FineModal';
import Toast from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import LoadingScreen from './components/LoadingScreen';
import { COLORS, initialState, initials } from './utils';
import { auth, db } from './firebase';
import { t } from './i18n';

const getStoredState = () => {
  try {
    const saved = localStorage.getItem('kameti-react-state');
    if (!saved) return initialState;
    const parsed = JSON.parse(saved);
    return cleanDemoState(parsed);
  } catch {
    return initialState;
  }
};

const cleanDemoState = (savedState) => {
  const demoNames = new Set(['Gulshan Family', 'Office Circle']);
  const demoCommitteeIds = new Set((savedState.committees || [])
    .filter((committee) => demoNames.has(committee.name))
    .map((committee) => committee.id));

  if (!demoCommitteeIds.size) return savedState;

  const members = (savedState.members || []).filter((member) => !demoCommitteeIds.has(member.committeeId));
  const memberIds = new Set(members.map((member) => member.id));
  return {
    ...savedState,
    committees: (savedState.committees || []).filter((committee) => !demoCommitteeIds.has(committee.id)),
    members,
    payments: (savedState.payments || []).filter((payment) => memberIds.has(payment.memberId)),
    nextId: {
      committee: Math.max(1, ...((savedState.committees || []).map((committee) => committee.id + 1))),
      member: Math.max(1, ...members.map((member) => member.id + 1)),
      payment: Math.max(1, ...((savedState.payments || []).filter((payment) => memberIds.has(payment.memberId)).map((payment) => payment.id + 1))),
    },
  };
};

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [firestoreLoaded, setFirestoreLoaded] = useState(false);
  const [state, setState] = useState(getStoredState);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('kameti-theme') || 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem('kameti-lang') || localStorage.getItem('kametiLang') || 'ur');
  const [newKameti, setNewKameti] = useState({ name: '', totalMembers: '', frequency: 'monthly', monthlyAmount: '', startDate: '' });
  const [memberForm, setMemberForm] = useState({ name: '', phone: '', committeeId: '' });
  const [paymentForm, setPaymentForm] = useState({ committeeId: '', memberId: '', amount: '', date: '', notes: '' });
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    let stopDataListener = () => {};
    const stopAuthListener = onAuthStateChanged(auth, (nextUser) => {
      stopDataListener();
      setUser(nextUser);
      if (!nextUser) {
        setFirestoreLoaded(false);
        setAuthLoading(false);
        return;
      }

      stopDataListener = onSnapshot(doc(db, 'users', nextUser.uid, 'appData', 'main'), (snapshot) => {
        if (snapshot.exists()) setState((previous) => ({ ...previous, ...cleanDemoState(snapshot.data()), filters: previous.filters }));
        setFirestoreLoaded(true);
        setAuthLoading(false);
      }, (error) => {
        console.error('Firestore load error:', error);
        setFirestoreLoaded(true);
        setAuthLoading(false);
        setToast({ message: 'Data load nahi ho saka.', type: 'error' });
      });
    });
    return () => { stopDataListener(); stopAuthListener(); };
  }, []);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.lang = language === 'ur' ? 'ur' : 'en';
    localStorage.setItem('kameti-theme', theme);
  }, [theme, language]);

  useEffect(() => {
    localStorage.setItem('kameti-lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('kameti-react-state', JSON.stringify(state));
    if (user && firestoreLoaded) {
      setDoc(doc(db, 'users', user.uid, 'appData', 'main'), {
        committees: state.committees,
        members: state.members,
        payments: state.payments,
        nextId: state.nextId,
      }).catch((error) => console.error('Firestore save error:', error));
    }
  }, [state, user, firestoreLoaded]);

  const memberOptions = useMemo(
    () => state.committees.map((committee) => ({ value: committee.id, label: committee.name })),
    [state.committees]
  );

  const getMember = (id) => state.members.find((m) => m.id === id);
  const getCommittee = (id) => state.committees.find((c) => c.id === id);

  const openModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = (modalName) => {
    if (!modalName || activeModal === modalName) setActiveModal(null);
  };

  useEffect(() => {
    document.body.style.overflow = activeModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [activeModal]);

  const setFilter = (group, value) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, [group]: value },
    }));
  };

  const handleCreateKameti = (e) => {
    e.preventDefault();
    if (!newKameti.name.trim()) return notify('Committee name is required', 'warning');
    if (!newKameti.totalMembers || Number(newKameti.totalMembers) < 1) return notify('Enter valid total members', 'warning');
    if (!newKameti.monthlyAmount || Number(newKameti.monthlyAmount) < 1) return notify(`Enter valid ${newKameti.frequency} amount`, 'warning');

    const committee = {
      id: state.nextId.committee,
      name: newKameti.name.trim(),
      totalMembers: Number(newKameti.totalMembers),
      frequency: newKameti.frequency || 'monthly',
      monthlyAmount: Number(newKameti.monthlyAmount),
      startDate: newKameti.startDate || new Date().toISOString().split('T')[0],
      currentMonth: 1,
      winnersHistory: [],
    };

    setState((prev) => ({
      ...prev,
      committees: [...prev.committees, committee],
      nextId: { ...prev.nextId, committee: prev.nextId.committee + 1 },
    }));

    setNewKameti({ name: '', totalMembers: '', frequency: 'monthly', monthlyAmount: '', startDate: '' });
    closeModal('newKametiModal');
    notify('Committee create ho gayi.');
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    const committeeId = Number(memberForm.committeeId || 0);
    if (!memberForm.name.trim()) return notify('Member name is required', 'warning');
    if (!committeeId) return notify('Select a committee', 'warning');

    const committee = getCommittee(committeeId);
    if (!committee) return;

    const existing = state.members.filter((m) => m.committeeId === committeeId);
    if (existing.length >= committee.totalMembers) return notify('This committee is full', 'warning');

    const newMember = {
      id: state.nextId.member,
      name: memberForm.name.trim(),
      phone: memberForm.phone.trim() || '—',
      committeeId,
      status: 'pending',
      color: COLORS[state.nextId.member % COLORS.length],
      turn: existing.length + 1,
    };

    setState((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
      payments: [
        ...prev.payments,
        {
          id: prev.nextId.payment,
          memberId: newMember.id,
          committeeId,
          amount: committee.monthlyAmount,
          date: new Date().toISOString().split('T')[0],
          type: 'pending',
          notes: '',
        },
      ],
      nextId: { ...prev.nextId, member: prev.nextId.member + 1, payment: prev.nextId.payment + 1 },
    }));

    setMemberForm({ name: '', phone: '', committeeId: '' });
    closeModal('addMemberModal');
    notify('Member add ho gaya.');
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const committeeId = Number(paymentForm.committeeId || 0);
    const memberId = Number(paymentForm.memberId || 0);
    const amount = Number(paymentForm.amount || 0);

    if (!amount || amount < 1) return notify('Enter a valid payment amount', 'warning');
    if (!memberId) return notify('Select a member', 'warning');

    const member = getMember(memberId);
    if (!member) return;

    setState((prev) => {
      const updatedPayments = [...prev.payments];
      const existing = updatedPayments.find((p) => p.memberId === memberId && p.type !== 'paid');

      if (existing) {
        existing.type = 'paid';
        existing.amount = amount;
        existing.date = paymentForm.date || new Date().toISOString().split('T')[0];
        existing.notes = paymentForm.notes || '';
      } else {
        updatedPayments.push({
          id: prev.nextId.payment,
          memberId,
          committeeId,
          amount,
          date: paymentForm.date || new Date().toISOString().split('T')[0],
          type: 'paid',
          notes: paymentForm.notes || '',
        });
      }

      const members = prev.members.map((item) => (item.id === memberId ? { ...item, status: 'paid' } : item));
      const committee = prev.committees.find((item) => item.id === committeeId);
      const committeeMembers = members.filter((item) => item.committeeId === committeeId);
      const monthComplete = committee && committeeMembers.length > 0 && committeeMembers.every((item) => item.status === 'paid');
      const nextPayments = monthComplete && committee.currentMonth < committee.totalMembers
        ? [...updatedPayments, ...committeeMembers.map((item, index) => ({ id: prev.nextId.payment + index + 1, memberId: item.id, committeeId, amount: committee.monthlyAmount, date: new Date().toISOString().split('T')[0], type: 'pending', notes: '' }))]
        : updatedPayments;

      return {
        ...prev,
        committees: monthComplete ? prev.committees.map((item) => item.id === committeeId ? { ...item, currentMonth: item.currentMonth + 1 } : item) : prev.committees,
        members: monthComplete ? members.map((item) => item.committeeId === committeeId ? { ...item, status: 'pending' } : item) : members,
        payments: nextPayments,
        nextId: { ...prev.nextId, payment: prev.nextId.payment + 1 + (monthComplete ? committeeMembers.length : 0) },
      };
    });

    setPaymentForm({ committeeId: '', memberId: '', amount: '', date: '', notes: '' });
    closeModal('recordPaymentModal');
    notify('Payment record ho gayi.');
  };

  const deleteMember = (memberId) => {
    const member = getMember(memberId);
    setConfirm({ title: 'Delete member?', message: `${member?.name || 'This member'} ka record delete ho jayega.`, action: () => {
    setState((prev) => ({
      ...prev,
      members: prev.members.filter((member) => member.id !== memberId),
      payments: prev.payments.filter((payment) => payment.memberId !== memberId),
    }));
    setSelectedMember(null);
    notify('Member delete ho gaya.', 'warning');
    }});
  };

  const deleteCommittee = (committeeId) => {
    const committee = getCommittee(committeeId);
    setConfirm({ title: 'Delete committee?', message: `${committee?.name || 'This committee'} ke members aur payments bhi delete ho jayenge.`, action: () => {
    setState((prev) => {
      const memberIds = prev.members.filter((m) => m.committeeId === committeeId).map((m) => m.id);
      return {
        ...prev,
        committees: prev.committees.filter((committee) => committee.id !== committeeId),
        members: prev.members.filter((member) => member.committeeId !== committeeId),
        payments: prev.payments.filter((payment) => !memberIds.includes(payment.memberId)),
      };
    });
    setSelectedCommittee(null);
    notify('Committee delete ho gayi.', 'warning');
    }});
  };

  const shuffleWinner = (committeeId) => {
    const committee = state.committees.find((item) => item.id === committeeId);
    const members = state.members.filter((member) => member.committeeId === committeeId);
    if (!committee || !members.length) {
      notify('Pehle is committee mein members add karein.', 'warning');
      return;
    }

    const history = committee.winnersHistory || [];
    const winnerIds = new Set(history.map((entry) => (typeof entry === 'object' ? entry.memberId : entry)));
    const availableMembers = members.filter((member) => !winnerIds.has(member.id));
    const pool = availableMembers.length ? availableMembers : members;
    const winner = pool[Math.floor(Math.random() * pool.length)];
    const nextHistory = availableMembers.length ? history : [];

    setState((prev) => ({
      ...prev,
      committees: prev.committees.map((item) => item.id === committeeId
        ? { ...item, winnersHistory: [...nextHistory, { memberId: winner.id, date: new Date().toISOString() }] }
        : item),
    }));
    notify(`${winner.name} is month's winner!`);
  };

  const recordWinner = (committeeId, winner) => {
    setState((prev) => ({
      ...prev,
      committees: prev.committees.map((item) => item.id === committeeId
        ? { ...item, winnersHistory: [...(item.winnersHistory || []), { memberId: winner.id, name: winner.name, date: new Date().toISOString(), turn: (item.winnersHistory || []).length + 1 }] }
        : item),
    }));
  };

  const applyFine = (memberId, amount, reason) => {
    setState((prev) => {
      const member = prev.members.find((item) => item.id === memberId);
      if (!member) return prev;
      const note = `Fine: ${formatRs(amount)}${reason ? ` · ${reason}` : ''}`;
      const payments = [...prev.payments];
      const existing = payments.find((payment) => payment.memberId === memberId && payment.type !== 'paid');
      if (existing) {
        existing.type = 'late';
        existing.amount += amount;
        existing.notes = note;
      } else {
        payments.push({ id: prev.nextId.payment, memberId, committeeId: member.committeeId, amount, date: new Date().toISOString().split('T')[0], type: 'late', notes: note });
      }
      return { ...prev, members: prev.members.map((item) => item.id === memberId ? { ...item, status: 'late' } : item), payments, nextId: { ...prev.nextId, payment: prev.nextId.payment + (existing ? 0 : 1) } };
    });
  };

  const sendWhatsApp = (memberId) => {
    const member = getMember(memberId);
    const committee = member && getCommittee(member.committeeId);
    const phone = member?.phone?.replace(/\D/g, '').replace(/^0/, '92');
    if (!member || !committee || !phone) {
      notify('Is member ka valid phone number save nahi hai.', 'warning');
      return;
    }
    const message = `Assalam o Alaikum ${member.name}! ${committee.name} committee ki ${member.status === 'late' ? 'late' : 'pending'} payment reminder. Amount: Rs ${Number(committee.monthlyAmount).toLocaleString('en-PK')}. Shukriya!`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <>
      <div className="app" id="app">
        <Topbar
          theme={theme}
          toggleTheme={toggleTheme}
          language={language}
          setLanguage={setLanguage}
          user={user}
          onLogout={() => setConfirm({ title: 'Logout?', message: 'Aap apne account se logout ho jayenge.', confirmLabel: 'Logout', action: () => signOut(auth) })}
          onShuffle={() => openModal('quranAndaziModal')}
          onCreate={() => openModal('newKametiModal')}
        />

        {currentPage === 'dashboard' && (
          <DashboardPage
            state={state}
            language={language}
            setCurrentPage={setCurrentPage}
            setSelectedCommittee={setSelectedCommittee}
            setSelectedMember={setSelectedMember}
            shuffleWinner={shuffleWinner}
            openModal={openModal}
          />
        )}

        {currentPage === 'members' && (
          <MembersPage
            state={state}
            language={language}
            getCommittee={getCommittee}
            setFilter={setFilter}
            setSelectedMember={setSelectedMember}
            openModal={openModal}
            sendWhatsApp={sendWhatsApp}
          />
        )}

        {currentPage === 'payments' && (
          <PaymentsPage
            state={state}
            language={language}
            getCommittee={getCommittee}
            getMember={getMember}
            setFilter={setFilter}
            setSelectedMember={setSelectedMember}
            openModal={openModal}
          />
        )}

        {currentPage === 'create' && <CreatePage openModal={openModal} language={language} />}

        <nav className="bottom-nav">
          <button className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
            <i className="bi bi-house-fill" />
            <span>{t(language, 'dashboard')}</span>
          </button>
          <button className={`nav-item ${currentPage === 'members' ? 'active' : ''}`} onClick={() => setCurrentPage('members')}>
            <i className="bi bi-people-fill" />
            <span>{t(language, 'members')}</span>
          </button>
          <button className={`nav-item ${currentPage === 'payments' ? 'active' : ''}`} onClick={() => setCurrentPage('payments')}>
            <i className="bi bi-cash-coin" />
            <span>{t(language, 'payments')}</span>
          </button>
          <button className={`nav-item ${currentPage === 'create' ? 'active' : ''}`} onClick={() => setCurrentPage('create')}>
            <i className="bi bi-plus-circle-fill" />
            <span>{t(language, 'create')}</span>
          </button>
        </nav>

        <button className="fab" onClick={() => openModal('recordPaymentModal')}>
          <i className="bi bi-plus-lg" />
        </button>

        <div className={`modal-overlay ${activeModal === 'newKametiModal' ? 'open' : ''}`} id="newKametiModal" onClick={(e) => e.target.id === 'newKametiModal' && closeModal('newKametiModal')}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <button className="modal-close" onClick={() => closeModal('newKametiModal')}><i className="bi bi-x-lg" /></button>
            <div className="modal-title">{t(language, 'createCommittee')}</div>
            <form onSubmit={handleCreateKameti}>
              <div className="form-group">
                <label className="form-label">{t(language, 'committeeName')}</label>
                <input className="form-input" value={newKameti.name} onChange={(e) => setNewKameti({ ...newKameti, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t(language, 'totalMembersField')}</label>
                <input className="form-input" type="number" min="1" value={newKameti.totalMembers} onChange={(e) => setNewKameti({ ...newKameti, totalMembers: e.target.value })} />
              </div>
              <div className="form-group">
                  <label className="form-label">{t(language, 'amountPerCycle')}</label>
                <input className="form-input" type="number" min="1" value={newKameti.monthlyAmount} onChange={(e) => setNewKameti({ ...newKameti, monthlyAmount: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t(language, 'frequency')}</label>
                <div className="frequency-toggle">
                  {['monthly', 'daily'].map((frequency) => (
                    <button key={frequency} type="button" className={newKameti.frequency === frequency ? 'active' : ''} onClick={() => setNewKameti({ ...newKameti, frequency })}>
                      {t(language, frequency)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t(language, 'startDate')}</label>
                <input className="form-input" type="date" value={newKameti.startDate} onChange={(e) => setNewKameti({ ...newKameti, startDate: e.target.value })} />
              </div>
              <button type="submit" className="btn-submit">{t(language, 'createCommittee')}</button>
            </form>
          </div>
        </div>

        <div className={`modal-overlay ${activeModal === 'addMemberModal' ? 'open' : ''}`} id="addMemberModal" onClick={(e) => e.target.id === 'addMemberModal' && closeModal('addMemberModal')}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <button className="modal-close" onClick={() => closeModal('addMemberModal')}><i className="bi bi-x-lg" /></button>
            <div className="modal-title">{t(language, 'addMember')}</div>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">{t(language, 'fullName')}</label>
                <input className="form-input" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t(language, 'phone')}</label>
                <input className="form-input" value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t(language, 'committee')}</label>
                <select className="form-input" value={memberForm.committeeId} onChange={(e) => setMemberForm({ ...memberForm, committeeId: e.target.value })}>
                  <option value="">{t(language, 'selectCommittee')}</option>
                  {memberOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-submit">{t(language, 'addMember')}</button>
            </form>
          </div>
        </div>

        <div className={`modal-overlay ${activeModal === 'recordPaymentModal' ? 'open' : ''}`} id="recordPaymentModal" onClick={(e) => e.target.id === 'recordPaymentModal' && closeModal('recordPaymentModal')}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <button className="modal-close" onClick={() => closeModal('recordPaymentModal')}><i className="bi bi-x-lg" /></button>
            <div className="modal-title">{t(language, 'recordPayment')}</div>
            <form onSubmit={handleRecordPayment}>
              <div className="form-group">
                <label className="form-label">Committee</label>
                <select className="form-input" value={paymentForm.committeeId} onChange={(e) => {
                  const nextCommitteeId = e.target.value;
                  setPaymentForm({ ...paymentForm, committeeId: nextCommitteeId, memberId: '' });
                }}>
                  <option value="">Select committee</option>
                  {memberOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Member</label>
                <select className="form-input" value={paymentForm.memberId} onChange={(e) => setPaymentForm({ ...paymentForm, memberId: e.target.value })}>
                  <option value="">Select member</option>
                  {state.members
                    .filter((member) => Number(paymentForm.committeeId || 0) === 0 || member.committeeId === Number(paymentForm.committeeId))
                    .map((member) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (Rs)</label>
                <input className="form-input" type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Date</label>
                <input className="form-input" type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="form-input" value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} />
              </div>
              <button type="submit" className="btn-submit">Record Payment</button>
            </form>
          </div>
        </div>

        <div className={`modal-overlay ${activeModal === 'memberDetailModal' ? 'open' : ''}`} id="memberDetailModal" onClick={(e) => e.target.id === 'memberDetailModal' && closeModal('memberDetailModal')}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <button className="modal-close" onClick={() => closeModal('memberDetailModal')}><i className="bi bi-x-lg" /></button>
            {selectedMember && (
              <>
                <div className="modal-title">{selectedMember.name}</div>
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="mc-avatar" style={{ background: selectedMember.color || '#334155', width: 54, height: 54 }}>
                      {initials(selectedMember.name)}
                    </div>
                    <div>
                      <div className="mc-name">{selectedMember.name}</div>
                      <div className="mc-sub">Member #{selectedMember.turn}</div>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <div className="user-info-grid">
                    <div className="user-info-row">
                      <span>Phone</span>
                      <span>{selectedMember.phone}</span>
                    </div>
                    <div className="user-info-row">
                      <span>Status</span>
                      <span>{selectedMember.status}</span>
                    </div>
                  </div>
                </div>
                <div className="member-history">
                  <div className="history-title">Payment History</div>
                  {state.payments.filter((payment) => payment.memberId === selectedMember.id).length === 0
                    ? <div className="history-empty">No payment records</div>
                    : state.payments.filter((payment) => payment.memberId === selectedMember.id).slice().reverse().map((payment) => (
                      <div className="history-row" key={payment.id}>
                        <span>{payment.date}</span>
                        <strong className={`history-${payment.type}`}>{formatRs(payment.amount)} · {payment.type}</strong>
                      </div>
                    ))}
                </div>
                <div className="action-row">
                  <button className="btn-ghost" onClick={() => {
                    setPaymentForm({
                      committeeId: selectedMember.committeeId,
                      memberId: selectedMember.id,
                      amount: '',
                      date: new Date().toISOString().split('T')[0],
                      notes: ''
                    });
                    closeModal('memberDetailModal');
                    openModal('recordPaymentModal');
                  }}>Mark Paid</button>
                  <button className="btn-danger-ghost" onClick={() => deleteMember(selectedMember.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={`modal-overlay ${activeModal === 'kametiDetailModal' ? 'open' : ''}`} id="kametiDetailModal" onClick={(e) => e.target.id === 'kametiDetailModal' && closeModal('kametiDetailModal')}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <button className="modal-close" onClick={() => closeModal('kametiDetailModal')}><i className="bi bi-x-lg" /></button>
            {selectedCommittee && (
              <>
                <div className="modal-title">{selectedCommittee.name}</div>
                <div className="user-info-grid">
                  <div className="user-info-row"><span>Total Members</span><span>{selectedCommittee.totalMembers}</span></div>
                  <div className="user-info-row"><span>{selectedCommittee.frequency === 'daily' ? t(language, 'daily') : t(language, 'monthly')} {t(language, 'amountPerCycle')}</span><span>Rs {selectedCommittee.monthlyAmount.toLocaleString('en-PK')}</span></div>
                  <div className="user-info-row"><span>Start Date</span><span>{selectedCommittee.startDate}</span></div>
                  <div className="user-info-row"><span>Members</span><span>{state.members.filter((m) => m.committeeId === selectedCommittee.id).length}</span></div>
                </div>
                <div className="winner-history">
                  <div className="history-title"><i className="bi bi-trophy me-1" />Winner History</div>
                  {(selectedCommittee.winnersHistory || []).length === 0 ? (
                    <div className="history-empty">No winners yet</div>
                  ) : (
                    [...selectedCommittee.winnersHistory].reverse().map((entry, index) => {
                      const member = state.members.find((item) => item.id === (typeof entry === 'object' ? entry.memberId : entry));
                      const winnerName = entry.name || member?.name || 'Unknown member';
                      const winnerDate = entry.date ? new Date(entry.date).toLocaleDateString() : '—';
                      const drawNumber = entry.turn || selectedCommittee.winnersHistory.length - index;
                      return (
                        <div className="winner-history-row" key={`${winnerName}-${winnerDate}-${drawNumber}`}>
                          <span className="winner-rank">#{drawNumber}</span>
                          <span className="winner-name">{winnerName}</span>
                          <span className="winner-date">{winnerDate}</span>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="action-row">
                  <button className="btn-ghost" onClick={() => {
                    setMemberForm({ name: '', phone: '', committeeId: String(selectedCommittee.id) });
                    closeModal('kametiDetailModal');
                    openModal('addMemberModal');
                  }}>Add Member</button>
                  <button className="btn-danger-ghost" onClick={() => deleteCommittee(selectedCommittee.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        </div>

        <QuranAndaziModal open={activeModal === 'quranAndaziModal'} committees={state.committees} members={state.members} language={language} onClose={() => closeModal('quranAndaziModal')} onDraw={recordWinner} />
        <FineModal open={activeModal === 'fineModal'} committees={state.committees} members={state.members} language={language} onClose={() => closeModal('fineModal')} onApply={applyFine} />
        <Toast toast={toast} onClose={() => setToast(null)} />
        <ConfirmModal open={Boolean(confirm)} title={confirm?.title} message={confirm?.message} confirmLabel={confirm?.confirmLabel} onCancel={() => setConfirm(null)} onConfirm={() => { confirm.action(); setConfirm(null); }} />
      </div>
    </>
  );
}

export default App;
