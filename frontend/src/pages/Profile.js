import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      fd.append('bio', form.bio);
      if (avatarFile) fd.append('avatar', avatarFile);
      const { data } = await authAPI.updateProfile(fd);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error("Passwords don't match"); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 chars'); return; }
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const avatarSrc = avatarPreview || (user?.avatar ? `http://localhost:5000${user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=6366f1&color=fff&size=200`);
  const ROLE_BADGE = { admin: 'bg-red-100 text-red-700', organizer: 'bg-purple-100 text-purple-700', user: 'bg-blue-100 text-blue-700' };

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="card p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <img src={avatarSrc} alt={user?.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-indigo-100" />
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{fontFamily:'DM Serif Display,serif'}}>{user?.name}</h1>
            <p className="text-gray-500 text-sm mb-2">{user?.email}</p>
            <div className="flex items-center gap-2">
              <span className={`badge capitalize px-3 py-1 ${ROLE_BADGE[user?.role]}`}>{user?.role}</span>
              <span className="text-xs text-gray-400">Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : '—'}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {['profile', 'security', 'wishlist'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 capitalize text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t}</button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="card p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Edit Profile</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} className="input-field" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f=>({...f,bio:e.target.value}))} rows={3} className="input-field resize-none" placeholder="Tell us about yourself..." />
              </div>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
            </form>
          </div>
        )}

        {tab === 'security' && (
          <div className="card p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Change Password</h2>
            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f=>({...f,currentPassword:e.target.value}))} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <input type="password" value={pwForm.newPassword} onChange={e => setPwForm(f=>({...f,newPassword:e.target.value}))} className="input-field" placeholder="Min 6 characters" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f=>({...f,confirmPassword:e.target.value}))} className={`input-field ${pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword ? 'border-red-400' : ''}`} required />
              </div>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Updating...' : 'Update Password'}</button>
            </form>
          </div>
        )}

        {tab === 'wishlist' && (
          <div className="animate-fade-in">
            {!user?.wishlist?.length ? (
              <div className="card p-12 text-center">
                <div className="text-4xl mb-4">❤️</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No saved events</h3>
                <p className="text-gray-400 mb-6">Heart events to save them here</p>
                <Link to="/events" className="btn-primary">Browse Events</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.wishlist.map(event => (
                  <Link key={event._id || event} to={`/events/${event._id || event}`} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">🎉</div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{event.title || 'Saved Event'}</p>
                      {event.date && <p className="text-xs text-gray-400 mt-1">{format(new Date(event.date), 'MMM d, yyyy')}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
