import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { organizerAPI, eventsAPI } from '../services/api';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

export default function OrganizerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await organizerAPI.getDashboard();
      setStats(data.stats);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await eventsAPI.delete(id);
      toast.success('Event deleted');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    finally { setDeletingId(null); }
  };

  if (loading) return <Spinner text="Loading organizer dashboard..." />;

  const chartData = stats?.events?.map(e => ({ name: e.title.substring(0, 20) + '...', booked: e.bookedSeats, available: e.availableSeats })) || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="page-title mb-1">Organizer Dashboard</h1>
            <p className="text-gray-500">Manage your events and track performance</p>
          </div>
          <Link to="/events/create" className="btn-primary">+ Create Event</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'My Events', value: stats?.totalEvents || 0, icon: '🎪', color: 'from-purple-500 to-violet-500' },
            { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: '🎟', color: 'from-orange-500 to-amber-500' },
            { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'from-green-500 to-emerald-500' },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {['overview','events','bookings'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 capitalize text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4">Seat Occupancy by Event</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="booked" fill="#6366f1" name="Booked" stackId="a" radius={[0,4,4,0]} />
                    <Bar dataKey="available" fill="#e0e7ff" name="Available" stackId="a" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-400 text-sm text-center py-8">Create events to see analytics</p>}
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4">Recent Bookings</h3>
              {stats?.recentBookings?.length > 0 ? stats.recentBookings.map(b => (
                <div key={b._id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 flex-shrink-0">
                    {b.user?.name?.charAt(0)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium text-gray-900">{b.user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{b.event?.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{b.totalAmount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{b.seats} seat{b.seats > 1 ? 's' : ''}</p>
                  </div>
                </div>
              )) : <p className="text-gray-400 text-sm text-center py-6">No bookings yet</p>}
            </div>
          </div>
        )}

        {tab === 'events' && (
          <div className="animate-fade-in">
            {stats?.events?.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-5xl mb-4">🎪</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No events yet</h3>
                <p className="text-gray-400 mb-6">Create your first event to get started</p>
                <Link to="/events/create" className="btn-primary">Create Event</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.events.map(event => (
                  <div key={event._id} className="card p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-gray-900 truncate">{event.title}</h3>
                          <span className={`badge capitalize text-xs px-2 py-0.5 ${event.status === 'published' ? 'bg-green-100 text-green-700' : event.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'}`}>{event.status}</span>
                        </div>
                        <p className="text-sm text-gray-500">{format(new Date(event.date), 'EEE, MMM d, yyyy')} · ₹{event.price.toLocaleString()}/seat</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <p className="text-xs text-gray-400">Booked</p>
                            <p className="text-sm font-bold text-indigo-600">{event.bookedSeats}/{event.totalSeats}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Revenue</p>
                            <p className="text-sm font-bold text-green-600">₹{(event.bookedSeats * event.price).toLocaleString()}</p>
                          </div>
                          <div className="flex-grow">
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                              <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${event.totalSeats > 0 ? (event.bookedSeats / event.totalSeats) * 100 : 0}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Link to={`/events/${event._id}`} className="btn-secondary text-xs py-1.5 px-3">View</Link>
                        <Link to={`/events/${event._id}/edit`} className="btn-secondary text-xs py-1.5 px-3">✏️ Edit</Link>
                        <button onClick={() => deleteEvent(event._id)} disabled={deletingId === event._id} className="text-xs py-1.5 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                          {deletingId === event._id ? '...' : '🗑 Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'bookings' && (
          <div className="card p-6 animate-fade-in">
            <h3 className="font-bold text-gray-900 mb-4">All Bookings for Your Events</h3>
            {stats?.recentBookings?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Booking ID','Attendee','Email','Event','Seats','Amount','Date'].map(h => <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.map(b => (
                      <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-3 font-mono text-xs text-indigo-600">{b.bookingId}</td>
                        <td className="py-3 px-3 font-medium">{b.user?.name}</td>
                        <td className="py-3 px-3 text-gray-400">{b.user?.email}</td>
                        <td className="py-3 px-3 max-w-xs truncate">{b.event?.title}</td>
                        <td className="py-3 px-3">{b.seats}</td>
                        <td className="py-3 px-3 font-medium">₹{b.totalAmount?.toLocaleString()}</td>
                        <td className="py-3 px-3 text-gray-400">{format(new Date(b.createdAt), 'MMM d, yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-gray-400 text-sm text-center py-8">No bookings yet</p>}
          </div>
        )}
      </div>
    </div>
  );
}
