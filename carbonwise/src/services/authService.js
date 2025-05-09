import bcrypt from 'bcrypt';
import User from '../models/User.js';

export async function signup({ name, email, password, city }) {
  if (await User.findOne({ email })) {
    const e = new Error('Email already registered'); e.status = 409; throw e;
  }
  const hashed = await bcrypt.hash(password, 10);
  return User.create({ name, email, password: hashed, city });
}
export async function authenticate({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) { const e = new Error('Invalid credentials'); e.status = 401; throw e; }
  if (!(await bcrypt.compare(password, user.password))) {
    const e = new Error('Invalid credentials'); e.status = 401; throw e;
  }
  return user;
}
