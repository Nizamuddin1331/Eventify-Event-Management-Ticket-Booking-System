import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventsAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/common/EventCard';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['all','music','sports','tech','food','art','business','education','health','other'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'date', label: 'Upcoming' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function Events() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [wishlist, setWishlist] = useState(user?.wishlist?.map(e => e._id || e) || []);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    city: searchParams.get('city') || '',
    featured: searchParams.get('featured') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const [searchInput, setSearchInput] = useState(filters.search);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== null));
      const { data } = await eventsAPI.getAll({ ...params, limit: 12 });
      setEvents(data.events);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const updateFilter = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 };
    setFilters(updated);
    const params = Object.fromEntries(Object.entries(updated).filter(([, v]) => v !== '' && v !== 1));
    setSearchParams(params);
  };

  const handleSearch = (e) => { e.preventDefault(); updateFilter('search', searchInput); };
  const handlePage = (p) => setFilters(f => ({ ...f, page: p }));
  const clearFilters = () => {
    const reset = { search:'', category:'', sort:'newest', minPrice:'', maxPrice:'', city:'', featured:'', page:1 };
    setFilters(reset); setSearchInput(''); setSearchParams({});
  };

  const handleWishlist = async (eventId) => {
    if (!user) { toast.error('Please login to save events'); return; }
    try {
      const { data } = await authAPI.toggleWishlist(eventId);
      setWishlist(data.wishlist);
      toast.success(data.added ? '❤️ Saved to wishlist' : 'Removed from wishlist');
    } catch { toast.error('Failed to update wishlist'); }
  };

  const hasFilters = filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.city;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="page-title mb-1">Discover Events</h1>
          <p className="text-gray-500">{total > 0 ? `${total} events found` : 'Find amazing events near you'}</p>
          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-4 flex gap-3 max-w-2xl">
            <div className="relative flex-grow">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search events..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button type="submit" className="btn-primary">Search</button>
            {hasFilters && <button type="button" onClick={clearFilters} className="btn-secondary text-sm">Clear</button>}
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="card p-5 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Category</h3>
                <div className="space-y-1">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => updateFilter('category', cat === 'all' ? '' : cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${(cat === 'all' ? !filters.category : filters.category === cat) ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Price Range</h3>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} className="w-1/2 input-field py-2 text-sm" />
                  <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} className="w-1/2 input-field py-2 text-sm" />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {[['Free', 0, 0], ['Under ₹500', 0, 500], ['₹500-2k', 500, 2000], ['₹2k+', 2000, 50000]].map(([label, min, max]) => (
                    <button key={label} onClick={() => { updateFilter('minPrice', min); updateFilter('maxPrice', max || ''); }}
                      className="px-2.5 py-1 text-xs rounded-full border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">City</h3>
                <input type="text" placeholder="e.g. Hyderabad" value={filters.city} onChange={e => updateFilter('city', e.target.value)} className="input-field py-2 text-sm" />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.featured === 'true'} onChange={e => updateFilter('featured', e.target.checked ? 'true' : '')} className="w-4 h-4 text-indigo-600 rounded border-gray-300" />
                  <span className="text-sm text-gray-700">Featured only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Events Grid */}
          <div className="flex-grow">
            {/* Sort & Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <p className="text-sm text-gray-500">{loading ? 'Loading...' : `${total} event${total !== 1 ? 's' : ''} found`}</p>
              <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)} className="input-field w-auto py-2 text-sm">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {loading ? <Spinner text="Loading events..." /> : events.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No events found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your filters</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map(event => (
                    <EventCard key={event._id} event={event} onWishlistToggle={handleWishlist} wishlist={wishlist} />
                  ))}
                </div>
                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <button onClick={() => handlePage(filters.page - 1)} disabled={filters.page === 1} className="px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 text-sm font-medium">← Prev</button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => handlePage(p)} className={`w-10 h-10 rounded-xl text-sm font-medium ${p === filters.page ? 'bg-indigo-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>{p}</button>
                    ))}
                    <button onClick={() => handlePage(filters.page + 1)} disabled={filters.page === pages} className="px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 text-sm font-medium">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
