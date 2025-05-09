import Post from '../models/Post.js';
import Meetup from '../models/Meetup.js';
import Follow from '../models/Follow.js';
import User from '../models/User.js'; 



import { fetchUserById } from '../services/userService.js';

export async function getAllPosts(req, res, next) {
  try { res.json(await Post.find()); }
  catch (e) { next(e); }
}

export async function getPostsByUser(req, res, next) {
  try { res.json(await Post.find({ userId: req.params.userId })); }
  catch (e) { next(e); }
}

export async function getPostById(req, res, next) {
  try {
    const p = await Post.findById(req.params.postId);
    if (!p) return res.status(404).end();
    res.json(p);
  } catch (e) { next(e); }
}

export async function createPost(req, res, next) {
  try {
    // Ensure the user creating the post is the authenticated user
    if (req.user.id !== req.body.userId) {
      return res.status(403).json({ message: 'You are not authorized to create posts for this user.' });
    }

    // Fetch user to confirm existence
    const u = await fetchUserById(req.body.userId, req.headers.authorization);
    
    console.log('Received file:', req.file);

    // Create a new post
    const p = new Post({
      userId: u._id,
      userName: u.name,
      postTitle: req.body.postTitle || '',
      postCaption: req.body.postCaption,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      likedBy: [] // Initialize empty array
    });

    // Save the post and send response
    const savedPost = await p.save();
    console.log('Created post:', savedPost);
    res.json(savedPost);
  } catch (e) {
    console.error('Error creating post:', e);
    next(e);
  }
}


export async function updatePost(req, res, next) {
  try {
    const p = await Post.findByIdAndUpdate(req.params.postId, {
      postTitle:   req.body.postTitle,
      postCaption: req.body.postCaption,
      imageUrl:    req.body.imageUrl
    }, { new: true });
    res.json(p);
  } catch (e) { next(e); }
}

export async function deletePost(req, res, next) {
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(204).end();
  } catch (e) { next(e); }
}

export async function likePost(req, res, next) {
  try {
    // Get the user ID from the request
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find the post
    const p = await Post.findById(req.params.postId);
    if (!p) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked this post
    if (p.likedBy && p.likedBy.includes(userId)) {
      return res.status(400).json({ message: 'You already liked this post' });
    }

    // Initialize likedBy array if it doesn't exist
    if (!p.likedBy) {
      p.likedBy = [];
    }

    // Add user to likedBy array and increment likes count
    p.likedBy.push(userId);
    p.likes = p.likedBy.length;

    // Save the updated post
    await p.save();

    // Return the updated post
    res.json({ 
      likes: p.likes,
      likedBy: p.likedBy 
    });
  } catch (e) { 
    next(e); 
  }
}

export async function addComment(req, res, next) {
  try {
    const p = await Post.findById(req.params.postId);
    p.comments.push(req.body.comment);
    res.json(await p.save());
  } catch (e) { next(e); }
}
// In your postController.js
// In your postController.js
export async function getGoGreenPosts(req, res, next) {
  try {
    // Fetch posts related to "Go Green" or environment using regex search for the postTitle
    const posts = await Post.find({
      postTitle: { $regex: 'Go Green', $options: 'i' }  // Case-insensitive search
    });

    // Return the posts as JSON response
    if (posts.length > 0) {
      res.json(posts);
    } else {
      res.status(404).json({ message: 'No Go Green posts found' });
    }
  } catch (e) {
    next(e);  // Pass errors to the error handler
  }
}

// export async function createMeetup(req, res, next) {
//   try {
//     const { theme, location, date, isOnline, link } = req.body;
//     const meetup = new Meetup({
//       theme,
//       location,
//       date,
//       isOnline,
//       link,
//       createdBy: req.user.id, // <-- req.user.id should now be defined
//     });

//     if (req.file) {
//       meetup.posterUrl = `/uploads/${req.file.filename}`;
//     }

//     await meetup.save();
//     res.json(meetup);
//   } catch (e) {
//     next(e);
//   }
// }

export async function createMeetup(req, res, next) {
  try {
    const { theme, location, date, isOnline, link } = req.body;

    const meetupData = {
      theme,
      location,
      date,
      isOnline: isOnline || false,
      createdBy: req.user.id,
    };

    // Only include link if meetup is online
    if (isOnline && link) {
      meetupData.link = link;
      meetupData.linkCreatedAt = new Date(); // Add a timestamp
    }

    if (req.file) {
      meetupData.posterUrl = `/uploads/${req.file.filename}`;
    }

    const meetup = new Meetup(meetupData);
    await meetup.save();
    res.json(meetup);
  } catch (e) {
    next(e);
  }
}

export const getAllMeetups = async (req, res) => {
  try {
    const meetups = await Meetup.find(); // assuming you have a Meetup model
    res.status(200).json(meetups);
  } catch (err) {
    console.error('Error fetching meetups:', err);
    res.status(500).json({ message: 'Server error while fetching meetups' });
  }
};


