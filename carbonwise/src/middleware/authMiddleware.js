import { verifyToken } from '../services/jwtService.js';

export default function authMiddleware(req, res, next) {
  const h = req.header('Authorization');
  if (!h?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }
  try {
    const payload = verifyToken(h.substring(7));
    req.user = { id: payload.sub, email: payload.email, role: payload.role, userId: payload.userId };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
  console.log("Authorization header:", req.headers['authorization']);

}
