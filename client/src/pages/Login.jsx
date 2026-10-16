import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from || '/';
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrors({}); setFormError('');
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
      navigate(from, { replace: true });
    } catch (err) {
      setErrors(err.errors || {});
      setFormError(err.message);
      setBusy(false);
    }
  };

  const field = (key, label, props = {}) => (
    <div>
      <label htmlFor={key} className="text-xs font-semibold text-rust">{label}</label>
      <input id={key} value={form[key]} onChange={set(key)} required aria-invalid={!!errors[key]}
        className={`input mt-1 ${errors[key] ? 'input-error' : ''}`} {...props} />
      {errors[key] && <p className="mt-1 text-xs text-brand">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="page max-w-md">
      <div className="card p-8">
        <h1 className="text-2xl font-extrabold">{mode === 'login' ? 'Log in to Orderly' : 'Create your account'}</h1>
        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          {mode === 'register' && field('name', 'Full name', { autoComplete: 'name' })}
          {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
          {field('password', 'Password', { type: 'password', autoComplete: mode === 'login' ? 'current-password' : 'new-password' })}
          {formError && <p className="text-sm text-brand" role="alert">{formError}</p>}
          <button disabled={busy} className="btn-primary w-full">{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
        </form>
        <p className="mt-5 text-center text-sm text-maroon/70">
          {mode === 'login' ? 'New to Orderly? ' : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); setFormError(''); }} className="font-semibold text-brand">
            {mode === 'login' ? 'Create an account' : 'Log in'}
          </button>
        </p>
        <p className="mt-4 rounded-md bg-sand p-3 text-xs text-maroon/70">Demo account: demo@orderly.ph / demo1234 (after running the seed script).</p>
      </div>
    </div>
  );
}
