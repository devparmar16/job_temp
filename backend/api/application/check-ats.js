import { dbConnection } from '../../database/dbConnection.js';
import { Application } from '../../models/applicationSchema.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnection();
  if (req.method !== 'POST') {
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
  // File upload handling may need to be adapted for Vercel
  // Placeholder response:
  return res.status(501).json({ success: false, message: 'ATS check not implemented for Vercel serverless.' });
} 