import { COLORS, formatRs, initials } from '../utils';
import { t } from '../i18n';

const PaymentsPage = ({ state, language, getCommittee, getMember, setFilter, setSelectedMember, openModal, sendWhatsApp, isActive = true }) => {
  const paymentGroups = state.payments
    .filter((payment) => state.filters.payment === 'all' || payment.type === state.filters.payment)
    .reduce((acc, payment) => {
      const key = payment.committeeId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(payment);
      return acc;
    }, {});

  return (
    <div className={`page ${isActive ? 'active' : ''}`}>
      <div className="section-title">
        <span>{t(language, 'payments')}</span>
        <a onClick={() => openModal('recordPaymentModal')}>{t(language, 'record')}</a>
      </div>

      <div className="chip-row">
        {['all', 'paid', 'pending', 'late'].map((filter) => (
          <button
            key={filter}
            className={`chip ${state.filters.payment === filter ? 'active' : ''}`}
            onClick={() => setFilter('payment', filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {Object.keys(paymentGroups).length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-cash-stack" />
          <p>{t(language, 'noPayments')}</p>
        </div>
      ) : (
        Object.entries(paymentGroups).map(([committeeId, items]) => {
          const committee = getCommittee(Number(committeeId));
          const groupTotal = items.filter((item) => item.type === 'paid').reduce((sum, item) => sum + item.amount, 0);
          return (
            <div key={committeeId} className="pay-group">
              <div className="pay-group-header">
                <div className="pay-group-left">
                  <div className="pay-group-dot" />
                  <div>
                    <div className="pay-group-name">{committee?.name || 'Unknown Committee'}</div>
                    <div className="pay-group-meta">{items.length} entries</div>
                  </div>
                </div>
                <div className="pay-group-total">{formatRs(groupTotal)}</div>
              </div>

              <div className="pay-group-items">
                {items.map((payment) => {
                  const member = getMember(payment.memberId);
                  const typeClass = payment.type === 'paid' ? 'pi-paid' : payment.type === 'late' ? 'pi-late' : 'pi-pending';
                  const icon = payment.type === 'paid' ? 'bi-check-circle-fill' : payment.type === 'late' ? 'bi-x-circle-fill' : 'bi-hourglass-split';

                  return (
                    <div key={payment.id} className={`pay-item ${typeClass}`}>
                        <div className="pi-left" onClick={() => { setSelectedMember(member); openModal('memberDetailModal'); }} style={{ cursor: 'pointer' }}>
                        <div className="pi-avatar" style={{ background: member?.color || '#334155' }}>
                          {member ? initials(member.name) : '?'}
                        </div>
                        <div>
                          <div className="pi-name">{member?.name || 'Unknown'}</div>
                          <div className="pi-sub">{payment.date}{payment.notes ? ` · ${payment.notes}` : ''}</div>
                        </div>
                      </div>

                          <div className="pi-right">
                        <div className="pi-amount">{formatRs(payment.amount)}</div>
                        <div className="pi-type">
                          <i className={`bi ${icon} me-1`} />
                          {payment.type}
                        </div>
                          {(payment.type === 'pending' || payment.type === 'late') && member?.phone && member.phone !== '—' && (
                            <button className="wa-button" onClick={(event) => { event.stopPropagation(); sendWhatsApp(member.id); }} title="WhatsApp reminder"><i className="bi bi-whatsapp" /></button>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default PaymentsPage;