export async function joinMeetup(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: 'User ID is missing from request.' });
    }

    const meetup = await Meetup.findById(req.params.meetupId);
    if (!meetup) {
      return res.status(404).json({ message: 'Meetup not found' });
    }

    // If online, check if link is expired (10 minutes after creation)
    if (meetup.isOnline && meetup.linkCreatedAt) {
      const tenMinutes = 10 * 60 * 1000;
      const now = new Date();
      if (now - meetup.linkCreatedAt > tenMinutes) {
        meetup.link = null;
        meetup.linkCreatedAt = null;
        await meetup.save(); // update DB to remove expired link
        return res.status(410).json({ message: 'Meetup link has expired' });
      }
    }

    // Add user to attendees
    if (!meetup.attendees.includes(req.user.id)) {
      meetup.attendees.push(req.user.id);
      await meetup.save();
    }

    res.json(meetup);
  } catch (e) {
    next(e);
  }
}


// export async function joinMeetup(req, res, next) {
//   try {
//     // Check if req.user is defined
//     if (!req.user || !req.user.id) {
//       return res.status(400).json({ message: 'User ID is missing from request.' });
//     }

//     const meetup = await Meetup.findById(req.params.meetupId);
//     if (!meetup) {
//       return res.status(404).json({ message: 'Meetup not found' });
//     }

//     // Add user to the attendees list
//     meetup.attendees.push(req.user.id);
//     await meetup.save();

//     res.json(meetup);
//   } catch (e) {
//     next(e);
//   }
// }

export async function deleteMeetup(req, res, next) {
  try {
    const meetup = await Meetup.findById(req.params.meetupId);

    if (!meetup) return res.status(404).json({ message: 'Meetup not found' });

    // Only the creator can delete
    if (meetup.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this meetup' });
    }

    await meetup.deleteOne();
    res.status(200).end();
  } catch (e) {
    next(e);
  }
}
// Search for users by name
export async function searchUsers(req, res, next) {
  try {
    const keyword = req.query.q;
    if (!keyword) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Search Users by name (case-insensitive regex)
    const users = await User.find({
      name: { $regex: keyword, $options: 'i' }
    }).select('name email _id');

    // Find all users the current user is following
    let followingIds = [];
    if (req.user && req.user.id) {
      const following = await Follow.find({ follower: req.user.id }).select('following');
      followingIds = following.map(f => f.following.toString());
    }

    // Attach isFollowing to each user
    const usersWithFollow = users.map(u => ({
      ...u.toObject(),
      isFollowing: followingIds.includes(u._id.toString())
    }));

    res.json(usersWithFollow);
  } catch (e) {
    next(e);
  }
}



export async function followUser(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: 'User ID is missing from request.' });
    }

    // Prevent following self
    if (req.user.id === req.params.userId) {
      return res.status(400).json({ message: 'You cannot follow yourself.' });
    }

    // Check if already following
    const alreadyFollowing = await Follow.findOne({
      follower: req.user.id,
      following: req.params.userId,
    });
    if (alreadyFollowing) {
      return res.status(400).json({ message: 'Already following this user.' });
    }

    const follow = new Follow({
      follower: req.user.id,
      following: req.params.userId,
    });

    await follow.save();
    res.json({ message: 'Followed successfully' });
  } catch (e) {
    next(e);
  }
}

export async function unfollowUser(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    await Follow.findOneAndDelete({ follower: req.user.id, following: req.params.userId });
    res.json({ message: 'Unfollowed successfully' });
  } catch (e) {
    next(e);
  }
}

export async function fetchEnvironmentalNews(req, res, next) {
  try {
    const response = await fetch(
      'https://gnews.io/api/v4/search?q=environment&lang=en&country=us&max=10&apikey=cea240dfc94cba3ea63c427df3775f23'
    );

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Failed to fetch news' });
    }

    const newsData = await response.json();
    res.json(newsData);
  } catch (e) {
    next(e);
  }
}
// Add this function
export async function getUserFollowStats(req, res, next) {
  try {
    const userId = req.params.userId;
    const followersCount = await Follow.countDocuments({ following: userId });
    const followingCount = await Follow.countDocuments({ follower: userId });
    res.json({ followers: followersCount, following: followingCount });
  } catch (e) {
    next(e);
  }
}

export async function fetchEnvironmentalSchemes(req, res, next) {
  try {
    const schemes = await fetch('http://naeb.nic.in/'); // Replace with actual API
    const schemeData = await schemes.json();
    res.json(schemeData);
  } catch (e) {
    next(e);
  }
}

// Add a new function to get posts liked by a user
export async function getLikedPosts(req, res, next) {
  try {
    const userId = req.user.id;
    
    // Find all posts where the user ID is in the likedBy array
    const likedPosts = await Post.find({ likedBy: userId });
    
    // Return just the post IDs
    res.json(likedPosts.map(post => ({ postId: post._id })));
  } catch (e) {
    next(e);
  }
}



