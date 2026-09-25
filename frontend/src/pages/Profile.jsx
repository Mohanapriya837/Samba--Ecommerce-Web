import { useState } from 'react';
import * as usersApi from '../api/users';
import { getErrorMessage, getFieldErrors } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Field from '../components/Field';
import Alert from '../components/Alert';
import { isPhone, isStrongPassword, PASSWORD_HINT } from '../utils/validators';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ fullName: user.fullName, phone: user.phone || '', address: user.address || '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwApiError, setPwApiError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.fullName.trim()) v.fullName = 'Full name is required';
    if (form.phone && !isPhone(form.phone)) v.phone = 'Enter a valid phone number';
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    setApiError('');
    try {
      updateUser(await usersApi.updateMe({ ...form, phone: form.phone || null, address: form.address || null }));
      toast.success('Profile updated');
    } catch (err) {
      setErrors(getFieldErrors(err));
      setApiError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    const v = {};
    if (!pw.currentPassword) v.currentPassword = 'Current password is required';
    if (!isStrongPassword(pw.newPassword)) v.newPassword = 'Password must be at least 8 characters and include a letter and a number';
    if (pw.confirm !== pw.newPassword) v.confirm = 'Passwords do not match';
    setPwErrors(v);
    if (Object.keys(v).length) return;
    setPwSaving(true);
    setPwApiError('');
    try {
      await usersApi.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwErrors(getFieldErrors(err));
      setPwApiError(getErrorMessage(err));
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="container section">
      <h1>My profile</h1>
      <div className="two-col">
        <form className="card" onSubmit={saveProfile} noValidate>
          <h3>Personal details</h3>
          <Alert>{apiError}</Alert>
          <Field label="Email" id="email"><input id="email" value={user.email} disabled /></Field>
          <Field label="Full name *" id="fullName" error={errors.fullName}>
            <input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </Field>
          <Field label="Phone" id="phone" error={errors.phone}>
            <input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Address" id="address" error={errors.address}>
            <textarea id="address" rows="3" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </form>

        <form className="card" onSubmit={savePassword} noValidate>
          <h3>Change password</h3>
          <Alert>{pwApiError}</Alert>
          <Field label="Current password" id="currentPassword" error={pwErrors.currentPassword}>
            <input id="currentPassword" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </Field>
          <Field label="New password" id="newPassword" error={pwErrors.newPassword} hint={PASSWORD_HINT}>
            <input id="newPassword" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </Field>
          <Field label="Confirm new password" id="confirm" error={pwErrors.confirm}>
            <input id="confirm" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </Field>
          <button className="btn btn-primary" disabled={pwSaving}>{pwSaving ? 'Updating…' : 'Update password'}</button>
        </form>
      </div>
    </div>
  );
}
