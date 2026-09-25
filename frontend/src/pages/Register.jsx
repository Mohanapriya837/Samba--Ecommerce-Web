import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, getFieldErrors, isConflictError } from '../api/client';
import { isEmail, isPhone, isStrongPassword, PASSWORD_HINT } from '../utils/validators';
import { homeFor } from '../utils/nav';
import Field from '../components/Field';
import Alert from '../components/Alert';

export default function Register() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', address: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={homeFor(user)} replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const v = {};
    if (!form.fullName.trim()) v.fullName = 'Full name is required';
    if (!isEmail(form.email)) v.email = 'Enter a valid email address';
    if (form.phone && !isPhone(form.phone)) v.phone = 'Enter a valid phone number';
    if (!isStrongPassword(form.password)) v.password = 'Password must be at least 8 characters and include a letter and a number';
    if (form.confirmPassword !== form.password) v.confirmPassword = 'Passwords do not match';
    return v;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    setApiError('');
    try {
      const { confirmPassword, ...payload } = form;
      await register({ ...payload, phone: payload.phone || null, address: payload.address || null });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      setErrors(isConflictError(err) ? { ...fieldErrors, email: getErrorMessage(err) } : fieldErrors);
      setApiError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card auth-card-wide" onSubmit={onSubmit} noValidate>
        <h1>Create your account</h1>
        <p className="muted">Join Samba to start ordering books.</p>
        <Alert>{apiError}</Alert>
        <div className="form-grid">
          <Field label="Full name *" id="fullName" error={errors.fullName}>
            <input id="fullName" name="fullName" value={form.fullName} onChange={onChange} autoComplete="name" />
          </Field>
          <Field label="Email *" id="email" error={errors.email}>
            <input id="email" name="email" type="email" value={form.email} onChange={onChange} autoComplete="email" />
          </Field>
          <Field label="Phone" id="phone" error={errors.phone}>
            <input id="phone" name="phone" value={form.phone} onChange={onChange} autoComplete="tel" />
          </Field>
          <Field label="Address" id="address" error={errors.address}>
            <input id="address" name="address" value={form.address} onChange={onChange} autoComplete="street-address" />
          </Field>
          <Field label="Password *" id="password" error={errors.password} hint={PASSWORD_HINT}>
            <input id="password" name="password" type="password" value={form.password} onChange={onChange} autoComplete="new-password" />
          </Field>
          <Field label="Confirm password *" id="confirmPassword" error={errors.confirmPassword}>
            <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={onChange} autoComplete="new-password" />
          </Field>
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
        <p className="auth-alt">Already registered? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
