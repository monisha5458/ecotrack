import './App.css';
import React from 'react';
import HomePage from './components/HomePage';
import CarbonTracker from './components/CarbonTracker';
import AuthPage from './components/AuthPage';        
import CommunityPage from './components/CommunityPage';
import LocationPage from './components/LocationPage';
import CommentsPage from './components/CommentsPage'; // Import the new CommentsPage component
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import GetStartedPage from './components/GetStartedPage';
import CreatePost from './components/CreatePost';
import Profile from './components/Profile';
import Meetups from './components/Meetups';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('jwtToken');
  return token ? children : <Navigate to="/authpage" />;
};

// Component to conditionally render Navbar
const AppContent = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/getstarted', '/carbontracker', '/authpage'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-100">
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<GetStartedPage />} />
        <Route path="/getstarted" element={<GetStartedPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/carbontracker" element={<CarbonTracker />} />
        <Route
          path="/community"
          element={
            <PrivateRoute>
              <CommunityPage />
            </PrivateRoute>
          }
        />
        <Route path="/authpage" element={<AuthPage />} />
        <Route path="/location" element={<LocationPage />} />
        <Route
          path="/create-post"
          element={
            <PrivateRoute>
              <CreatePost />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/meetups"
          element={
            <PrivateRoute>
              <Meetups />
            </PrivateRoute>
          }
        />
        <Route path="/comments/:postId" element={<CommentsPage />} /> {/* Route for Comments Page */}
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
