import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { bookingsAPI } from '../services/api';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-blue-100 text-blue-700',
};

const PLACEHOLDER = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&auto=format&fit=crop';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [filter, setFilter] = useState('all');
  const [total, setTotal] = useState(0);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await bookingsAPI.getMyBookings({ ...params, limit: 20 });
      setBookings(data.bookings);
      setTotal(data.total);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  const downloadTicket = async (booking) => {
    setDownloading(booking._id);
    try {
      const { data } = await bookingsAPI.downloadTicket(booking._id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${booking.bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Ticket downloaded!');
    } catch { toast.error('Download failed'); }
    finally { setDownloading(null); }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking? This cannot be undone.')) return;
    setCancelling(bookingId);
    try {
      await bookingsAPI.cancel(bookingId, 'User requested cancellation');
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Cancellation failed'); }
    finally { setCancelling(null); }
  };

  const FILTERS = ['all', 'confirmed', 'pending', 'cancelled'];

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="page-title mb-1">My Bookings</h1>
          <p className="text-gray-500">{total} booking{total !== 1 ? 's' : ''} total</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl capitalize text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {f === 'all' ? 'All Bookings' : f}
            </button>
          ))}
        </div>

        {loading ? <Spinner text="Loading bookings..." /> : bookings.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">🎟</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No bookings yet</h3>
            <p className="text-gray-400 mb-6">Discover amazing events and book your first ticket!</p>
            <Link to="/events" className="btn-primary">Browse Events</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking._id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={booking.event?.images?.[0] ? `http://localhost:5000${booking.event.images[0]}` : PLACEHOLDER}
                    alt={booking.event?.title}
                    className="w-full sm:w-24 h-24 object-cover rounded-xl flex-shrink-0"
                    onError={e => { e.target.src = PLACEHOLDER; }}
                  />
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 leading-snug" style={{fontFamily:'DM Serif Display,serif'}}>{booking.event?.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">ID: {booking.bookingId}</p>
                      </div>
                      <span className={`badge ${STATUS_STYLES[booking.status]} capitalize px-3 py-1`}>{booking.status}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      {[
                        ['Date', booking.event?.date ? format(new Date(booking.event.date), 'MMM d, yyyy') : '-'],
                        ['Seats', `${booking.seats} (${booking.seatNumbers?.join(', ')})`],
                        ['Amount', `₹${booking.totalAmount?.toLocaleString()}`],
                        ['Booked', format(new Date(booking.createdAt), 'MMM d, yyyy')],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p className="text-xs text-gray-400">{label}</p>
                          <p className="text-sm font-medium text-gray-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Link to={`/events/${booking.event?._id}`} className="btn-secondary text-xs py-1.5 px-3">View Event</Link>
                  {booking.status === 'confirmed' && (
                    <>
                      <Link to={`/bookings/${booking._id}/confirm`} className="btn-secondary text-xs py-1.5 px-3">🎫 View Ticket</Link>
                      <button onClick={() => downloadTicket(booking)} disabled={downloading === booking._id} className="btn-secondary text-xs py-1.5 px-3">
                        {downloading === booking._id ? 'Downloading...' : '⬇️ Download PDF'}
                      </button>
                      {new Date(booking.event?.date) > new Date() && (
                        <button onClick={() => cancelBooking(booking._id)} disabled={cancelling === booking._id} className="text-xs py-1.5 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                          {cancelling === booking._id ? 'Cancelling...' : '✕ Cancel'}
                        </button>
                      )}
                    </>
                  )}
                  {booking.status === 'pending' && (
                    <Link to={`/events/${booking.event?._id}/book`} className="btn-primary text-xs py-1.5 px-3">Complete Payment</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
