import { useState } from 'react';
import { COLORS, initials } from '../utils';
import { t } from '../i18n';

const MembersPage = ({ state, language, getCommittee, setFilter, setSelectedMember, openModal, isActive = true }) => {
  const [search, setSearch] = useState('');
  const members = state.members.filter((member) => {
    const committee = getCommittee(member.committeeId);
    return `${member.name} ${committee?.name || ''}`.toLowerCase().includes(search.toLowerCase())
      && (state.filters.member === 'all' || member.status === state.filters.member);
  });

  return (
  <div className={`page ${isActive ? 'active' : ''}`}>
    <div className="section-title">
      <span>{t(language, 'members')}</span>
      <a onClick={() => openModal('addMemberModal')}>{t(language, 'add')}</a>
    </div>

    <div className="search-bar">
      <i className="bi bi-search" />
      <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t(language, 'searchMember')} />
    </div>

    <div className="chip-row">
      {['all', 'paid', 'pending', 'late'].map((filter) => (
        <button
          key={filter}
          className={`chip ${state.filters.member === filter ? 'active' : ''}`}
          onClick={() => setFilter('member', filter)}
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
        </button>
      ))}
    </div>

    <div>
      {members.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-person-x" />
          <p>{t(language, 'noMember')}</p>
        </div>
      ) : (
        members.map((member) => {
            const committee = getCommittee(member.committeeId);
            return (
              <div key={member.id} className="member-card" onClick={() => { setSelectedMember(member); openModal('memberDetailModal'); }}>
                <div className="mc-avatar" style={{ background: member.color || COLORS[member.id % COLORS.length] }}>
                  {initials(member.name)}
                </div>
                <div className="mc-info">
                  <div className="mc-name">{member.name}</div>
                  <div className="mc-sub">Member #{member.turn} · {committee?.name || '—'}</div>
                </div>
                <span className="mc-badge badge-active">{member.status}</span>
              </div>
            );
          })
      )}
    </div>
  </div>
  );
};

export default MembersPage;
