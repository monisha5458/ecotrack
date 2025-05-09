import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getAllUsers,
  getAuthenticatedUser,
  updateUser,
  getUserById
} from '../controllers/userController.js';

const router = express.Router();


router.use(authMiddleware);
router.get('/user',  getAuthenticatedUser);
router.get('/',      getAllUsers);
router.put('/:id',   updateUser);
router.get('/:id',   getUserById);
export default router;
