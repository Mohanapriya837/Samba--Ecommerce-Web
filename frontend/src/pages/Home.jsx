import { Link } from 'react-router-dom';
import * as booksApi from '../api/books';
import * as categoriesApi from '../api/categories';
import useFetch from '../hooks/useFetch';
import BookCard from '../components/BookCard';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const stages = [
  { tag:'01', title:'Pre-KG → 5', text:'ABC, numbers, stories, songs and colourful foundations.', icon:'✦' },
  { tag:'02', title:'Classes 6 → 10', text:'Chapter-wise lessons, revision and focused study notes.', icon:'◈' },
  { tag:'03', title:'Classes 11 → 12', text:'Syllabus-focused learning for serious exam preparation.', icon:'◎' }
];

export default function Home() {
  const cats = useFetch(() => categoriesApi.listCategories(), []);
  const latest = useFetch(() => booksApi.listBooks({ page:0, size:6, sortBy:'createdAt', direction:'desc' }), []);
  return <>
    <section className="samba-hero"><div className="hero-glow one"/><div className="hero-glow two"/><div className="container samba-hero-inner"><div className="hero-copy"><span className="eyebrow">SAMBA · LEARN · READ · GROW</span><h1>One book.<br/><span>Many ways to learn.</span></h1><p>Buy the right books, unlock video lessons and download study notes — all from one learning space built for students.</p><div className="hero-actions"><Link to="/books" className="btn btn-primary btn-lg">Explore learning library →</Link><Link to="/register" className="hero-text-link">Create a free account</Link></div></div><div className="hero-visual"><div className="floating-card card-video"><b>▶</b><span>Video lesson</span><small>Learn chapter by chapter</small></div><div className="floating-card card-note"><b>PDF</b><span>Study notes</span><small>Download & revise</small></div><div className="hero-orbit"><div className="hero-book">S</div></div></div></div></section>
    <section className="container stage-section"><div className="section-kicker">LEARNING FOR EVERY STAGE</div><h2>From first letters to final exams.</h2><div className="stage-grid">{stages.map(s=><div className="stage-card" key={s.tag}><span>{s.tag}</span><b>{s.icon}</b><h3>{s.title}</h3><p>{s.text}</p><Link to="/books">Explore →</Link></div>)}</div></section>
    <section className="learning-banner"><div className="container banner-inner"><div><span className="eyebrow">YOUR PERSONAL CLASSROOM</span><h2>Purchase once. Learn beyond the page.</h2><p>Every purchased book can become a learning hub for its videos, chapters and notes.</p></div><Link to="/learning" className="btn btn-dark btn-lg">Open My Learning</Link></div></section>
    <section className="container section"><div className="section-head modern-head"><div><span className="section-kicker">FIND YOUR SUBJECT</span><h2>Start with what you need.</h2></div><Link to="/books">View all books →</Link></div>{cats.loading?<Loader/>:cats.error?<Alert>{cats.error}</Alert>:<div className="subject-grid">{cats.data.map(c=><Link className="subject-card" key={c.id} to={`/books?categoryId=${c.id}`}><span>{c.name.slice(0,1)}</span><div><strong>{c.name}</strong><small>{c.description}</small></div><b>↗</b></Link>)}</div>}</section>
    <section className="container section"><div className="section-head modern-head"><div><span className="section-kicker">NEW IN SAMBA</span><h2>Learning materials worth opening.</h2></div><Link to="/books">Browse catalogue →</Link></div>{latest.loading?<Loader/>:latest.error?<Alert>{latest.error}</Alert>:<div className="book-grid modern-book-grid">{latest.data.content.map(b=><BookCard key={b.id} book={b}/>)}</div>}</section>
    <section className="container samba-trust"><div><b>01</b><strong>Books delivered home</strong><span>Track every order.</span></div><div><b>02</b><strong>Video learning</strong><span>Watch after purchase.</span></div><div><b>03</b><strong>Notes & revision</strong><span>Keep study material close.</span></div></section>
  </>;
}
