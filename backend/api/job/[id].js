import { dbConnection } from '../../database/dbConnection.js';
import { Job } from '../../models/jobSchema.js';

export default async function handler(req, res) {
  await dbConnection();
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
  const { id } = req.query;
  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
} 