import { dbConnection } from '../../database/dbConnection.js';
import jwt from 'jsonwebtoken';
import { askAI } from '../../utils/aiHelper.js';

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
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }
  try {
    const reply = await askAI(message);
    return res.status(200).json({ success: true, reply });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
} 