import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['music','sports','tech','food','art','business','education','health','other'];

function EventForm({ initialData, onSubmit, loading, title }) {
  const [form, setForm] = useState(initialData);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const setLoc = (key, value) => setForm(f => ({ ...f, location: { ...f.location, [key]: value } }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    // Flatten form fields
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'location') Object.entries(v).forEach(([lk, lv]) => fd.append(`location[${lk}]`, lv));
      else if (k === 'tags') { const tags = v.split(',').map(t => t.trim()).filter(Boolean); tags.forEach(t => fd.append('tags', t)); }
      else fd.append(k, v);
    });
    images.forEach(img => fd.append('images', img));
    await onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-5">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Title *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className="input-field" required placeholder="e.g. React Summit 2025" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5} className="input-field resize-none" required placeholder="Describe your event in detail..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field capitalize">
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="input-field">
                {['published','draft','cancelled'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma separated)</label>
            <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)} className="input-field" placeholder="react, javascript, conference" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-5">Date & Time</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Date *</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="input-field" required min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Time *</label>
            <input type="text" value={form.time} onChange={e => set('time', e.target.value)} className="input-field" required placeholder="e.g. 10:00 AM" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date (optional)</label>
            <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-5">Location</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Venue Name *</label>
            <input type="text" value={form.location.venue} onChange={e => setLoc('venue', e.target.value)} className="input-field" required placeholder="e.g. HICC, Hyderabad" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <input type="text" value={form.location.address} onChange={e => setLoc('address', e.target.value)} className="input-field" placeholder="Full address" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
            <input type="text" value={form.location.city} onChange={e => setLoc('city', e.target.value)} className="input-field" required placeholder="Hyderabad" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
            <input type="text" value={form.location.state} onChange={e => setLoc('state', e.target.value)} className="input-field" placeholder="Telangana" />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-5">Tickets & Pricing</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹) *</label>
            <input type="number" value={form.price} onChange={e => set('price', e.target.value)} className="input-field" required min="0" placeholder="0 for free event" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Seats *</label>
            <input type="number" value={form.totalSeats} onChange={e => set('totalSeats', e.target.value)} className="input-field" required min="1" placeholder="100" />
          </div>
        </div>
        {form.price == 0 && <p className="text-sm text-green-600 mt-2">🎉 This will be a <strong>free event</strong></p>}
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-5">Event Images</h3>
        <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
          <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <p className="text-sm text-gray-500">Click to upload images (up to 5)</p>
          <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP • Max 5MB each</p>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
        </label>
        {previews.length > 0 && (
          <div className="flex gap-3 mt-4 flex-wrap">
            {previews.map((p, i) => <img key={i} src={p} alt="" className="w-20 h-20 object-cover rounded-xl border-2 border-indigo-200" />)}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3 text-base">
          {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : title}
        </button>
        <button type="button" onClick={() => window.history.back()} className="btn-secondary py-3 px-6">Cancel</button>
      </div>
    </form>
  );
}

const DEFAULT_FORM = { title:'', description:'', category:'tech', date:'', endDate:'', time:'', location:{ venue:'', address:'', city:'', state:'', country:'India' }, price:'0', totalSeats:'100', tags:'', status:'published' };

export function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (fd) => {
    setLoading(true);
    try {
      const { data } = await eventsAPI.create(fd);
      toast.success('Event created! 🎉');
      navigate(`/events/${data.event._id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create event'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="page-title mb-1">Create New Event</h1>
          <p className="text-gray-500">Fill in the details to publish your event</p>
        </div>
        <EventForm initialData={DEFAULT_FORM} onSubmit={handleSubmit} loading={loading} title="Publish Event →" />
      </div>
    </div>
  );
}

export function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    eventsAPI.getOne(id).then(({ data }) => {
      const e = data.event;
      setInitialData({
        title: e.title || '', description: e.description || '', category: e.category || 'other',
        date: e.date ? new Date(e.date).toISOString().split('T')[0] : '',
        endDate: e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : '',
        time: e.time || '', location: e.location || { venue:'', address:'', city:'', state:'', country:'India' },
        price: e.price?.toString() || '0', totalSeats: e.totalSeats?.toString() || '100',
        tags: e.tags?.join(', ') || '', status: e.status || 'published',
      });
    }).catch(() => { toast.error('Event not found'); navigate('/organizer'); });
  }, [id, navigate]);

  const handleSubmit = async (fd) => {
    setLoading(true);
    try {
      const { data } = await eventsAPI.update(id, fd);
      toast.success('Event updated!');
      navigate(`/events/${data.event._id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  if (!initialData) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="page-title mb-1">Edit Event</h1>
          <p className="text-gray-500">Update your event details</p>
        </div>
        <EventForm initialData={initialData} onSubmit={handleSubmit} loading={loading} title="Save Changes →" />
      </div>
    </div>
  );
}

export default CreateEvent;
