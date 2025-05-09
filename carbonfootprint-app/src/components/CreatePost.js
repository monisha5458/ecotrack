import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const navigate = useNavigate();
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('jwtToken');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setSelectedImage(file);
      
      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) {
      setError('Post content is required');
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('postTitle', postTitle || ''); // Make title optional
      formData.append('postCaption', postContent);
      
      if (selectedImage) {
        formData.append('image', selectedImage);
        console.log('Uploading image:', selectedImage.name, 'Size:', selectedImage.size, 'Type:', selectedImage.type);
      }

      console.log('Submitting post...');
      const response = await axios.post('http://localhost:3000/community/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Post created successfully:', response.data);
      
      // Display comprehensive information about the created post
      if (response.data && response.data._id) {
        console.log('Post ID:', response.data._id);
        console.log('Post image path:', response.data.image);
        
        // Force a page refresh when navigating to ensure latest data
        localStorage.setItem('forceRefresh', 'true');
        
        // Force a longer delay to ensure the server processes the post
        setTimeout(() => {
          navigate('/community');
        }, 1000);
      } else {
        console.error('No post ID returned from server');
        navigate('/community');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup function
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Title (Optional)
            </label>
            <input
              id="title"
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter post title"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="6"
              placeholder="Write your post content here..."
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
              Image (optional)
            </label>
            <input
              id="image"
              type="file"
              onChange={handleImageChange}
              className="w-full"
              accept="image/*"
            />
            
            {previewImage && (
              <div className="mt-3 border rounded-lg p-2">
                <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="max-h-64 mx-auto"
                  style={{ maxWidth: '100%' }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate('/community')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost; 