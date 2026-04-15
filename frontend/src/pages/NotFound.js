import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🎭</div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4" style={{fontFamily:'DM Serif Display,serif'}}>404</h1>
        <p className="text-xl text-gray-500 mb-2">Page not found</p>
        <p className="text-gray-400 mb-8">The event or page you're looking for doesn't exist or was moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/events" className="btn-secondary">Browse Events</Link>
        </div>
      </div>
    </div>
  );
}
