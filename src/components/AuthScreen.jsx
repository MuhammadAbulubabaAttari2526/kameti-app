import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import BrandMark from './BrandMark';

const AuthScreen = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));

  const getErrorMessage = (firebaseError) => {
    const messages = {
      'auth/invalid-credential': 'Email ya password ghalat hai.',
      'auth/email-already-in-use': 'Is email par account pehle se mojood hai.',
      'auth/weak-password': 'Password kam az kam 6 characters ka hona chahiye.',
      'auth/invalid-email': 'Valid email address daakhil karein.',
      'auth/popup-closed-by-user': 'Google sign-in band kar diya gaya.',
      'auth/operation-not-allowed': 'Firebase Console mein Google sign-in provider enable karein.',
      'auth/unauthorized-domain': 'Is domain ko Firebase Authentication ke Authorized domains mein add karein.',
    };
    return messages[firebaseError.code] || 'Authentication mein masla aa gaya. Dobara try karein.';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const credentials = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
        await updateProfile(credentials.user, { displayName: form.name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
      }
    } catch (firebaseError) {
      setError(getErrorMessage(firebaseError));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (firebaseError) {
      if (firebaseError.code === 'auth/popup-blocked' || firebaseError.code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      setError(getErrorMessage(firebaseError));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = window.prompt('Password reset ke liye email daakhil karein:', form.email);
    if (!email) return;
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setError('Password reset link email par bhej diya gaya hai.');
    } catch (firebaseError) {
      setError(getErrorMessage(firebaseError));
    }
  };

  return (
    <main className="auth-screen">
      <div className="auth-brand">
        <BrandMark />
        <h1>KametiApp</h1>
        <p>Digital Committee System</p>
      </div>

      <section className="auth-card">
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>Login</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(''); }}>Sign Up</button>
        </div>

        <h2>{mode === 'login' ? 'Khush Aamdeed' : 'Account Banayein'}</h2>
        <p className="auth-subtitle">{mode === 'login' ? 'Apne account mein login karein' : 'Bilkul muft, abhi shuru karein'}</p>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label className="auth-field">
              <span>Full Name</span>
              <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
            </label>
          )}
          <label className="auth-field">
            <span>Email Address</span>
            <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} required />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input type="password" minLength="6" value={form.password} onChange={(event) => updateField('password', event.target.value)} required />
          </label>

          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login Karein' : 'Account Banayein'}
          </button>
          {mode === 'login' && <button className="forgot-button" type="button" onClick={handleForgotPassword}>Password bhool gaye?</button>}
        </form>

        <div className="auth-divider">ya phir</div>
        <button className="google-submit" type="button" onClick={handleGoogleLogin} disabled={loading}>
          <span className="google-mark">G</span> Continue with Google
        </button>
      </section>
    </main>
  );
};

export default AuthScreen;
