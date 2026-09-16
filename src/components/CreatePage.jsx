import { t } from '../i18n';

const CreatePage = ({ openModal, language, isActive = true }) => (
  <div className={`page ${isActive ? 'active' : ''}`}>
    <div className="section-title">{t(language, 'createNew')}</div>
    <div className="create-option" onClick={() => openModal('newKametiModal')}>
      <div className="create-icon"><i className="bi bi-people-fill" /></div>
      <div className="create-info">
        <h6>{t(language, 'createCommittee')}</h6>
        <p>{t(language, 'createCommitteeSub')}</p>
      </div>
      <i className="bi bi-chevron-right" />
    </div>
    <div className="create-option" onClick={() => openModal('addMemberModal')}>
      <div className="create-icon"><i className="bi bi-person-plus-fill" /></div>
      <div className="create-info">
        <h6>{t(language, 'addMember')}</h6>
        <p>{t(language, 'addMemberSub')}</p>
      </div>
      <i className="bi bi-chevron-right" />
    </div>
    <div className="create-option" onClick={() => openModal('recordPaymentModal')}>
      <div className="create-icon"><i className="bi bi-cash-stack" /></div>
      <div className="create-info">
        <h6>{t(language, 'recordPayment')}</h6>
        <p>{t(language, 'recordPaymentSub')}</p>
      </div>
      <i className="bi bi-chevron-right" />
    </div>
    <div className="create-option" onClick={() => openModal('fineModal')}>
      <div className="create-icon fine-icon"><i className="bi bi-exclamation-triangle-fill" /></div>
      <div className="create-info"><h6>{t(language, 'fine')}</h6><p>{t(language, 'fineSub')}</p></div>
      <i className="bi bi-chevron-right" />
    </div>
    <div className="create-option" onClick={() => openModal('quranAndaziModal')}>
      <div className="create-icon draw-icon"><i className="bi bi-shuffle" /></div>
      <div className="create-info"><h6>{t(language, 'draw')}</h6><p>{t(language, 'drawSub')}</p></div>
      <i className="bi bi-chevron-right" />
    </div>
  </div>
);

export default CreatePage;
