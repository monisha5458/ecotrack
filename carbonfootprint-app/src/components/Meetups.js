import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Meetup images based on themes
const meetupImages = {
  "Beach Cleanup": "https://images.unsplash.com/photo-1618477202872-2a4f24758dc2?q=80&w=800",
  "Tree Planting": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800",
  "Recycling Workshop": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=800",
  "Carbon Footprint": "https://images.unsplash.com/photo-1623011538548-ab0db7101233?q=80&w=800",
  "Renewable Energy": "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800",
  "Sustainable Living": "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=800",
  "Climate Change": "https://images.unsplash.com/photo-1611273426858-450e7978afad?q=80&w=800",
  "Conservation": "https://images.unsplash.com/photo-1550236520-7050f3582da0?q=80&w=800",
  "default": "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=800"
};

// Function to get image based on meetup theme
const getMeetupImage = (theme) => {
  const lowerTheme = theme.toLowerCase();
  
  for (const [key, url] of Object.entries(meetupImages)) {
    if (lowerTheme.includes(key.toLowerCase())) {
      return url;
    }
  }
  
  return meetupImages.default;
};

const Meetups = () => {
  const navigate = useNavigate();
  const [meetups, setMeetups] = useState([]);
  const [newMeetup, setNewMeetup] = useState({
    theme: '',
    location: '',
    date: '',
    isOnline: false,
    link: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const userId = localStorage.getItem('userId'); 
  const token = localStorage.getItem('jwtToken');

  const fetchMeetups = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3000/community/meetups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMeetups(response.data);
    } catch (error) {
      console.error('Error fetching meetups:', error);
      setError('Failed to fetch meetups');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/authpage');
      return;
    }
    fetchMeetups();
  }, [token, navigate, fetchMeetups]);

  const handleCreateMeetup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/community/meetup', newMeetup, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNewMeetup({
        theme: '',
        location: '',
        date: '',
        isOnline: false,
        link: '',
        description: ''
      });
      setShowCreateForm(false);
      fetchMeetups();
    } catch (error) {
      console.error('Error creating meetup:', error);
      setError('Failed to create meetup');
    }
  };

  const handleJoinMeetup = async (meetupId) => {
    try {
      await axios.post(`http://localhost:3000/community/meetups/${meetupId}/join`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update the local state immediately to show the user as joined
      // and increment the participants count without waiting for fetchMeetups
      setMeetups(prevMeetups => 
        prevMeetups.map(meetup => {
          if (meetup._id === meetupId) {
            // Create a new participants array if it doesn't exist
            const participants = meetup.participants || [];
            
            // Only add the user if they're not already in the list
            if (!participants.some(p => p.userId === userId)) {
              // Create a new participant entry with the current user ID
              const newParticipant = { userId };
              
              return {
                ...meetup, 
                participants: [...participants, newParticipant]
              };
            }
          }
          return meetup;
        })
      );
      
      // Then refresh from server to ensure data consistency
      fetchMeetups();
    } catch (error) {
      console.error('Error joining meetup:', error);
      setError('Failed to join meetup');
    }
  };

  const handleDeleteMeetup = async (meetupId) => {
    try {
      await axios.delete(`http://localhost:3000/community/meetups/${meetupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMeetups(); // Refresh the list
    } catch (error) {
      console.error('Error deleting meetup:', error);
      setError('Failed to delete meetup');
    }
  };
  
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isUserJoined = (meetup) => {
    return meetup.participants?.some(participant => participant.userId === userId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">Community Meetups</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-md"
          >
            <span className="mr-2">➕</span>
            {showCreateForm ? 'Cancel' : 'Create Meetup'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Create Meetup Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transition-all border border-green-100">
            <h2 className="text-xl font-bold mb-4 text-green-800">Create New Meetup</h2>
            <form onSubmit={handleCreateMeetup}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                  <input
                    type="text"
                    value={newMeetup.theme}
                    onChange={(e) => setNewMeetup({...newMeetup, theme: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 px-3 py-2"
                    required
                    placeholder="e.g. Beach Cleanup, Tree Planting"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newMeetup.location}
                    onChange={(e) => setNewMeetup({...newMeetup, location: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 px-3 py-2"
                    required
                    placeholder="e.g. City Park, Community Center"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newMeetup.date}
                    onChange={(e) => setNewMeetup({...newMeetup, date: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 px-3 py-2"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isOnline"
                    checked={newMeetup.isOnline}
                    onChange={(e) => setNewMeetup({...newMeetup, isOnline: e.target.checked})}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isOnline" className="ml-2 block text-sm font-medium text-gray-700">
                    Online Meeting
                  </label>
                </div>
                {newMeetup.isOnline && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                    <input
                      type="url"
                      value={newMeetup.link}
                      onChange={(e) => setNewMeetup({...newMeetup, link: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 px-3 py-2"
                      required
                      placeholder="e.g. https://zoom.us/j/123456789"
                    />
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newMeetup.description}
                    onChange={(e) => setNewMeetup({...newMeetup, description: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 px-3 py-2"
                    rows="3"
                    placeholder="Describe the meetup purpose and what participants should expect"
                  ></textarea>
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors shadow-md flex items-center"
                >
                  <span className="mr-2">✅</span>
                  Create Meetup
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Meetups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetups.length > 0 ? (
            meetups.map(meetup => {
              const isJoined = isUserJoined(meetup);
              const meetupImage = getMeetupImage(meetup.theme);
              
              return (
                <div key={meetup._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow transform hover:-translate-y-1 duration-300 border border-green-100">
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={meetupImage} 
                      alt={meetup.theme} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 m-2 rounded-lg text-sm font-semibold shadow-md">
                      {meetup.isOnline ? '🌐 Online' : '📍 In-person'}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-xl mb-2 text-green-800">{meetup.theme}</h3>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <span className="mr-2 text-green-500">📅</span>
                      <span>{formatDate(meetup.date)}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      {meetup.isOnline ? (
                        <>
                          <span className="mr-2 text-blue-500">🔗</span>
                          <span>Online Meeting</span>
                        </>
                      ) : (
                        <>
                          <span className="mr-2 text-red-500">📍</span>
                          <span>{meetup.location}</span>
                        </>
                      )}
                    </div>
                    
                    {meetup.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{meetup.description}</p>
                    )}
                    
                    <div className="flex items-center mb-4">
                      <span className="mr-2 text-gray-500">👥</span>
                      <span className="text-sm text-gray-500">
                        <strong>{meetup.participants?.length || 0}</strong> participants
                      </span>
                      {isJoined && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          You joined
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      {meetup.isOnline && meetup.link && (
                        <a
                          href={meetup.link.startsWith('http') ? meetup.link : `https://${meetup.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md flex items-center"
                        >
                          <span className="mr-1">💻</span>
                          Join Online Meeting
                        </a>
                      )}
                      
                      <div className="flex space-x-2 ml-auto">
                        {meetup.createdBy === userId && (
                          <button
                            onClick={() => handleDeleteMeetup(meetup._id)}
                            className="text-red-500 hover:text-red-700 px-3 py-1 rounded-lg border border-red-500 hover:bg-red-50 transition-colors flex items-center"
                          >
                            <span className="mr-1">🗑️</span>
                            Delete
                          </button>
                        )}
                        
                        {/* Only show Join button for in-person meetings */}
                        {!meetup.isOnline && (
                          <button
                            onClick={() => handleJoinMeetup(meetup._id)}
                            disabled={isJoined}
                            className={`px-4 py-1 rounded-lg flex items-center ${
                              isJoined
                                ? 'bg-green-100 text-green-700 border border-green-500'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            } transition-colors shadow-sm`}
                          >
                            {isJoined ? (
                              <>
                                <span className="mr-1">✅</span>
                                Joined
                              </>
                            ) : (
                              <>
                                <span className="mr-1">➕</span>
                                Join
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-xl shadow-md p-8 text-center border border-green-100">
              <p className="text-gray-500 mb-4">No meetups available. Be the first to create one!</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg inline-flex items-center shadow-md"
              >
                <span className="mr-2">➕</span>
                Create Meetup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Meetups;