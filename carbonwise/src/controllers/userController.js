import User from '../models/User.js';

export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (e) { next(e); }
}

export async function getAuthenticatedUser(req, res, next) {
  try {
    const u = await User.findById(req.user.id).select('-password');
    res.json(u);
  } catch (e) { next(e); }
}

export async function updateUser(req, res, next) {
  try {
    delete req.body.password;
    const u = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!u) return res.status(404).end();
    res.json(u);
  } catch (e) { next(e); }
}

export async function getUserById(req, res, next) {
  try {
    console.log("checking")
    const u = await User.findById(req.params.id).select('-password');
    if (!u) return res.status(404).end();
    res.json(u);
  } catch (e) { next(e); }
}
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Check if the user exists
    const user = await User.findById(userId).select('name email'); // Only return name and email

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (e) {
    next(e);
  }
};