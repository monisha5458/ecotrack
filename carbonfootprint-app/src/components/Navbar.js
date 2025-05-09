import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('jwtToken');
  const userId = localStorage.getItem('userId');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userId');
    navigate('/authpage');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-green-300 border-b-2 border-green-300' : '';
  };

  return (
    <nav className="bg-gradient-to-r from-green-700 to-green-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="http://localhost:3001/home" className="flex items-center text-xl font-bold mr-6">
              <span className="mr-2 text-green-300">🌎</span>
              <span>EcoTrack</span>
            </Link>
            
            {/* Desktop Menu */}
            {token && (
              <div className="hidden md:flex items-center space-x-6">
                <Link to="http://localhost:3001/home" className={`flex items-center hover:text-green-300 transition-colors ${isActive('/home')}`}>
                  <span className="mr-1">🏠</span>
                  <span>Home</span>
                </Link>
                <Link to="/community" className={`flex items-center hover:text-green-300 transition-colors ${isActive('/community')}`}>
                  <span className="mr-1">👪</span>
                  <span>Community</span>
                </Link>
                <Link to="/carbontracker" className={`flex items-center hover:text-green-300 transition-colors ${isActive('/carbontracker')}`}>
                  <span className="mr-1">🧮</span>
                  <span>Carbon Tracker</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Right Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <>
                <Link to="/create-post" className={`flex items-center hover:text-green-300 transition-colors ${isActive('/create-post')}`}>
                  <span className="mr-1">➕</span>
                  <span>Create Post</span>
                </Link>
                <Link to="/meetups" className={`flex items-center hover:text-green-300 transition-colors ${isActive('/meetups')}`}>
                  <span className="mr-1">📅</span>
                  <span>Meetups</span>
                </Link>
                <Link to="/profile" className={`flex items-center hover:text-green-300 transition-colors ${isActive('/profile')}`}>
                  <span className="mr-1">👨‍💼</span>
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                >
                  <span className="mr-1">🚪</span>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/authpage"
                className="flex items-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors"
              >
                <span className="mr-1">🔑</span>
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && token && (
          <div className="md:hidden bg-green-800 rounded-b-lg shadow-lg pb-4">
            <div className="flex flex-col space-y-3 pt-3 px-2">
              <Link 
                to="http://localhost:3001/home" 
                className={`flex items-center px-3 py-2 rounded-md hover:bg-green-700 ${isActive('/home') ? 'bg-green-700' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-2">🏠</span>
                <span>Home</span>
              </Link>
              <Link 
                to="/community" 
                className={`flex items-center px-3 py-2 rounded-md hover:bg-green-700 ${isActive('/community') ? 'bg-green-700' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-2">👪</span>
                <span>Community</span>
              </Link>
              <Link 
                to="/carbontracker" 
                className={`flex items-center px-3 py-2 rounded-md hover:bg-green-700 ${isActive('/carbontracker') ? 'bg-green-700' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-2">🧮</span>
                <span>Carbon Tracker</span>
              </Link>
              <Link 
                to="/create-post" 
                className={`flex items-center px-3 py-2 rounded-md hover:bg-green-700 ${isActive('/create-post') ? 'bg-green-700' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-2">➕</span>
                <span>Create Post</span>
              </Link>
              <Link 
                to="/meetups" 
                className={`flex items-center px-3 py-2 rounded-md hover:bg-green-700 ${isActive('/meetups') ? 'bg-green-700' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-2">📅</span>
                <span>Meetups</span>
              </Link>
              <Link 
                to="/profile" 
                className={`flex items-center px-3 py-2 rounded-md hover:bg-green-700 ${isActive('/profile') ? 'bg-green-700' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-2">👨‍💼</span>
                <span>Profile</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center px-3 py-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
              >
                <span className="mr-2">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 