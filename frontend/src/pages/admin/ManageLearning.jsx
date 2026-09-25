import { useState } from 'react';
import * as adminApi from '../../api/admin';
import * as booksApi from '../../api/books';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';

const empty = { bookId: '', type: 'VIDEO', title: '', chapter: '', description: '', url: '', thumbnailUrl: '', duration: '', price: '49', active: true };
export default function ManageLearning() {
  const toast = useToast(); const [form, setForm] = useState(empty); const [saving, setSaving] = useState(false);
  const content = useFetch(() => adminApi.listLearningContent(), []);
  const books = useFetch(() => booksApi.listBooks({ page: 0, size: 100, sortBy: 'title', direction: 'asc' }), []);
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const save = async e => { e.preventDefault(); setSaving(true); try { await adminApi.createLearningContent({
  ...form,
  bookId: Number(form.bookId),
  price: Number(form.price)
}); toast.success('Learning content added'); setForm(empty); content.reload(); } catch(err){toast.error(getErrorMessage(err));} finally{setSaving(false);} };
  const remove = async id => { if(!confirm('Delete this learning content?')) return; try{await adminApi.deleteLearningContent(id); toast.success('Content deleted'); content.reload();}catch(err){toast.error(getErrorMessage(err));} };
  return <div className="learning-admin"><div className="admin-page-hero"><div><span className="eyebrow">CONTENT STUDIO</span><h1>Learning content</h1><p>Add videos and downloadable notes to the books students purchase.</p></div><div className="studio-badge">VIDEO + NOTES</div></div>
    <div className="content-admin-grid"><form className="card content-form" onSubmit={save}><h2>Add lesson</h2><label>Book<select required value={form.bookId} onChange={e=>set('bookId',e.target.value)}><option value="">Select book</option>{(books.data?.content||[]).map(b=><option key={b.id} value={b.id}>{b.title}</option>)}</select></label><label>Type<select value={form.type} onChange={e=>set('type',e.target.value)}><option value="VIDEO">Video</option><option value="NOTE">Note / PDF</option></select></label><label>Title<input required value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Chapter 1 — Introduction" /></label><label>Chapter<input value={form.chapter} onChange={e=>set('chapter',e.target.value)} placeholder="e.g. Chapter 1" /></label><label>Video / file URL<input required value={form.url} onChange={e=>set('url',e.target.value)} placeholder="YouTube URL or direct MP4/PDF URL" /></label><label>Description<textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="What will the student learn?" /></label><label>Duration<input value={form.duration} onChange={e=>set('duration',e.target.value)} placeholder="12 min" /></label><label>Digital purchase price<input required type="number" min="0" step="0.01" value={form.price} onChange={e=>set('price',e.target.value)} placeholder="49" /></label><button className="btn btn-primary btn-lg" disabled={saving}>{saving?'Adding…':'Add to learning library'}</button></form>
      <section><div className="content-list-head"><h2>Published content</h2><span>{content.data?.length||0} items</span></div>{content.loading?<p>Loading…</p>:content.error?<p>{content.error}</p>:<div className="content-admin-list">{(content.data||[]).map(c=><article className="content-admin-card" key={c.id}><div className={`content-admin-icon ${c.type.toLowerCase()}`}>{c.type==='VIDEO'?'▶':'PDF'}</div><div><span className="content-type">{c.type}</span><h3>{c.title}</h3><p>{c.bookTitle}{c.chapter?` · ${c.chapter}`:''}</p><small>{c.url}</small></div><button className="btn btn-danger btn-sm" onClick={()=>remove(c.id)}>Delete</button></article>)}</div>}</section>
    </div>
  </div>;
}
