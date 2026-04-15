import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const user = await login(form);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'organizer' ? '/organizer' : from, { replace: true });
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const fillDemo = (role) => {
    const creds = { admin: { email: 'admin@eventify.com', password: 'Admin@123' }, organizer: { email: 'alice@eventify.com', password: 'Alice@123' }, user: { email: 'charlie@eventify.com', password: 'Charlie@123' } };
    setForm(creds[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="text-2xl font-bold text-gray-900" style={{fontFamily:'DM Serif Display,serif'}}>Eventify</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{fontFamily:'DM Serif Display,serif'}}>Welcome back</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        {/* Demo credentials */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-sm">
          <p className="font-semibold text-blue-700 mb-2">🔑 Demo Accounts</p>
          <div className="flex flex-wrap gap-2">
            {['admin','organizer','user'].map(role => (
              <button key={role} onClick={() => fillDemo(role)} className="px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 capitalize text-xs font-medium transition-colors">{role}</button>
            ))}
          </div>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} className="input-field pr-12" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Signing in...</span> : 'Sign In →'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account? <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-800">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user', phone: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone });
      navigate(user.role === 'organizer' ? '/organizer' : '/');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="text-2xl font-bold text-gray-900" style={{fontFamily:'DM Serif Display,serif'}}>Eventify</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{fontFamily:'DM Serif Display,serif'}}>Create your account</h1>
          <p className="text-gray-500">Join thousands of event lovers</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} className="input-field" placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (optional)</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} className="input-field" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">I want to</label>
              <div className="grid grid-cols-2 gap-2">
                {[['user','🎟 Attend Events'],['organizer','🎪 Organise Events']].map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setForm(f=>({...f,role:val}))} className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-colors ${form.role === val ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass?'text':'password'} value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} className="input-field pr-12" placeholder="Min 6 characters" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPass?'🙈':'👁'}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm(f=>({...f,confirmPassword:e.target.value}))} className={`input-field ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-400' : ''}`} placeholder="Repeat password" required />
              {form.confirmPassword && form.password !== form.confirmPassword && <p className="text-red-500 text-xs mt-1">Passwords don't match</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Creating account...</span> : 'Create Account →'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
