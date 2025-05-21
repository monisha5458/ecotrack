import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const CommentsPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const token = localStorage.getItem('jwtToken');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchPostWithComments();
    fetchCurrentUser();
  }, [postId]);

  // Fetch current user data
  const fetchCurrentUser = async () => {
    if (!token || !userId) return;
    
    try {
      const response = await axios.get(`http://localhost:3000/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data) {
        setCurrentUser(response.data);
        console.log("Current user:", response.data);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  // Fetch the post which includes comments
  const fetchPostWithComments = async () => {
    try {
      setError('');
      const response = await axios.get(`http://localhost:3000/community/${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.data) {
      setPost(response.data);
        
        // Process comments safely
        let processedComments = [];
        if (response.data.comments && Array.isArray(response.data.comments)) {
          // Filter out null comments
          processedComments = response.data.comments.filter(comment => comment !== null);
          
          // Try to enhance comments with user information
          for (let i = 0; i < processedComments.length; i++) {
            const comment = processedComments[i];
            if (typeof comment === 'string') continue;
            
            try {
              // Use post author as fallback
              const commentUserId = comment.userId || response.data.userId;
              if (commentUserId) {
                const userResponse = await axios.get(`http://localhost:3000/users/${commentUserId}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (userResponse.data) {
                  processedComments[i] = {
                    ...comment,
                    userDetails: userResponse.data
                  };
                }
              }
            } catch (error) {
              console.error("Error fetching user for comment:", error);
            }
          }
        }
        
        console.log("Fetched comments:", response.data.comments);
        console.log("Processed comments with users:", processedComments);
        setComments(processedComments);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to fetch post. Please try again.');
    }
  };

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    try {
      // Add the new comment to the post
      const response = await axios.post(
        `http://localhost:3000/community/${postId}/comment`, 
        { comment: commentText },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      console.log("Comment submission response:", response.data);

      // Add new comment with current user details
      if (currentUser) {
        const newComment = {
          text: commentText,
          createdAt: new Date().toISOString(),
          userDetails: currentUser
        };
        
        setComments(prev => [...prev, newComment]);
      }
      
      // Clear the comment text
      setCommentText('');
      
      // Refetch the post to get the latest data including comments
      setTimeout(() => fetchPostWithComments(), 500);

    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
    }
  };

  // Safely render a user avatar based on comment data
  const renderCommentAvatar = (comment) => {
    // Check for null or undefined
    if (comment === null || comment === undefined) {
      return 'X';
    }
    
    if (typeof comment === 'string') {
      return post?.userName?.[0]?.toUpperCase() || 'U';
    }
    
    try {
      // Check for userDetails from our enhancement
      if (comment.userDetails && comment.userDetails.name) {
        return comment.userDetails.name.charAt(0).toUpperCase();
      }
      
      if (comment.user && comment.user.name) {
        return comment.user.name.charAt(0).toUpperCase();
      }
      
      if (comment.userName) {
        return comment.userName.charAt(0).toUpperCase();
      }
    } catch (e) {
      console.error("Error rendering avatar:", e);
    }
    
    return 'U';
  };

  // Safely extract comment text from different formats
  const getCommentText = (comment) => {
    // First check if comment is null or undefined
    if (comment === null || comment === undefined) {
      return '(Empty comment)';
    }
    
    if (typeof comment === 'string') {
      return comment;
    }
    
    try {
      return comment.text || comment.comment || comment.content || '(No content)';
    } catch (e) {
      console.error("Error getting comment text:", e);
      return '(Error displaying comment)';
    }
  };

  // Safely get the username from a comment
  const getCommentUsername = (comment) => {
    // Check for null or undefined
    if (comment === null || comment === undefined) {
      return '(Unknown User)';
    }
    
    if (typeof comment === 'string') {
      return post?.userName || 'User';
    }
    
    try {
      // Check for userDetails from our enhancement
      if (comment.userDetails && comment.userDetails.name) {
        return comment.userDetails.name;
      }
      
      if (comment.user && comment.user.name) {
        return comment.user.name;
      }
      
      if (comment.userName) {
        return comment.userName;
      }
    } catch (e) {
      console.error("Error getting username:", e);
    }
    
    return 'User';
  };

  // Get profile picture URL
  const getProfilePicture = (comment) => {
    if (typeof comment === 'string' || !comment) return null;
    
    try {
      if (comment.userDetails && comment.userDetails.profilePicture) {
        const picUrl = comment.userDetails.profilePicture;
        return picUrl.startsWith('http') ? picUrl : `http://localhost:3000${picUrl}`;
      }
    } catch (e) {
      console.error("Error getting profile picture:", e);
    }
    
    return null;
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-gradient-to-r from-green-700 to-green-600 text-white p-4 flex justify-between items-center">
        <Link to="/community" className="text-white hover:text-green-200">
          <span className="mr-2">◀️</span> Back to Community
        </Link>
        <h1 className="text-xl font-bold">Comments</h1>
      </header>

      <main className="p-4">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {post ? (
          <div className="bg-white p-4 rounded shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">{post.postTitle || 'Post'}</h2>
            <p className="mb-4">{post.postCaption || post.content}</p>
            {(post?.imageUrl || post?.image) && (
              <img
                src={post.imageUrl ? 
                  (post.imageUrl.startsWith('http') ? post.imageUrl : `http://localhost:3000${post.imageUrl}`) : 
                  (post.image && post.image.startsWith('http') ? post.image : `http://localhost:3000${post.image || ''}`)}
                alt={post.postTitle || "Post image"}
                className="w-full h-64 object-cover mb-4 rounded-lg"
                onError={(e) => {
                  console.log('Image failed to load:', e);
                  e.target.src = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800";
                }}
              />
            )}

            <form onSubmit={handleCommentSubmit} className="mb-4">
              <textarea
                value={commentText}
                onChange={handleCommentChange}
                className="w-full px-3 py-2 border rounded-lg mb-4 focus:ring focus:ring-green-200 focus:border-green-500"
                rows="3"
                placeholder="Write your comment here..."
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md flex items-center"
              >
                <span className="mr-2">💬</span>
                Add Comment
              </button>
            </form>
            
            <h3 className="text-xl font-semibold mb-2">Comments</h3>
            {comments && comments.length > 0 ? (
              <ul className="space-y-4">
                {comments.map((comment, index) => 
                  // Skip rendering null comments, though we already filter them above
                  comment === null ? null : (
                    <li key={index} className="border-b py-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          {getProfilePicture(comment) ? (
                            <img 
                              src={getProfilePicture(comment)} 
                              alt="User" 
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40?text=User';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                              {renderCommentAvatar(comment)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="font-semibold text-sm">
                              {getCommentUsername(comment)}
                            </p>
                            {comment.userDetails && comment.userDetails._id === userId && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mt-1">
                            {getCommentText(comment)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {comment && comment.createdAt ? 
                              new Date(comment.createdAt).toLocaleString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                  </li>
                  )
                )}
              </ul>
            ) : (
              <p className="text-gray-500 py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CommentsPage;
