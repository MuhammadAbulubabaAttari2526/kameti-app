import { useState } from 'react';
import { t } from '../i18n';
import BrandMark from './BrandMark';

const Topbar = ({ theme, toggleTheme, language, setLanguage, user, onLogout, onShuffle, onCreate }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
  <div className="topbar">
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <BrandMark compact />
      <div className="brand">
        <h6>KametiApp</h6>
        <span>{t(language, 'brandTagline')}</span>
      </div>
    </div>

    <div className="topbar-right">
      <div className="lang-toggle">
        <button className={language === 'ur' ? 'lang-active' : ''} onClick={() => setLanguage('ur')}>UR</button>
        <button className={language === 'en' ? 'lang-active' : ''} onClick={() => setLanguage('en')}>EN</button>
      </div>
      <button className="icon-btn" onClick={toggleTheme} id="themeBtn">
        <i className={`bi ${theme === 'dark' ? 'bi-moon-fill' : 'bi-sun-fill'}`} id="themeIcon" />
      </button>
      <div className="profile-wrap">
      <button className="user-btn" onClick={() => setMenuOpen((open) => !open)} title="Account menu">
        <span>{(user?.displayName || user?.email || 'U').slice(0, 1).toUpperCase()}</span>
        <i className="bi bi-chevron-down" />
      </button>
      {menuOpen && <div className="profile-menu">
        <div className="profile-heading"><strong>{user?.displayName || 'Kameti User'}</strong><small>{user?.email}</small></div>
        <button onClick={() => { onCreate(); setMenuOpen(false); }}><i className="bi bi-plus-circle" /> {t(language, 'createCommittee')}</button>
        <button onClick={() => { onShuffle(); setMenuOpen(false); }}><i className="bi bi-shuffle" /> {t(language, 'draw')}</button>
        <button className="profile-logout" onClick={() => { onLogout(); setMenuOpen(false); }}><i className="bi bi-box-arrow-right" /> Logout</button>
      </div>}
      </div>
      <button className="qa-topbar-btn" onClick={onShuffle} title="Quran Andazi"><i className="bi bi-shuffle" /></button>
    </div>
  </div>
  );
};

export default Topbar;
