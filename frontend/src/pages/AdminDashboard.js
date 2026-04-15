import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { adminAPI } from '../services/api';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    Promise.all([adminAPI.getDashboard(), adminAPI.getUsers({ limit: 20 })])
      .then(([{ data: d }, { data: u }]) => { setStats(d.stats); setUsers(u.users); })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  }, []);

  const toggleUserStatus = async (userId, isActive) => {
    try {
      const { data } = await adminAPI.updateUser(userId, { isActive: !isActive });
      setUsers(prev => prev.map(u => u._id === userId ? data.user : u));
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update user'); }
  };

  const changeUserRole = async (userId, role) => {
    try {
      const { data } = await adminAPI.updateUser(userId, { role });
      setUsers(prev => prev.map(u => u._id === userId ? data.user : u));
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  const chartData = stats?.monthlyRevenue?.map(m => ({
    name: MONTH_NAMES[m._id.month - 1],
    revenue: m.revenue,
    bookings: m.bookings,
  })) || [];

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading) return <Spinner text="Loading admin dashboard..." />;

  const STAT_CARDS = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Events', value: stats?.totalEvents || 0, icon: '🎪', color: 'from-purple-500 to-violet-500' },
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: '🎟', color: 'from-orange-500 to-amber-500' },
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="page-title mb-1">Admin Dashboard</h1>
            <p className="text-gray-500">Platform overview and management</p>
          </div>
          <Link to="/events/create" className="btn-primary text-sm">+ Create Event</Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {STAT_CARDS.map(s => (
            <div key={s.label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl`}>{s.icon}</div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {['overview','users','events'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 capitalize text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Revenue Chart */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4">Monthly Revenue</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-400 text-sm text-center py-8">No revenue data yet</p>}
            </div>

            {/* Bookings Chart */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4">Monthly Bookings</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="bookings" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-400 text-sm text-center py-8">No booking data yet</p>}
            </div>

            {/* Recent Bookings */}
            <div className="card p-6 lg:col-span-2">
              <h3 className="font-bold text-gray-900 mb-4">Recent Bookings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Booking ID','User','Event','Amount','Date','Status'].map(h => <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentBookings?.map(b => (
                      <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-3 font-mono text-xs text-indigo-600">{b.bookingId}</td>
                        <td className="py-3 px-3">{b.user?.name}</td>
                        <td className="py-3 px-3 max-w-xs truncate">{b.event?.title}</td>
                        <td className="py-3 px-3 font-medium">₹{b.totalAmount?.toLocaleString()}</td>
                        <td className="py-3 px-3 text-gray-400">{format(new Date(b.createdAt), 'MMM d, yyyy')}</td>
                        <td className="py-3 px-3"><span className="badge bg-green-100 text-green-700 capitalize">{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!stats?.recentBookings?.length && <p className="text-gray-400 text-sm text-center py-6">No bookings yet</p>}
              </div>
            </div>

            {/* Top Events */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4">Top Events by Bookings</h3>
              {stats?.topEvents?.map((e, i) => (
                <div key={e._id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-600'}`}>{i+1}</span>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                    <p className="text-xs text-gray-400">{e.bookedSeats}/{e.totalSeats} seats · ₹{e.price}/ticket</p>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">{e.bookedSeats}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users..." className="input-field max-w-xs py-2 text-sm" />
            </div>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Name','Email','Role','Status','Joined','Actions'].map(h => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u._id} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{u.name}</td>
                        <td className="py-3 px-4 text-gray-500">{u.email}</td>
                        <td className="py-3 px-4">
                          <select value={u.role} onChange={e => changeUserRole(u._id, e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            {['user','organizer','admin'].map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`badge capitalize ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-xs">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button onClick={() => toggleUserStatus(u._id, u.isActive)} className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${u.isActive ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => deleteUser(u._id)} className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'events' && (
          <div className="animate-fade-in">
            <p className="text-sm text-gray-500 mb-4">Manage and moderate events across the platform.</p>
            <div className="card p-6 text-center text-gray-400">
              <p>Use the <Link to="/events" className="text-indigo-600 font-medium">Events page</Link> to manage all events. Admins can edit, delete, and feature any event.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
