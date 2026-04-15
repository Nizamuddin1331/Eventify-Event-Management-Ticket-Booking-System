// Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-white" style={{fontFamily:'DM Serif Display, serif'}}>Eventify</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">Discover, book, and experience the best events near you. From tech conferences to music festivals.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/events" className="hover:text-white transition-colors">All Events</Link></li>
              <li><Link to="/events?category=music" className="hover:text-white transition-colors">Music</Link></li>
              <li><Link to="/events?category=tech" className="hover:text-white transition-colors">Technology</Link></li>
              <li><Link to="/events?category=sports" className="hover:text-white transition-colors">Sports</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/my-bookings" className="hover:text-white transition-colors">My Bookings</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Profile</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Eventify. Built with ❤️ for event lovers everywhere.
        </div>
      </div>
    </footer>
  );
}
