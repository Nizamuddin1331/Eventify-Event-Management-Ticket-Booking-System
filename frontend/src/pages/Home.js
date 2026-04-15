import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventsAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/common/EventCard';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'music', label: 'Music', emoji: '🎵', color: 'from-pink-500 to-rose-500' },
  { id: 'tech', label: 'Technology', emoji: '💻', color: 'from-blue-500 to-cyan-500' },
  { id: 'sports', label: 'Sports', emoji: '⚽', color: 'from-green-500 to-emerald-500' },
  { id: 'food', label: 'Food & Drink', emoji: '🍔', color: 'from-orange-500 to-amber-500' },
  { id: 'art', label: 'Arts', emoji: '🎨', color: 'from-purple-500 to-violet-500' },
  { id: 'business', label: 'Business', emoji: '💼', color: 'from-gray-500 to-slate-600' },
];

const STATS = [
  { value: '500+', label: 'Events Monthly' },
  { value: '50K+', label: 'Happy Attendees' },
  { value: '200+', label: 'City Partners' },
  { value: '₹2Cr+', label: 'Tickets Sold' },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState(user?.wishlist?.map(e => e._id || e) || []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [featured, upcoming] = await Promise.all([
          eventsAPI.getAll({ featured: true, limit: 4 }),
          eventsAPI.getAll({ sort: 'date', limit: 8 }),
        ]);
        setFeaturedEvents(featured.data.events);
        setUpcomingEvents(upcoming.data.events);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
    else navigate('/events');
  };

  const handleWishlist = async (eventId) => {
    if (!user) { toast.error('Please login to save events'); navigate('/login'); return; }
    try {
      const { data } = await authAPI.toggleWishlist(eventId);
      setWishlist(data.wishlist);
      toast.success(data.added ? '❤️ Added to wishlist' : 'Removed from wishlist');
    } catch { toast.error('Failed to update wishlist'); }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-400 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              500+ events happening this month
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{fontFamily:'DM Serif Display, serif'}}>
              Life is short.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                Miss nothing.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-indigo-200 mb-10 leading-relaxed">
              Discover concerts, conferences, food festivals, marathons and more. Book tickets in seconds.
            </p>
            {/* Search */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-grow">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search events, artists, venues..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition-all"
                />
              </div>
              <button type="submit" className="px-8 py-4 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-xl whitespace-nowrap">
                Search Events
              </button>
            </form>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-indigo-300 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="page-title mb-2">Browse by Category</h2>
            <p className="text-gray-500">Find events that match your passion</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                to={`/events?category=${cat.id}`}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${cat.color} text-white hover:scale-105 transition-transform shadow-sm hover:shadow-md`}
              >
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-sm font-semibold text-center">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {loading ? (
        <div className="py-16"><Spinner text="Loading events..." /></div>
      ) : (
        <>
          {featuredEvents.length > 0 && (
            <section className="py-16 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="page-title mb-1">⭐ Featured Events</h2>
                    <p className="text-gray-500">Handpicked experiences you won't want to miss</p>
                  </div>
                  <Link to="/events?featured=true" className="btn-outline text-sm hidden md:flex">View All →</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredEvents.map(event => (
                    <EventCard key={event._id} event={event} onWishlistToggle={handleWishlist} wishlist={wishlist} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Upcoming Events */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="page-title mb-1">🗓 Upcoming Events</h2>
                  <p className="text-gray-500">Book your spot before it's too late</p>
                </div>
                <Link to="/events?sort=date" className="btn-outline text-sm hidden md:flex">View All →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {upcomingEvents.map(event => (
                  <EventCard key={event._id} event={event} onWishlistToggle={handleWishlist} wishlist={wishlist} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Link to="/events" className="btn-primary text-base px-8 py-3">Explore All Events</Link>
              </div>
            </div>
          </section>
        </>
      )}

      {/* CTA Banner */}
      {!user && (
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-violet-700 text-white">
          <div className="max-w-3xl mx-auto text-center px-4">
            <h2 className="text-4xl font-bold mb-4" style={{fontFamily:'DM Serif Display, serif'}}>Ready to experience more?</h2>
            <p className="text-indigo-200 text-lg mb-8">Join thousands of event-goers. Free forever for attendees.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-4 bg-white text-indigo-700 font-semibold rounded-2xl hover:bg-indigo-50 transition-colors shadow-lg">
                Create Free Account
              </Link>
              <Link to="/events" className="px-8 py-4 border-2 border-white/50 text-white font-semibold rounded-2xl hover:bg-white/10 transition-colors">
                Browse Events
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
