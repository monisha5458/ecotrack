import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const CommunityPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [environmentalNews, setEnvironmentalNews] = useState([]);
  const [environmentalSchemes, setEnvironmentalSchemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [activeTab, setActiveTab] = useState('feed');
  const [imageLoadStatus, setImageLoadStatus] = useState({});

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('jwtToken');

  // Real environmental topics with links
  const trendingTopics = [
    { 
      tag: '#CarbonFootprint', 
      posts: Math.floor(Math.random() * 1000) + 400, 
      url: 'https://www.nature.org/en-us/get-involved/how-to-help/carbon-footprint-calculator/'
    },
    { 
      tag: '#ClimateAction',
      posts: Math.floor(Math.random() * 1000) + 500,
      url: 'https://www.un.org/en/climatechange/climate-action'
    },
    { 
      tag: '#Sustainability',
      posts: Math.floor(Math.random() * 1000) + 600,
      url: 'https://www.epa.gov/sustainability'
    },
    { 
      tag: '#GreenEnergy',
      posts: Math.floor(Math.random() * 1000) + 300,
      url: 'https://www.nrel.gov/'
    },
    { 
      tag: '#ZeroWaste',
      posts: Math.floor(Math.random() * 1000) + 450,
      url: 'https://www.epa.gov/transforming-waste-tool'
    }
  ];

  // Environmental accounts for "Who to Follow"
  const accountsToFollow = [
    { 
      name: 'Green Earth Initiative', 
      bio: 'Promoting sustainable living practices',
      website: 'https://www.greenpeace.org/'
    },
    { 
      name: 'Climate Action Network', 
      bio: 'Global network fighting climate change',
      website: 'https://climatenetwork.org/' 
    },
    { 
      name: 'Eco Warriors', 
      bio: 'Community of environmental activists',
      website: 'https://www.earthday.org/'
    }
  ];

  const handleLogout = useCallback(() => {
    localStorage.removeItem('userId');
    localStorage.removeItem('jwtToken');
      navigate('/authpage');
  }, [navigate]);

  const fetchUserData = useCallback(async () => {
    try {
      if (!userId || !token) {
        throw new Error('Missing userId or token');
      }
  
      const response = await axios.get(`http://localhost:3000/carbonTrack/profile/${userId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
  
      if (response.data) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        setError('Failed to fetch user data');
      }
    }
  }, [userId, token, handleLogout]);

  const fetchNewsAndSchemes = useCallback(async () => {
    try {
      if (!token) {
        throw new Error('No token available');
      }

      // Fetch environmental news from NewsAPI
      const newsResponse = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: '(environment OR carbon footprint OR climate change OR environmental protection OR sustainability) AND (reduction OR initiative OR technology OR policy)',
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 6,
          apiKey: '22f8fc1e558e410fabdeffac7981d369',
          domains: 'bbc.com,reuters.com,guardian.co.uk,nytimes.com,un.org,ipcc.ch,unfccc.int'
        }
      });

      // Transform news data with better filtering
      const formattedNews = newsResponse.data.articles
        .filter(article => {
          const title = article.title.toLowerCase();
          const description = article.description?.toLowerCase() || '';
          const keywords = [
            'carbon', 'footprint', 'climate', 'environment', 'sustainability',
            'emission', 'renewable', 'green', 'eco', 'nature'
          ];
          return keywords.some(keyword => 
            title.includes(keyword) || description.includes(keyword)
          );
        })
        .map(article => ({
          title: article.title,
          content: article.description,
          link: article.url,
          imageUrl: article.urlToImage,
          publishedAt: article.publishedAt,
          source: article.source.name
        }));

      // Environmental schemes focused on carbon footprint reduction
      const schemes = [
        {
          title: 'Carbon Footprint Calculator',
          description: 'Learn to calculate and reduce your personal carbon footprint with our interactive tools and community challenges.',
          link: 'https://www.carbonfootprint.com',
          imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa'
        },
        {
          title: 'Green Energy Transition',
          description: 'Support the transition to renewable energy sources and learn about solar, wind, and other sustainable energy options.',
          link: 'https://www.irena.org',
          imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276'
        },
        {
          title: 'Sustainable Transportation',
          description: 'Discover eco-friendly transportation options and join our community carpooling and cycling initiatives.',
          link: 'https://www.sustainabletransport.org',
          imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b'
        },
        {
          title: 'Zero Waste Challenge',
          description: 'Join our community-wide zero waste challenge and learn practical ways to reduce, reuse, and recycle.',
          link: 'https://www.zerowaste.org',
          imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b'
        },
        {
          title: 'Carbon Offset Projects',
          description: 'Support verified carbon offset projects including reforestation and renewable energy initiatives.',
          link: 'https://www.goldstandard.org',
          imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368'
        },
        {
          title: 'Sustainable Living',
          description: 'Participate in workshops on sustainable living, energy efficiency, and eco-friendly home improvements.',
          link: 'https://www.sustainableliving.org',
          imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba'
        }
      ];

      setEnvironmentalNews(formattedNews);
      setEnvironmentalSchemes(schemes);
    } catch (error) {
      console.error('Error fetching news and schemes:', error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        setError('Failed to fetch news and schemes');
      }
    }
  }, [token, handleLogout]);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3000/community', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log('API posts response:', response.data);
      
      if (!response.data || response.data.length === 0) {
        setPosts([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch user details for each post
      const postsWithUserDetails = await Promise.all(
        response.data.map(async (post) => {
          try {
            const userResponse = await axios.get(`http://localhost:3000/carbonTrack/profile/${post.userId}`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            
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
              userDetails: userResponse.data,
              image: imageUrl,
              processedImage: true // Add flag to indicate image URL has been processed
            };
          } catch (error) {
            console.error(`Error fetching user details for post ${post._id}:`, error);
            return { ...post, userDetails: { name: 'Unknown User' } };
          }
        })
      );
      
      // Sort posts by creation date (newest first)
      const sortedPosts = postsWithUserDetails.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      console.log('Processed posts:', sortedPosts);
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        setError('Failed to fetch posts');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, handleLogout]);

  const handleLike = useCallback(async (postId) => {
    try {
      // Check if user already liked this post
    if (likedPosts.has(postId)) {
        console.log('User already liked this post');
        setError('You already liked this post');
      return;
    }

      const response = await axios.post(`http://localhost:3000/community/${postId}/like`, 
        { userId }, // Send the user ID in the request body
        {
        headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      // Check if the backend response indicates a successful like
      if (response.data && response.data.likes !== undefined) {
        // Update the post with the new likes count
      setPosts(posts.map(post =>
        post._id === postId ? { ...post, likes: response.data.likes } : post
      ));
        
        // Add this post to the liked posts set
        setLikedPosts(prevLikedPosts => {
          const newLikedPosts = new Set(prevLikedPosts);
          newLikedPosts.add(postId);
          return newLikedPosts;
        });
      } else {
        console.error('Invalid response from like endpoint:', response.data);
        setError('Failed to like post: Invalid response');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      if (error.response && error.response.status === 400) {
        // The backend might return a 400 status if the user already liked the post
        setError(error.response.data.message || 'You already liked this post');
        
        // Update the likedPosts set to include this post
        setLikedPosts(prevLikedPosts => {
          const newLikedPosts = new Set(prevLikedPosts);
          newLikedPosts.add(postId);
          return newLikedPosts;
        });
      } else {
        setError('Failed to like post. Please try again.');
      }
    }
  }, [token, posts, likedPosts, userId]);

  const handleDeletePost = useCallback(async (postId) => {
    try {
      await axios.delete(`http://localhost:3000/community/${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post');
    }
  }, [token, posts]);

  // Add a function to fetch user's liked posts
  const fetchLikedPosts = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:3000/community/user/likes`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.data && Array.isArray(response.data)) {
        // Create a Set of post IDs that the user has liked
        const likedPostIds = new Set(response.data.map(post => post.postId));
        setLikedPosts(likedPostIds);
        console.log('Fetched liked posts:', likedPostIds);
      }
    } catch (error) {
      console.error('Error fetching liked posts:', error);
      // Don't set an error message for this, as it's not critical
    }
  }, [token]);

  useEffect(() => {
    if (!userId || !token) {
      navigate('/authpage');
      return;
    }

    // Check if we need to force refresh (coming from post creation)
    const forceRefresh = localStorage.getItem('forceRefresh');
    if (forceRefresh === 'true') {
      console.log('Force refreshing community page after post creation');
      localStorage.removeItem('forceRefresh'); // Clear the flag
    }

    const initializeData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchUserData(),
          fetchPosts(),
          fetchNewsAndSchemes(),
          fetchLikedPosts() // Add this to the list of promises
        ]);
        console.log('Data initialized successfully');
    } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [userId, token, navigate, fetchUserData, fetchPosts, fetchNewsAndSchemes, fetchLikedPosts]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
                </div>
              )}

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-20">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2 text-green-500">🌱</span>
                Community Hub
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${
                    activeTab === 'feed'
                      ? 'bg-green-100 text-green-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">🌐</span>
                  <span className="font-medium">Community Feed</span>
                </button>
                <button
                  onClick={() => setActiveTab('news')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${
                    activeTab === 'news'
                      ? 'bg-green-100 text-green-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">📰</span>
                  <span className="font-medium">Environmental News</span>
                </button>
                <button
                  onClick={() => setActiveTab('schemes')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${
                    activeTab === 'schemes'
                      ? 'bg-green-100 text-green-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">🌍</span>
                  <span className="font-medium">Environmental Schemes</span>
                </button>
                <Link
                  to="/meetups"
                  className="w-full text-left px-4 py-3 rounded-lg flex items-center hover:bg-gray-100 transition-colors"
                >
                  <span className="mr-3">📅</span>
                  <span className="font-medium">Community Meetups</span>
                </Link>
              </div>

              {userData && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-2">Your Profile</h3>
                  <div className="flex items-center">
                    {userData.profileImage ? (
                      <img 
                        src={userData.profileImage.startsWith('http') ? userData.profileImage : `http://localhost:3000/${userData.profileImage}`} 
                        alt={userData.name} 
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80?text=User';
                        }}
                      />
                    ) : (
                      <span className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 text-2xl">👨‍💼</span>
                    )}
                    <div className="ml-3">
                      <p className="font-medium">{userData.name}</p>
                      <p className="text-sm text-gray-500">{userData.email}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Link 
                      to="/create-post"
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <span>Create Post</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'feed' && (
              <div className="space-y-4">
                {posts.length > 0 ? (
                  posts.map((post) => {
                    console.log('Rendering post:', post._id, 
                      { 
                        hasImage: !!post.image,
                        imageUrl: post.image,
                        userId: post.userId,
                        content: post.content?.substring(0, 30) + '...'
                      }
                    );
                    return (
                      <div key={post._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {/* Post Header */}
                        <div className="p-4 flex items-start">
                          <div className="flex-shrink-0">
                            {post.userDetails?.profileImage ? (
                            <img
                                src={post.userDetails.profileImage.startsWith('http') 
                                    ? post.userDetails.profileImage 
                                    : `http://localhost:3000/${post.userDetails.profileImage}`} 
                                alt={post.userDetails.name} 
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/40?text=User';
                                }}
                            />
                          ) : (
                              <span className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 text-xl">👨‍💼</span>
                          )}
                        </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{post.userDetails?.name || 'Unknown User'}</p>
                                <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
                        </div>
                              {post.userId === userId && (
                        <button
                          onClick={() => handleDeletePost(post._id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                                  <span>🗑️</span>
                        </button>
                      )}
                    </div>
                            <p className="mt-2 text-gray-800">{post.content}</p>
                          </div>
                    </div>

                        {/* Post Image */}
                        {post.image && (
                          <div className="relative border-t border-gray-100">
                        <img
                              src={post.image}
                              alt="Post content"
                              className="w-full h-auto object-contain max-h-96 mt-2"
                              onLoad={() => {
                                console.log('Image loaded successfully:', post.image);
                                setImageLoadStatus(prev => ({
                                  ...prev,
                                  [post._id]: 'loaded'
                                }));
                              }}
                          onError={(e) => {
                                console.log('Image load error, using fallback for:', post.image);
                                setImageLoadStatus(prev => ({
                                  ...prev,
                                  [post._id]: 'error'
                                }));
                                e.target.onerror = null; // Prevent infinite loops
                                
                                // Try to get just the filename from the path
                                const filename = post.image.split('/').pop();
                                
                                // Try direct URL to uploads folder with just the filename
                                e.target.src = `http://localhost:3000/uploads/${filename}`;
                                console.log('Fallback image URL:', `http://localhost:3000/uploads/${filename}`);
                              }}
                              style={{ 
                                display: 'block', 
                                margin: '0 auto', 
                                border: '1px solid #eee', 
                                padding: '5px',
                                borderRadius: '4px'
                              }}
                            />
                            
                            {/* Show a message if image is still loading or had error */}
                            {imageLoadStatus[post._id] === 'error' && (
                              <div className="text-center mt-2 text-xs text-gray-500">
                                Image might not display correctly. 
                                <a 
                                  href={post.image} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-500 ml-1 hover:underline"
                                >
                                  Click to view directly
                                </a>
                              </div>
                            )}
                      </div>
                    )}

                        {/* Post Actions */}
                        <div className="px-4 py-3 border-t border-gray-100 flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(post._id)}
                            className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                      >
                            {likedPosts.has(post._id) ? (
                              <span className="text-red-500">❤️</span>
                            ) : (
                              <span>🤍</span>
                            )}
                            <span>{post.likes || 0}</span>
                      </button>
                      <Link
                        to={`/comments/${post._id}`}
                            className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                      >
                            <span>💬</span>
                            <span>{post.comments?.length || 0}</span>
                      </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <p className="text-gray-500">No posts available. Be the first to share!</p>
                    <Link
                      to="/create-post"
                      className="mt-4 inline-block bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
                    >
                      Create Post
                    </Link>
                    </div>
                )}
                </div>
            )}

            {activeTab === 'news' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Environmental News</h2>
                {environmentalNews.length > 0 ? (
                  environmentalNews.map((news, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="md:flex">
                        {news.imageUrl && (
                          <div className="md:flex-shrink-0">
                          <img
                              className="h-48 w-full object-cover md:w-48"
                            src={news.imageUrl}
                            alt={news.title}
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800';
                            }}
                          />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="uppercase tracking-wide text-sm text-green-500 font-semibold">
                            {news.source}
                          </div>
                          <a
                            href={news.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mt-1 text-lg leading-tight font-semibold text-gray-900 hover:underline"
                          >
                            {news.title}
                          </a>
                          <p className="mt-2 text-gray-600">{news.content}</p>
                          <p className="mt-2 text-xs text-gray-500">
                            {new Date(news.publishedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <p className="text-gray-500">No news available at the moment.</p>
                  </div>
                )}
                </div>
            )}

            {activeTab === 'schemes' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Environmental Schemes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {environmentalSchemes.map((scheme, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                          <img
                        className="h-48 w-full object-cover"
                            src={scheme.imageUrl}
                            alt={scheme.title}
                            onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800';
                            }}
                          />
                        <div className="p-4">
                        <h3 className="font-semibold text-lg">{scheme.title}</h3>
                        <p className="mt-2 text-gray-600">{scheme.description}</p>
                          <a
                            href={scheme.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          className="mt-3 inline-block text-green-500 hover:text-green-600"
                          >
                          Learn more →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Trending Topics */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-xl font-bold mb-4">Trending Topics</h2>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <a 
                      href={topic.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline cursor-pointer"
                    >
                      {topic.tag}
                    </a>
                    <span className="text-xs text-gray-500">{topic.posts} posts</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Upcoming Meetups */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2 text-green-500">📅</span>
                Upcoming Meetups
              </h2>
              <div className="space-y-3">
                <div className="border-l-4 border-green-500 pl-3">
                  <h3 className="font-medium">Beach Cleanup Drive</h3>
                  <p className="text-sm text-gray-500">This Saturday, 9:00 AM</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-3">
                  <h3 className="font-medium">Carbon Footprint Workshop</h3>
                  <p className="text-sm text-gray-500">Next Tuesday, 6:00 PM</p>
                </div>
                <Link 
                  to="/meetups" 
                  className="block text-center text-green-600 hover:text-green-700 mt-4"
                >
                  View all meetups →
                </Link>
              </div>
            </div>
            
            {/* Who to Follow */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-xl font-bold mb-4">Who to Follow</h2>
              <div className="space-y-4">
                {accountsToFollow.map((profile, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 text-xl">🌍</span>
                    <div className="ml-3 flex-1">
                      <p className="font-medium">{profile.name}</p>
                      <p className="text-xs text-gray-500">{profile.bio}</p>
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-green-600 hover:underline"
                      >
                        Website
                      </a>
                    </div>
                    <button className="text-sm bg-green-100 text-green-600 px-3 py-1 rounded-full hover:bg-green-200">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default CommunityPage;