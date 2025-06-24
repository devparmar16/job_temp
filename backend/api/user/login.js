import { dbConnection } from '../../database/dbConnection.js';
import { User } from '../../models/userSchema.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnection();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Please provide email, password and role.' });
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid Email Or Password.' });
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return res.status(400).json({ success: false, message: 'Invalid Email Or Password.' });
  }
  if (user.role !== role) {
    return res.status(404).json({ success: false, message: 'User with provided email and role not found!' });
  }
  const token = user.getJWTToken();
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; SameSite=None; Secure`);
  return res.status(200).json({ success: true, user, message: 'User Logged In!', token });
} 