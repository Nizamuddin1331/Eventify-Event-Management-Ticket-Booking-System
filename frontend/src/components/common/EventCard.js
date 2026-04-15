import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const CATEGORY_COLORS = {
  music: 'bg-pink-100 text-pink-700',
  sports: 'bg-green-100 text-green-700',
  tech: 'bg-blue-100 text-blue-700',
  food: 'bg-orange-100 text-orange-700',
  art: 'bg-purple-100 text-purple-700',
  business: 'bg-gray-100 text-gray-700',
  education: 'bg-yellow-100 text-yellow-700',
  health: 'bg-teal-100 text-teal-700',
  other: 'bg-indigo-100 text-indigo-700',
};

const CATEGORY_EMOJIS = { music:'🎵', sports:'⚽', tech:'💻', food:'🍔', art:'🎨', business:'💼', education:'📚', health:'🧘', other:'🎉' };

const EVENT_PLACEHOLDER = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60';

export default function EventCard({ event, onWishlistToggle, wishlist = [] }) {
  const isWishlisted = wishlist.includes(event._id);
  const soldOut = event.availableSeats <= 0;
  const almostFull = !soldOut && event.availableSeats <= 10;
  const isFree = event.price === 0;

  return (
    <div className="card group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={event.images?.[0] ? `http://localhost:5000${event.images[0]}` : EVENT_PLACEHOLDER}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = EVENT_PLACEHOLDER; }}
        />
        {/* Overlays */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className={`badge ${CATEGORY_COLORS[event.category]} capitalize`}>
            {CATEGORY_EMOJIS[event.category]} {event.category}
          </span>
          {event.isFeatured && <span className="badge bg-amber-100 text-amber-700">⭐ Featured</span>}
          {soldOut && <span className="badge bg-red-100 text-red-700">Sold Out</span>}
          {almostFull && <span className="badge bg-orange-100 text-orange-700">Almost Full</span>}
        </div>
        {/* Wishlist button */}
        {onWishlistToggle && (
          <button
            onClick={(e) => { e.preventDefault(); onWishlistToggle(event._id); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-110 transition-transform"
          >
            <svg className={`w-4 h-4 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
        {/* Price badge */}
        <div className="absolute bottom-3 right-3">
          <span className="px-3 py-1 rounded-full text-sm font-bold bg-white/95 text-gray-900 shadow">
            {isFree ? '🆓 Free' : `₹${event.price.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/events/${event._id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 leading-snug mb-2" style={{fontFamily:'DM Serif Display,serif'}}>
            {event.title}
          </h3>
        </Link>

        <div className="space-y-1.5 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>{format(new Date(event.date), 'EEE, MMM d, yyyy')} · {event.time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="truncate">{event.location.venue}, {event.location.city}</span>
          </div>
          {event.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="font-medium text-gray-700">{event.averageRating}</span>
              <span className="text-gray-400">({event.numReviews})</span>
            </div>
          )}
        </div>

        {/* Seats bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{event.availableSeats} seats left</span>
            <span>{Math.round((event.bookedSeats / event.totalSeats) * 100)}% booked</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${soldOut ? 'bg-red-500' : almostFull ? 'bg-orange-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min((event.bookedSeats / event.totalSeats) * 100, 100)}%` }}
            />
          </div>
        </div>

        <Link
          to={`/events/${event._id}`}
          className={`mt-4 w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-medium transition-all ${soldOut ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
        >
          {soldOut ? 'Sold Out' : 'View Details →'}
        </Link>
      </div>
    </div>
  );
}
