import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as booksApi from '../api/books';
import * as categoriesApi from '../api/categories';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import BookCard from '../components/BookCard';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

const SORTS = [
  { value: 'createdAt,desc', label: 'Newest first' },
  { value: 'title,asc', label: 'Title A–Z' },
  { value: 'price,asc', label: 'Price: low to high' },
  { value: 'price,desc', label: 'Price: high to low' },
  { value: 'author,asc', label: 'Author A–Z' },
];

export default function Books() {
  const [params, setParams] = useSearchParams();
  const keyword = params.get('keyword') || '';
  const categoryId = params.get('categoryId') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const sort = params.get('sort') || 'createdAt,desc';
  const page = Number(params.get('page') || 0);

  const [kw, setKw] = useState(keyword);
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);
  const debKw = useDebounce(kw);
  const debMin = useDebounce(min, 600);
  const debMax = useDebounce(max, 600);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v === '' || v === null || v === undefined ? next.delete(k) : next.set(k, v)));
    setParams(next);
  };

  useEffect(() => {
    if (debKw !== keyword) update({ keyword: debKw, page: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debKw]);
  useEffect(() => {
    if (debMin !== minPrice || debMax !== maxPrice) update({ minPrice: debMin, maxPrice: debMax, page: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debMin, debMax]);

  const cats = useFetch(() => categoriesApi.listCategories(), []);
  const [sortBy, direction] = sort.split(',');
  const books = useFetch(
    () => booksApi.listBooks({ keyword, categoryId, minPrice, maxPrice, page, size: 12, sortBy, direction }),
    [keyword, categoryId, minPrice, maxPrice, page, sort]
  );

  const clearAll = () => {
    setKw(''); setMin(''); setMax('');
    setParams(new URLSearchParams());
  };
  const hasFilters = keyword || categoryId || minPrice || maxPrice;

  return (
    <div className="container section">
      <h1>Browse books</h1>
      <div className="catalog">
        <aside className="filters card">
          <h3>Filters</h3>
          <label htmlFor="q">Search</label>
          <input id="q" type="search" placeholder="Title, author or ISBN" value={kw} onChange={(e) => setKw(e.target.value)} />

          <label htmlFor="cat">Category</label>
          <select id="cat" value={categoryId} onChange={(e) => update({ categoryId: e.target.value, page: '' })}>
            <option value="">All categories</option>
            {(cats.data || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <label>Price range</label>
          <div className="price-range">
            <input type="number" min="0" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} />
            <span>–</span>
            <input type="number" min="0" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} />
          </div>

          <label htmlFor="sort">Sort by</label>
          <select id="sort" value={sort} onChange={(e) => update({ sort: e.target.value, page: '' })}>
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {hasFilters && <button className="btn btn-outline btn-block" onClick={clearAll}>Clear filters</button>}
        </aside>

        <div>
          {books.loading && !books.data ? <Loader /> : books.error ? <Alert>{books.error}</Alert> : (
            <>
              <p className="muted result-count">
                {books.data.totalElements} {books.data.totalElements === 1 ? 'book' : 'books'} found
                {books.loading && ' · updating…'}
              </p>
              {books.data.content.length === 0 ? (
                <EmptyState icon="🔍" title="No books match your search" message="Try different keywords or clear the filters."
                  action={hasFilters && <button className="btn btn-primary" onClick={clearAll}>Clear filters</button>} />
              ) : (
                <div className="book-grid">{books.data.content.map((b) => <BookCard key={b.id} book={b} />)}</div>
              )}
              <Pagination page={books.data.page} totalPages={books.data.totalPages} onChange={(p) => update({ page: p || '' })} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
