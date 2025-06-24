import { dbConnection } from '../../database/dbConnection.js';
import { Job } from '../../models/jobSchema.js';

export default async function handler(req, res) {
  await dbConnection();
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
  try {
    const jobs = await Job.find();
    return res.status(200).json({ success: true, jobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
} 