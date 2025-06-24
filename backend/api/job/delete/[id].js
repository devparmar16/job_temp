import { dbConnection } from '../../../database/dbConnection.js';
import { Job } from '../../../models/jobSchema.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnection();
  if (req.method !== 'DELETE') {
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
  const { id } = req.query;
  try {
    const job = await Job.findOneAndDelete({ _id: id, postedBy: decoded.id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or not authorized' });
    }
    return res.status(200).json({ success: true, message: 'Job deleted successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
} 