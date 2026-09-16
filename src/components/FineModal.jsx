import { useEffect, useState } from 'react';
import { t } from '../i18n';

const FineModal = ({ open, committees, members, language, onClose, onApply }) => {
  const [committeeId, setCommitteeId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const availableMembers = members.filter((member) => member.committeeId === Number(committeeId) && member.status !== 'paid');

  useEffect(() => {
    if (open) {
      setCommitteeId(committees[0] ? String(committees[0].id) : '');
      setMemberId('');
      setAmount('');
      setReason('');
    }
  }, [open, committees]);

  const submit = (event) => {
    event.preventDefault();
    if (!memberId || !amount || Number(amount) < 1) return;
    onApply(Number(memberId), Number(amount), reason.trim());
    onClose();
  };

  return (
    <div className={`modal-overlay ${open ? 'open' : ''}`} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="modal-handle" />
        <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        <div className="modal-title">{t(language, 'fine')}</div>
        <form onSubmit={submit}>
          <div className="form-group"><label className="form-label">{t(language, 'committee')}</label><select className="form-input" value={committeeId} onChange={(event) => { setCommitteeId(event.target.value); setMemberId(''); }}><option value="">{t(language, 'selectCommittee')}</option>{committees.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
          <div className="form-group"><label className="form-label">{t(language, 'members')}</label><select className="form-input" value={memberId} onChange={(event) => setMemberId(event.target.value)}><option value="">{t(language, 'selectMember')}</option>{availableMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></div>
          <div className="form-group"><label className="form-label">{language === 'ur' ? 'Fine ki Raqam (Rs)' : 'Fine Amount (Rs)'}</label><input className="form-input" type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="100" /></div>
          <div className="form-group"><label className="form-label">{language === 'ur' ? 'Wajah' : 'Reason'}</label><input className="form-input" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Late payment etc." /></div>
          <button className="btn-submit" type="submit"><i className="bi bi-exclamation-triangle me-2" />{language === 'ur' ? 'Fine Apply Karein' : 'Apply Fine'}</button>
        </form>
      </div>
    </div>
  );
};

export default FineModal;
