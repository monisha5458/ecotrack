import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const token = localStorage.getItem('jwtToken');
  const userId = localStorage.getItem('userId');
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });

const fetchFollowStats = useCallback(async () => {
  try {
    const response = await axios.get(`http://localhost:3000/community/user/${userId}/followstats`);
    setFollowStats(response.data);
  } catch (error) {
    console.error('Error fetching follow stats:', error);
  }
}, [userId]);

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:3000/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  }, [userId, token]);

  const fetchUserPosts = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:3000/community/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('User posts response:', response.data);
      
      // Process each post to ensure image URLs are correct
      const processedPosts = response.data.map(post => {
        // Process image URL properly
        let imageUrl = null;
        
        // Check for the imageUrl field from backend
        if (post.imageUrl) {
          if (post.imageUrl.startsWith('http')) {
            imageUrl = post.imageUrl;
          } else {
            imageUrl = `http://localhost:3000${post.imageUrl}`;
          }
          console.log(`Post ${post._id} image URL from imageUrl field:`, imageUrl);
        } 
        // Fallback to image field if present
        else if (post.image) {
          if (post.image.startsWith('http')) {
            imageUrl = post.image;
          } else {
            imageUrl = `http://localhost:3000/${post.image}`;
          }
          console.log(`Post ${post._id} image URL from image field:`, imageUrl);
        }
        
        return {
          ...post,
          image: imageUrl
        };
      });
      
      setUserPosts(processedPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError('Failed to fetch user posts');
    }
  }, [userId, token]);

  useEffect(() => {
    if (!token || !userId) {
      navigate('/authpage');
      return;
    }
    Promise.all([fetchUserData(), fetchUserPosts(), fetchFollowStats()]);
  }, [token, userId, navigate, fetchUserData, fetchUserPosts, fetchFollowStats]);

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:3000/community/${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUserPosts(userPosts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post');
    }
  };

  const handleFollow = async () => {
    try {
      await axios.post(`http://localhost:3000/community/follow/${userId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIsFollowing(true);
      fetchFollowStats();
    } catch (error) {
      setError('Failed to follow user');
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.delete(`http://localhost:3000/community/unfollow/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIsFollowing(false);
      fetchFollowStats();
    } catch (error) {
      setError('Failed to unfollow user');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearchError('');
    try {
      const response = await axios.get(
        `http://localhost:3000/community/search/users?q=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResults(response.data);
    } catch (err) {
      setSearchError('No users found or error searching.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const followUser = async (id) => {
    try {
      await axios.post(`http://localhost:3000/community/follow/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(results =>
        results.map(u => u._id === id ? { ...u, isFollowing: true } : u)
      );
    } catch (err) {
      setError('Failed to follow user');
    }
  };

  const unfollowUser = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/community/unfollow/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(results =>
        results.map(u => u._id === id ? { ...u, isFollowing: false } : u)
      );
    } catch (err) {
      setError('Failed to unfollow user');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-500">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* User Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search users by name"
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded"
              disabled={searchLoading}
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
          {searchError && <div className="text-red-500 mb-2">{searchError}</div>}
          {searchResults.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Search Results:</h3>
              <ul>
                {searchResults.map(user => (
                  <li key={user._id} className="flex items-center justify-between border-b py-2">
                    <div>
                      <span className="font-bold">{user.name}</span>
                      <span className="ml-2 text-gray-500">{user.email}</span>
                    </div>
                    {user._id !== userId && (
                      user.isFollowing ? (
                        <button
                          onClick={() => unfollowUser(user._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          Unfollow
                        </button>
                      ) : (
                        <button
                          onClick={() => followUser(user._id)}
                          className="bg-green-500 text-white px-3 py-1 rounded"
                        >
                          Follow
                        </button>
                      )
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              {userData.profilePicture ? (
                <img
                  src={userData.profilePicture.startsWith('http') ? 
                    userData.profilePicture : 
                    `http://localhost:3000${userData.profilePicture}`}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    console.log('Profile image load error, using fallback');
                    e.target.onerror = null; // Prevent infinite loops
                    e.target.src = 'https://via.placeholder.com/150?text=Profile';
                  }}
                />
              ) : (
                <span className="text-4xl text-gray-500">
                  👨‍💼
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{userData.name}</h1>
              <p className="text-gray-600">{userData.email}</p>
              <p className="text-gray-500">Member since {new Date(userData.createdAt).toLocaleDateString()}</p>
              <div className="flex space-x-4 mt-2">
                <span className="font-semibold">{followStats.followers}</span> Followers
                <span className="font-semibold">{followStats.following}</span> Following
              </div>
            </div>
          </div>
        </div>

        {/* User Posts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">My Posts</h2>
          {userPosts.length > 0 ? (
            <div className="space-y-6">
              {userPosts.map(post => (
                <div key={post._id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  {post.postTitle && <h3 className="font-semibold text-lg text-green-800">{post.postTitle}</h3>}
                  <p className="text-gray-700 mt-2">{post.postCaption || post.content}</p>
                  
                  {post.image && (
                    <div className="mt-3 border rounded-lg overflow-hidden">
                      <img
                        src={post.image}
                        alt="Post content"
                        className="max-w-full h-auto object-contain max-h-96"
                        onError={(e) => {
                          console.log('Image load error in profile, using fallback for:', post.image);
                          e.target.onerror = null; // Prevent infinite loops
                          
                          // Try different approaches to fix the URL
                          if (post.image.includes('localhost:3000')) {
                            e.target.src = `http://localhost:3000/uploads/${post.image.split('/').pop()}`;
                          } else {
                            e.target.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800';
                          }
                        }}
                        style={{ 
                          display: 'block', 
                          margin: '0 auto', 
                          padding: '8px'
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="mt-3 flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-gray-500 text-sm">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                    <div className="flex space-x-3">
                      <span className="text-gray-600 text-sm flex items-center">
                        <span className="mr-1">❤️</span> {post.likes || 0}
                      </span>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="text-red-500 hover:text-red-700 flex items-center"
                      >
                        <span className="mr-1">🗑️</span>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-3">You haven't created any posts yet</p>
              <button
                onClick={() => navigate('/create-post')}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Create Your First Post
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;