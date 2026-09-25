import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import { isEmail } from '../utils/validators';
import { postLoginTarget } from '../utils/nav';
import Field from '../components/Field';
import Alert from '../components/Alert';

export default function Login() {
  const { user, login, sessionExpired } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={postLoginTarget(user, location.state?.from)} replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!isEmail(form.email)) v.email = 'Enter a valid email address';
    if (!form.password) v.password = 'Password is required';
    setErrors(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    setApiError('');
    try {
      await login(form.email, form.password);
    } catch (err) {
      setApiError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={onSubmit} noValidate>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to continue shopping.</p>
        {sessionExpired && <Alert type="info">Your session expired. Please sign in again.</Alert>}
        <Alert>{apiError}</Alert>
        <Field label="Email" id="email" error={errors.email}>
          <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} />
        </Field>
        <Field label="Password" id="password" error={errors.password}>
          <input id="password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={onChange} />
        </Field>
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        <p className="auth-alt">New to Samba? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
