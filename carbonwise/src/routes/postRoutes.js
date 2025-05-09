import express from 'express';
import multer from 'multer';
// In postRoutes.js
//import { getGoGreenPosts } from '../controllers/postController.js'; 
 // Ensure this path is correct
 // src/routes/postRoutes.js
 
import { getGoGreenPosts, createMeetup, joinMeetup, followUser, unfollowUser,
   fetchEnvironmentalNews, fetchEnvironmentalSchemes, deleteMeetup,getUserFollowStats, getLikedPosts } from '../controllers/postController.js';


import authMiddleware from '../middleware/authMiddleware.js';
import {
  getAllPosts, getPostsByUser, getPostById,
  createPost, updatePost, deletePost,
  likePost, addComment,getAllMeetups,searchUsers
} from '../controllers/postController.js';
import {
  getUserProfile
 } from '../controllers/userController.js'


const router = express.Router();
import upload from '../middleware/uploadMiddleware.js'


router.get('/search/users', authMiddleware, searchUsers);  // Search for users


router.get('/news', authMiddleware,fetchEnvironmentalNews);
router.get('/environmental-schemes', authMiddleware, fetchEnvironmentalSchemes);
router.get('/go-green', getGoGreenPosts);
router.post('/meetup', authMiddleware, createMeetup);
router.get('/meetups', authMiddleware, getAllMeetups); 
router.get('/',              getAllPosts);
router.get('/user/:userId',  getPostsByUser);
router.get('/:postId',       getPostById);
router.post('/upload',
  authMiddleware,
  upload.single('image'),
  createPost
);
router.put('/:postId',    authMiddleware, updatePost);
router.delete('/:postId', authMiddleware, deletePost);
router.post('/:postId/like',    authMiddleware, likePost);
router.post('/:postId/comment', authMiddleware, addComment);

// New route for liked posts
router.get('/user/likes', authMiddleware, getLikedPosts);

router.post('/meetup', authMiddleware, createMeetup);
router.get('/meetups', authMiddleware, getAllMeetups); // or remove authMiddleware if not needed
router.post('/meetups/:meetupId/join', authMiddleware, joinMeetup);
router.delete('/meetups/:meetupId', authMiddleware, deleteMeetup);
router.get('/search/users', authMiddleware, searchUsers);
router.post('/follow/:userId', authMiddleware,followUser);
router.delete('/unfollow/:userId', authMiddleware,unfollowUser);
router.get('/user/:userId/followstats', getUserFollowStats);

router.get('/profile/:userId', authMiddleware, getUserProfile);


export default router;
