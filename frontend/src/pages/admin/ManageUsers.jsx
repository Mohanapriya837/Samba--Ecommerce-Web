import { useState } from 'react';
import * as adminApi from '../../api/admin';
import { getErrorMessage } from '../../api/client';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { formatDate } from '../../utils/format';

export default function ManageUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [kw, setKw] = useState('');
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const keyword = useDebounce(kw);
  const { data, loading, error, reload } = useFetch(() => adminApi.listUsers({ keyword, page, size: 10 }), [keyword, page]);

  const toggle = async (u) => {
    setBusyId(u.id);
    try {
      await adminApi.setUserEnabled(u.id, !u.enabled);
      toast.success(`${u.fullName} ${u.enabled ? 'disabled' : 'enabled'}`);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <h1>Users</h1>
      <div className="toolbar">
        <input type="search" placeholder="Search name or email…" value={kw} onChange={(e) => { setKw(e.target.value); setPage(0); }} />
      </div>
      {loading && !data ? <Loader /> : error ? <Alert>{error}</Alert> : data.content.length === 0 ? (
        <EmptyState icon="👥" title="No users found" />
      ) : (
        <>
          <div className="card table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th /></tr></thead>
              <tbody>
                {data.content.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.fullName}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td><span className={u.role === 'ADMIN' ? 'badge badge-shipped' : 'badge badge-confirmed'}>{u.role}</span></td>
                    <td><span className={u.enabled ? 'badge badge-delivered' : 'badge badge-cancelled'}>{u.enabled ? 'Active' : 'Disabled'}</span></td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <button className={u.enabled ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'} disabled={busyId === u.id || u.id === me.id} onClick={() => toggle(u)}>
                        {u.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </>
  );
}
