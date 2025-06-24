import { dbConnection } from '../../database/dbConnection.js';
import { Application } from '../../models/applicationSchema.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnection();
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
  const token = req.cookies?.token || (req.headers.cookie ? req.headers.cookie.split('token=')[1]?.split(';')[0] : null);
  if (!token) {
    return res.status(401).json({ success: false, message: 'User Not Authorized' });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  try {
    const applications = await Application.find({ user: decoded.id });
    return res.status(200).json({ success: true, applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
} 