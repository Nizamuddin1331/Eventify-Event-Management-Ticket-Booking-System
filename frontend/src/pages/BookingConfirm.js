import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { bookingsAPI } from '../services/api';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

export default function BookingConfirm() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    bookingsAPI.getOne(id)
      .then(({ data }) => setBooking(data.booking))
      .catch(() => toast.error('Booking not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const downloadTicket = async () => {
    setDownloading(true);
    try {
      const { data } = await bookingsAPI.downloadTicket(id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${booking.bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Ticket downloaded!');
    } catch { toast.error('Failed to download ticket'); }
    finally { setDownloading(false); }
  };

  if (loading) return <Spinner text="Loading booking..." />;
  if (!booking) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 animate-fade-in">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{fontFamily:'DM Serif Display,serif'}}>Booking Confirmed!</h1>
          <p className="text-gray-500">Your tickets are ready. Check your email for details.</p>
        </div>

        {/* Ticket Card */}
        <div className="card overflow-hidden mb-6">
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm mb-1">Booking ID</p>
                <p className="text-2xl font-bold tracking-wide">{booking.bookingId}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 bg-green-400 text-green-900 text-sm font-bold px-3 py-1 rounded-full">✓ CONFIRMED</span>
              </div>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5" style={{fontFamily:'DM Serif Display,serif'}}>{booking.event?.title}</h2>
            <div className="grid grid-cols-2 gap-4 mb-5">
              {[
                ['📅 Date', format(new Date(booking.event?.date), 'EEE, MMM d, yyyy')],
                ['⏰ Time', booking.event?.time],
                ['📍 Venue', booking.event?.location?.venue],
                ['🏙 City', booking.event?.location?.city],
                ['🎟 Seats', booking.seats],
                ['💺 Seat Numbers', booking.seatNumbers?.join(', ')],
                ['💳 Paid', `₹${booking.totalAmount?.toLocaleString()}`],
                ['🔖 Transaction', booking.payment?.transactionId || 'N/A'],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="font-semibold text-gray-900 text-sm">{value}</p>
                </div>
              ))}
            </div>

            {/* QR Code */}
            {booking.qrCode && (
              <div className="flex flex-col items-center border-t border-dashed border-gray-200 pt-5">
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">Scan at entry</p>
                <img src={booking.qrCode} alt="QR Code" className="w-32 h-32" />
                <p className="text-xs text-gray-400 mt-2">{booking.bookingId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={downloadTicket} disabled={downloading} className="btn-primary flex-1 justify-center py-3">
            {downloading ? 'Downloading...' : '⬇️ Download PDF Ticket'}
          </button>
          <Link to="/my-bookings" className="btn-secondary flex-1 justify-center py-3 text-center">View All Bookings</Link>
          <Link to="/events" className="btn-secondary flex-1 justify-center py-3 text-center">Browse More Events</Link>
        </div>
      </div>
    </div>
  );
}
