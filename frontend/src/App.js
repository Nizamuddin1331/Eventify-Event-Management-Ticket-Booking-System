import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Spinner from './components/common/Spinner';

// Lazy-load pages for code splitting
const Home           = lazy(() => import('./pages/Home'));
const Events         = lazy(() => import('./pages/Events'));
const EventDetail    = lazy(() => import('./pages/EventDetail'));
const Login          = lazy(() => import('./pages/Login'));
const Register       = lazy(() => import('./pages/Register'));
const Profile        = lazy(() => import('./pages/Profile'));
const BookingPage    = lazy(() => import('./pages/BookingPage'));
const BookingConfirm = lazy(() => import('./pages/BookingConfirm'));
const MyBookings     = lazy(() => import('./pages/MyBookings'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const OrganizerDash  = lazy(() => import('./pages/OrganizerDashboard'));
const CreateEvent    = lazy(() => import('./pages/CreateEvent'));
const EditEvent      = lazy(() => import('./pages/EditEvent'));
const NotFound       = lazy(() => import('./pages/NotFound'));

// Route Guards
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const OrganizerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'organizer' && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/events/:id/book" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
            <Route path="/bookings/:id/confirm" element={<PrivateRoute><BookingConfirm /></PrivateRoute>} />
            <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/organizer" element={<OrganizerRoute><OrganizerDash /></OrganizerRoute>} />
            <Route path="/events/create" element={<OrganizerRoute><CreateEvent /></OrganizerRoute>} />
            <Route path="/events/:id/edit" element={<OrganizerRoute><EditEvent /></OrganizerRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', padding: '12px 16px' },
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
