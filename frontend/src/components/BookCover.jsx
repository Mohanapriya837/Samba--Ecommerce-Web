import { useState } from 'react';

const COLORS = ['#2b4c7e', '#8b3a3a', '#2f6f5e', '#6b4c9a', '#b5651d', '#3d5a80', '#556b2f'];

export default function BookCover({ id = 0, title, author, imageUrl, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (imageUrl && !failed) {
    return <img className={`cover ${className}`} src={imageUrl} alt={title} loading="lazy" onError={() => setFailed(true)} />;
  }
  return (
    <div className={`cover cover-fallback ${className}`} style={{ background: COLORS[Number(id) % COLORS.length] }} aria-label={title}>
      <span>{title}</span>
      {author && <small>{author}</small>}
    </div>
  );
}
