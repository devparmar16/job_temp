import { dbConnection } from '../../database/dbConnection.js';
import { User } from '../../models/userSchema.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnection();
  try {
    // Get token from cookies
    const token = req.cookies?.token || (req.headers.cookie ? req.headers.cookie.split('token=')[1]?.split(';')[0] : null);
    if (!token) {
      return res.status(401).json({ success: false, message: 'User Not Authorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ success: false, message: error.message });
  }
} 