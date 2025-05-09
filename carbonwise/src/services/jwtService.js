import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SECRET     = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export function generateToken(user) {
  const payload = { sub: user._id.toString(), email: user.email, role: user.role, userId: user._id };
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

export function getExpirationTime() {
  return EXPIRES_IN;
}
