import { useEffect, useMemo, useState } from 'react';
import { initials } from '../utils';
import { t } from '../i18n';

const QuranAndaziModal = ({ open, committees, members, language, onClose, onDraw }) => {
  const [committeeId, setCommitteeId] = useState('');
  const [winner, setWinner] = useState(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    if (open) {
      setCommitteeId(committees[0] ? String(committees[0].id) : '');
      setWinner(null);
      setDrawing(false);
    }
  }, [open, committees]);

  const committee = committees.find((item) => item.id === Number(committeeId));
  const committeeMembers = members.filter((member) => member.committeeId === Number(committeeId));
  const wonIds = new Set((committee?.winnersHistory || []).map((entry) => typeof entry === 'object' ? entry.memberId : entry));
  const eligible = useMemo(() => committeeMembers.filter((member) => !wonIds.has(member.id)), [committeeMembers, committee]);

  const drawWinner = () => {
    if (!eligible.length || drawing) return;
    setDrawing(true);
    window.setTimeout(() => {
      const selected = eligible[Math.floor(Math.random() * eligible.length)];
      setWinner(selected);
      onDraw(Number(committeeId), selected);
      setDrawing(false);
    }, 900);
  };

  return (
    <div className={`modal-overlay ${open ? 'open' : ''}`} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="modal-handle" />
        <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        <div className="modal-title">{t(language, 'draw')}</div>
        <div className="form-group">
          <label className="form-label">{t(language, 'selectCommittee')}</label>
          <select className="form-input" value={committeeId} onChange={(event) => { setCommitteeId(event.target.value); setWinner(null); }}>
            <option value="">{t(language, 'selectCommittee')}</option>
            {committees.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        {committee && (
          <>
            <div className="draw-meta"><strong>{eligible.length}</strong> {language === 'ur' ? 'eligible members' : 'eligible members'} · {(committee.winnersHistory || []).length} {language === 'ur' ? 'previous winners' : 'previous winners'}</div>
            <div className="draw-cards">
              {eligible.length ? eligible.map((member) => (
                <div key={member.id} className={`draw-card ${drawing ? 'spinning' : ''} ${winner?.id === member.id ? 'winner' : ''}`}>
                  {initials(member.name)}
                  <small>{member.name.split(' ')[0]}</small>
                </div>
              )) : <div className="draw-empty">{language === 'ur' ? 'Tamam members draw ho chuke hain.' : 'All members have already won.'}</div>}
            </div>
            <button className="draw-button" disabled={!eligible.length || drawing} onClick={drawWinner}>
              <i className={`bi ${drawing ? 'bi-hourglass-split' : 'bi-shuffle'} me-2`} />
              {drawing ? (language === 'ur' ? 'Draw ho raha hai...' : 'Drawing...') : winner ? (language === 'ur' ? 'Dubara Draw Karein' : 'Draw Again') : (language === 'ur' ? 'Draw Karein' : 'Draw Now')}
            </button>
            {winner && <div className="draw-result"><span>🏆</span><small>{language === 'ur' ? 'Is Maah Ka Winner' : "This Month's Winner"}</small><strong>{winner.name}</strong><em>{committee.name} · Member #{winner.turn}</em></div>}
          </>
        )}
      </div>
    </div>
  );
};

export default QuranAndaziModal;
