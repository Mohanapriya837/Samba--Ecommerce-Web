import { useMemo, useState } from 'react';
import * as learningApi from '../api/learning';
import useFetch from '../hooks/useFetch';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import { formatPrice } from '../utils/format';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../api/client';

function youtubeEmbed(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (u.pathname.startsWith('/embed/')) return url;
    }
  } catch {}
  return null;
}

function VideoCard({ item, onBuy, buying }) {
  const embed = item.purchased && item.type === 'VIDEO' ? youtubeEmbed(item.url) : null;
  return (
    <article className={`learning-product ${item.purchased ? 'is-owned' : 'is-locked'}`}>
      <div className="learning-product-media">
        {item.purchased && item.type === 'VIDEO' && embed ? (
          <iframe src={embed} title={item.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
        ) : item.purchased && item.type === 'VIDEO' ? (
          <video src={item.url} controls playsInline />
        ) : (
          <div className="locked-media"><span>🔒</span><strong>{item.type === 'VIDEO' ? 'Video lesson' : 'Study notes'}</strong><small>Purchase to unlock</small></div>
        )}
      </div>
      <div className="learning-product-body">
        <div className="lesson-meta"><span>{item.type === 'VIDEO' ? 'VIDEO LESSON' : 'NOTES / PDF'}</span>{item.duration && <span>{item.duration}</span>}</div>
        <h3>{item.title}</h3>
        <p>{item.chapter || item.bookTitle}</p>
        {item.description && <div className="lesson-description">{item.description}</div>}
        {item.purchased ? (
          <span className="owned-badge">✓ Purchased — Watch / Download</span>
        ) : (
          <div className="purchase-row">
            <strong>{formatPrice(item.price)}</strong>
            <button className="btn btn-primary" disabled={buying === item.id} onClick={() => onBuy(item.id)}>
              {buying === item.id ? 'Purchasing…' : 'Buy lesson'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Learning() {
  const [tab, setTab] = useState('explore');
  const [buying, setBuying] = useState(null);
  const toast = useToast();
  const catalogData = useFetch(() => learningApi.catalog(), []);
  const purchasedData = useFetch(() => learningApi.purchased(), []);

  const purchasedIds = useMemo(() => new Set((purchasedData.data || []).map(x => x.id)), [purchasedData.data]);
  const purchasedItems = (purchasedData.data || []).map(x => ({ ...x, purchased: true }));
  const catalogue = (catalogData.data || []).map(x => ({ ...x, purchased: purchasedIds.has(x.id) }));

  const buy = async (id) => {
    setBuying(id);
    try {
      await learningApi.purchase(id, 'ONLINE');
      toast.success('Video purchased successfully. It is now in My Learning.');
      await Promise.all([catalogData.reload(), purchasedData.reload()]);
      setTab('purchased');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBuying(null);
    }
  };

  const loading = catalogData.loading || purchasedData.loading;
  return (
    <div className="learning-page">
      <section className="learning-hero">
        <div>
          <span className="eyebrow">SAMBA DIGITAL LEARNING</span>
          <h1>Buy lessons separately. Learn anywhere.</h1>
          <p>Your physical books and digital lessons are separate purchases. Books are delivered to your doorstep; video lessons unlock instantly after digital purchase.</p>
          <div className="learning-commerce-pills"><span>📦 Books → Doorstep delivery</span><span>▶ Videos → Instant access</span><span>📄 Notes → Digital access</span></div>
        </div>
        <div className="learning-hero-art">▶</div>
      </section>

      <div className="learning-tabs">
        <button className={tab === 'explore' ? 'active' : ''} onClick={() => setTab('explore')}>Explore lessons</button>
        <button className={tab === 'purchased' ? 'active' : ''} onClick={() => setTab('purchased')}>My purchased lessons <b>{purchasedItems.length}</b></button>
      </div>

      {loading ? <Loader /> : catalogData.error ? <Alert>{catalogData.error}</Alert> :
        tab === 'purchased' ? (
          purchasedItems.length ? <div className="learning-product-grid">{purchasedItems.map(item => <VideoCard key={item.id} item={item} onBuy={buy} buying={buying} />)}</div> :
          <div className="learning-empty"><div className="empty-orb">▶</div><h2>No digital lessons yet</h2><p>Explore the lesson catalogue and purchase a video or notes package.</p><button className="btn btn-primary" onClick={() => setTab('explore')}>Explore lessons</button></div>
        ) : (
          catalogue.length ? <div className="learning-product-grid">{catalogue.map(item => <VideoCard key={item.id} item={item} onBuy={buy} buying={buying} />)}</div> :
          <div className="learning-empty"><h2>No lessons published yet</h2><p>Admin can publish videos and notes from Admin → Learning.</p></div>
        )}
    </div>
  );
}
