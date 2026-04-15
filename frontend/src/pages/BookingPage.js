import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { eventsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=60';

export default function BookingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState(1);
  const [step, setStep] = useState(1); // 1: select seats, 2: payment, 3: processing
  const [paymentMethod, setPaymentMethod] = useState('simulated');
  const [booking, setBooking] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    eventsAPI.getOne(id)
      .then(({ data }) => setEvent(data.event))
      .catch(() => { toast.error('Event not found'); navigate('/events'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleCreateBooking = async () => {
    setProcessing(true);
    try {
      const { data } = await bookingsAPI.create({ eventId: id, seats });
      setBooking(data.booking);
      setStep(2);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create booking'); }
    finally { setProcessing(false); }
  };

  const handlePayment = async () => {
    setStep(3);
    setProcessing(true);
    try {
      // Simulate payment processing delay
      await new Promise(res => setTimeout(res, 1500));
      const { data } = await bookingsAPI.pay(booking._id, { method: paymentMethod });
      toast.success('Payment successful! 🎉');
      navigate(`/bookings/${data.booking._id}/confirm`);
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed'); setStep(2); }
    finally { setProcessing(false); }
  };

  if (loading) return <Spinner text="Loading event details..." />;
  if (!event) return null;

  const total = event.price * seats;

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 gap-4">
          {[{n:1,label:'Select Seats'},{n:2,label:'Payment'},{n:3,label:'Confirm'}].map(({n,label}) => (
            <React.Fragment key={n}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= n ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{step > n ? '✓' : n}</div>
                <span className={`text-sm font-medium hidden sm:block ${step >= n ? 'text-indigo-600' : 'text-gray-400'}`}>{label}</span>
              </div>
              {n < 3 && <div className={`flex-grow h-0.5 max-w-16 ${step > n ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Panel */}
          <div className="flex-grow">
            {step === 1 && (
              <div className="card p-6 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-6" style={{fontFamily:'DM Serif Display,serif'}}>Select Tickets</h2>
                <div className="bg-indigo-50 rounded-2xl p-5 mb-6 flex items-center gap-4">
                  <img src={event.images?.[0] ? `http://localhost:5000${event.images[0]}` : PLACEHOLDER} alt={event.title} className="w-20 h-20 rounded-xl object-cover" onError={e => {e.target.src=PLACEHOLDER;}} />
                  <div>
                    <h3 className="font-bold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500">{format(new Date(event.date), 'EEE, MMM d, yyyy')} · {event.time}</p>
                    <p className="text-sm text-gray-500">📍 {event.location.venue}, {event.location.city}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Number of Tickets</label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSeats(s => Math.max(1, s-1))} className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:border-indigo-400 hover:text-indigo-600 transition-colors">−</button>
                    <span className="text-2xl font-bold text-gray-900 w-8 text-center">{seats}</span>
                    <button onClick={() => setSeats(s => Math.min(Math.min(10, event.availableSeats), s+1))} className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:border-indigo-400 hover:text-indigo-600 transition-colors">+</button>
                    <span className="text-sm text-gray-400 ml-2">Max 10 per booking · {event.availableSeats} available</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">Price per ticket</span><span className="font-medium">₹{event.price.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">Tickets</span><span className="font-medium">× {seats}</span></div>
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-gray-900"><span>Total</span><span className="text-indigo-600 text-lg">₹{total.toLocaleString()}</span></div>
                </div>

                <button onClick={handleCreateBooking} disabled={processing} className="btn-primary w-full justify-center py-3 text-base">
                  {processing ? 'Processing...' : 'Proceed to Payment →'}
                </button>
              </div>
            )}

            {step === 2 && booking && (
              <div className="card p-6 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-6" style={{fontFamily:'DM Serif Display,serif'}}>Complete Payment</h2>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-800">
                  ✅ Booking reserved! Complete payment to confirm. Booking ID: <strong>{booking.bookingId}</strong>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[['simulated','💳 Simulate Pay'],['card','💳 Card'],['upi','📱 UPI'],['netbanking','🏦 Net Banking']].map(([val, label]) => (
                      <button key={val} onClick={() => setPaymentMethod(val)} className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-colors ${paymentMethod === val ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-3 mb-6 animate-fade-in">
                    <input className="input-field" placeholder="Card Number (demo: 4242 4242 4242 4242)" />
                    <div className="flex gap-3">
                      <input className="input-field" placeholder="MM/YY" />
                      <input className="input-field" placeholder="CVV" />
                    </div>
                    <input className="input-field" placeholder="Cardholder Name" />
                  </div>
                )}
                {paymentMethod === 'upi' && (
                  <div className="mb-6 animate-fade-in">
                    <input className="input-field" placeholder="Enter UPI ID (e.g. user@upi)" />
                  </div>
                )}

                <button onClick={handlePayment} disabled={processing} className="btn-primary w-full justify-center py-3 text-base">
                  {processing ? 'Processing...' : `Pay ₹${total.toLocaleString()} →`}
                </button>
                <button onClick={() => { setStep(1); setBooking(null); }} className="mt-3 w-full btn-secondary justify-center text-sm">← Go Back</button>
              </div>
            )}

            {step === 3 && (
              <div className="card p-12 text-center animate-fade-in">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h3>
                <p className="text-gray-500">Please wait, do not close this page...</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="card p-5 lg:sticky lg:top-24">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              <img src={event.images?.[0] ? `http://localhost:5000${event.images[0]}` : PLACEHOLDER} alt={event.title} className="w-full h-36 object-cover rounded-xl mb-4" onError={e=>{e.target.src=PLACEHOLDER;}} />
              <h4 className="font-semibold text-gray-900 text-sm mb-3 leading-snug">{event.title}</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Date</dt><dd className="font-medium text-right">{format(new Date(event.date),'MMM d, yyyy')}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Time</dt><dd className="font-medium">{event.time}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Venue</dt><dd className="font-medium text-right text-xs leading-tight">{event.location.venue}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Tickets</dt><dd className="font-medium">{seats}</dd></div>
                <div className="border-t pt-2 flex justify-between font-bold"><dt>Total</dt><dd className="text-indigo-600">₹{total.toLocaleString()}</dd></div>
              </dl>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">Attendee: <strong>{user?.name}</strong></p>
                <p className="text-xs text-gray-400 text-center">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
