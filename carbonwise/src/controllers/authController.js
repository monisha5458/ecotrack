import * as authService from '../services/authService.js';
import * as jwtService  from '../services/jwtService.js';

export async function signup(req, res, next) {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const user = await authService.authenticate(req.body);
    console.log(user);
    const token = jwtService.generateToken(user);
    res.json({ token, expiresIn: jwtService.getExpirationTime() });
  } catch (e) {
    next(e);
  }
}
