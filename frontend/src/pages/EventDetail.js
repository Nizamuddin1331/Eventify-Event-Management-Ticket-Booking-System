import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { eventsAPI, reviewsAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [{ data: ed }, { data: rd }] = await Promise.all([eventsAPI.getOne(id), reviewsAPI.getForEvent(id)]);
        setEvent(ed.event);
        setReviews(rd.reviews);
        if (user?.wishlist) setIsWishlisted(user.wishlist.some(w => (w._id || w) === id));
      } catch { toast.error('Event not found'); navigate('/events'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [id, user, navigate]);

  const toggleWishlist = async () => {
    if (!user) { toast.error('Please login'); navigate('/login'); return; }
    try {
      const { data } = await authAPI.toggleWishlist(id);
      setIsWishlisted(data.added);
      toast.success(data.added ? '❤️ Saved!' : 'Removed from wishlist');
    } catch { toast.error('Failed'); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Login required'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await reviewsAPI.create(id, newReview);
      setReviews(prev => [data.review, ...prev]);
      setNewReview({ rating: 5, comment: '' });
      toast.success('Review submitted!');
      const { data: ed } = await eventsAPI.getOne(id);
      setEvent(ed.event);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    finally { setSubmittingReview(false); }
  };

  const deleteReview = async (reviewId) => {
    try {
      await reviewsAPI.delete(reviewId);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      toast.success('Review deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <Spinner text="Loading event..." />;
  if (!event) return null;

  const soldOut = event.availableSeats <= 0;
  const isPast = new Date(event.date) < new Date();
  const canBook = !soldOut && !isPast && event.status === 'published';
  const allImages = event.images?.length ? event.images : [null];

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Hero Image */}
      <div className="relative h-72 md:h-96 bg-gray-900 overflow-hidden">
        <img
          src={allImages[selectedImage] ? `http://localhost:5000${allImages[selectedImage]}` : PLACEHOLDER}
          alt={event.title}
          className="w-full h-full object-cover opacity-80"
          onError={e => { e.target.src = PLACEHOLDER; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <span className={`badge mb-2 capitalize px-3 py-1 text-sm bg-indigo-500 text-white`}>{event.category}</span>
          <h1 className="text-3xl md:text-4xl font-bold text-white" style={{fontFamily:'DM Serif Display,serif'}}>{event.title}</h1>
        </div>
        {allImages.length > 1 && (
          <div className="absolute bottom-4 right-6 flex gap-2">
            {allImages.map((_, i) => (
              <button key={i} onClick={() => setSelectedImage(i)} className={`w-2 h-2 rounded-full transition-all ${i === selectedImage ? 'bg-white w-6' : 'bg-white/50'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-grow">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 mb-6">
              {['about', 'reviews'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-3 capitalize text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {tab} {tab === 'reviews' && reviews.length > 0 && `(${reviews.length})`}
                </button>
              ))}
            </div>

            {activeTab === 'about' && (
              <div className="space-y-6 animate-fade-in">
                <div className="card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4" style={{fontFamily:'DM Serif Display,serif'}}>About this Event</h2>
                  <p className="text-gray-600 whitespace-pre-line leading-relaxed">{event.description}</p>
                  {event.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {event.tags.map(tag => <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">#{tag}</span>)}
                    </div>
                  )}
                </div>

                <div className="card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4" style={{fontFamily:'DM Serif Display,serif'}}>Event Details</h2>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      ['📅 Date', format(new Date(event.date), 'EEEE, MMMM d, yyyy')],
                      ['⏰ Time', event.time],
                      ['📍 Venue', event.location.venue],
                      ['🏙 City', `${event.location.city}, ${event.location.state}`],
                      ['🎟 Total Seats', event.totalSeats.toLocaleString()],
                      ['💺 Available', event.availableSeats.toLocaleString()],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-4">
                        <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</dt>
                        <dd className="text-gray-900 font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {event.organizer && (
                  <div className="card p-6 flex items-center gap-4">
                    <img src={event.organizer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.organizer.name)}&background=6366f1&color=fff`} alt={event.organizer.name} className="w-14 h-14 rounded-full border-2 border-indigo-100 object-cover" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Organized by</p>
                      <p className="font-semibold text-gray-900">{event.organizer.name}</p>
                      <p className="text-sm text-gray-500">{event.organizer.email}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-fade-in">
                {/* Review Form */}
                {user && (
                  <div className="card p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
                    <form onSubmit={submitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(star => (
                            <button key={star} type="button" onClick={() => setNewReview(r => ({...r, rating: star}))} className={`text-2xl transition-transform hover:scale-110 ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                          ))}
                        </div>
                      </div>
                      <textarea value={newReview.comment} onChange={e => setNewReview(r => ({...r, comment: e.target.value}))} placeholder="Share your experience..." rows={3} className="input-field resize-none" />
                      <button type="submit" disabled={submittingReview} className="btn-primary">{submittingReview ? 'Submitting...' : 'Submit Review'}</button>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-4xl mb-3">💬</div>
                    <p>No reviews yet. Be the first!</p>
                  </div>
                ) : reviews.map(review => (
                  <div key={review._id} className="card p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img src={review.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'U')}&background=6366f1&color=fff`} alt={review.user?.name} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{review.user?.name}</p>
                          <div className="flex">{[1,2,3,4,5].map(s => <span key={s} className={`text-sm ${s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
                        {user && (user._id === review.user?._id || user.role === 'admin') && (
                          <button onClick={() => deleteReview(review._id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                        )}
                      </div>
                    </div>
                    {review.comment && <p className="text-gray-600 mt-3 text-sm leading-relaxed">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Booking Panel */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="card p-6 lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{event.price === 0 ? <span className="text-green-600">FREE</span> : `₹${event.price.toLocaleString()}`}</p>
                  <p className="text-sm text-gray-500">per ticket</p>
                </div>
                {event.averageRating > 0 && (
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl">
                    <span className="text-yellow-500">★</span>
                    <span className="font-bold text-gray-800 text-sm">{event.averageRating}</span>
                  </div>
                )}
              </div>

              {/* Seat availability */}
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600">Available seats</span>
                  <span className={`font-semibold ${soldOut ? 'text-red-600' : event.availableSeats <= 10 ? 'text-orange-600' : 'text-green-600'}`}>
                    {soldOut ? 'Sold Out' : `${event.availableSeats} left`}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${soldOut ? 'bg-red-500' : event.availableSeats <= 10 ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min((event.bookedSeats / event.totalSeats) * 100, 100)}%` }} />
                </div>
              </div>

              {isPast ? (
                <div className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl text-center font-medium text-sm">Event Ended</div>
              ) : canBook ? (
                <Link to={`/events/${id}/book`} className="btn-primary w-full justify-center py-3 text-base">Book Tickets →</Link>
              ) : (
                <div className="w-full py-3 bg-red-50 text-red-500 rounded-xl text-center font-medium text-sm">Sold Out</div>
              )}

              <button onClick={toggleWishlist} className={`mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all text-sm font-medium ${isWishlisted ? 'border-red-200 text-red-500 bg-red-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                <svg className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isWishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
              </button>

              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
                Secure checkout · Instant confirmation · Easy cancellation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
