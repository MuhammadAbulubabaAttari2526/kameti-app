import { formatRs, initials, COLORS } from '../utils';
import { t } from '../i18n';

const DashboardPage = ({ state, language, setCurrentPage, setSelectedCommittee, setSelectedMember, shuffleWinner, openModal, isActive = true }) => {
  const totalCollected = state.payments.filter((p) => p.type === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = state.payments.filter((p) => p.type === 'pending' || p.type === 'late').reduce((sum, p) => sum + p.amount, 0);
  const paidPayments = state.payments.filter((payment) => payment.type === 'paid').length;
  const collectionRate = state.payments.length ? Math.round((paidPayments / state.payments.length) * 100) : 0;
  const lateCount = state.members.filter((member) => member.status === 'late').length;

  return (
    <div className={`page ${isActive ? 'active' : ''}`}>
      <div className="alert-banner">
        <div className="pulse-dot" />
        <div>
          {state.committees.length} {t(language, 'activeCommittees')} — {state.members.length} {t(language, 'totalMembers').toLowerCase()}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label"><i className="bi bi-people me-1" />{t(language, 'totalMembers')}</div>
          <div className="stat-val c-text">{state.members.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><i className="bi bi-collection me-1" />{t(language, 'collected')}</div>
          <div className="stat-val c-green">{formatRs(totalCollected)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><i className="bi bi-hourglass me-1" />{t(language, 'pending')}</div>
          <div className="stat-val c-warn">{formatRs(totalPending)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><i className="bi bi-journal-check me-1" />{t(language, 'paymentCount')}</div>
          <div className="stat-val c-text">{state.payments.filter((p) => p.type === 'paid').length}/{state.payments.length}</div>
        </div>
      </div>

      <div className="report-strip">
        <div><span>{t(language, 'collectionRate')}</span><strong>{collectionRate}%</strong></div>
        <div><span>{t(language, 'lateMembers')}</span><strong className={lateCount ? 'report-warn' : ''}>{lateCount}</strong></div>
        <div><span>{t(language, 'pendingTotal')}</span><strong>{formatRs(totalPending)}</strong></div>
      </div>

      {state.committees.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-people" />
          <p>{t(language, 'noCommittee')}</p>
          <button className="btn-submit empty-action" onClick={() => openModal('newKametiModal')}>{t(language, 'createCommittee')}</button>
        </div>
      ) : (
        state.committees.map((committee) => {
          const members = state.members.filter((member) => member.committeeId === committee.id);
          const paidCount = members.filter((member) => member.status === 'paid').length;
          const percent = members.length ? Math.round((paidCount / members.length) * 100) : 0;
          const collected = state.payments.filter((p) => p.committeeId === committee.id && p.type === 'paid').reduce((sum, p) => sum + p.amount, 0);
          const fillClass = percent < 50 ? 'warn-fill' : '';
          const lastWinnerEntry = committee.winnersHistory?.at(-1);
          const lastWinnerId = typeof lastWinnerEntry === 'object' ? lastWinnerEntry.memberId : lastWinnerEntry;
          const lastWinner = members.find((member) => member.id === lastWinnerId);

          return (
            <div key={committee.id} className="committee-card">
              <div className="comm-head">
                <div>
                  <div className="comm-title" onClick={() => { setSelectedCommittee(committee); openModal('kametiDetailModal'); }} style={{ cursor: 'pointer' }}>
                    {committee.name}
                  </div>
                  <div className="comm-meta">{t(language, committee.frequency === 'daily' ? 'daily' : 'monthly')} · {formatRs(committee.monthlyAmount)}/member · {committee.totalMembers} {t(language, 'members').toLowerCase()}</div>
                </div>
                <span className="badge badge-month">Month {committee.currentMonth}/{committee.totalMembers}</span>
              </div>

              <div className="prog-wrap">
                <div className="prog-bg">
                  <div className={`prog-fill ${fillClass}`} style={{ width: `${percent}%` }} />
                </div>
                <div className="prog-meta">
                  <span>{formatRs(collected)} collected</span>
                  <span>{percent}% paid</span>
                </div>
              </div>

              <div className="app-divider" />
              <div className="sec-label">{t(language, 'paymentLog')}</div>

              {lastWinner && (
                <div className="winner-note">
                  <i className="bi bi-trophy-fill" />
                  <span>{t(language, 'latestWinner')}: <strong>{lastWinner.name}</strong></span>
                </div>
              )}

              {members.map((member) => {
                const statusIcon = member.status === 'paid' ? 'bi-check-circle-fill' : member.status === 'late' ? 'bi-x-circle-fill' : 'bi-hourglass-split';
                const statusClass = member.status === 'paid' ? 's-paid' : member.status === 'late' ? 's-late' : 's-pending';
                    const statusText = member.status === 'paid' ? `Paid · ${formatRs(committee.monthlyAmount)}` : member.status === 'late' ? 'Late' : 'Pending';

                return (
                  <div key={member.id} className="member-row">
                    <div className="mem-left">
                      <div className="mem-avatar" style={{ background: member.color || COLORS[member.id % COLORS.length] }}>
                        {initials(member.name)}
                      </div>
                      <div>
                        <div className="mem-name">{member.name}</div>
                        <div className="mem-sub">Member #{member.turn}</div>
                      </div>
                    </div>
                    <span className={`mem-status ${statusClass}`} onClick={() => { setSelectedMember(member); openModal('memberDetailModal'); }}>
                      <i className={`bi ${statusIcon} me-1`} />
                      {statusText}
                    </span>
                  </div>
                );
              })}

              <div className="action-row">
                    <button className="btn-ghost" onClick={() => setCurrentPage('payments')}><i className="bi bi-journal-text me-1" />{t(language, 'paymentLog')}</button>
                    <button className="btn-ghost" onClick={() => { setSelectedCommittee(committee); openModal('kametiDetailModal'); }}><i className="bi bi-info-circle me-1" />{t(language, 'details')}</button>
                    <button className="btn-ghost btn-shuffle" onClick={() => shuffleWinner(committee.id)}><i className="bi bi-shuffle me-1" />{t(language, 'draw')}</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default DashboardPage;
