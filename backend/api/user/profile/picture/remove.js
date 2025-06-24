import { dbConnection } from '../../../../database/dbConnection.js';
import { User } from '../../../../models/userSchema.js';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  await dbConnection();
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
  const { token } = req.cookies || (req.headers.cookie ? { token: req.headers.cookie.split('token=')[1]?.split(';')[0] } : {});
  if (!token) {
    return res.status(401).json({ success: false, message: 'User Not Authorized' });
  }
  const jwt = require('jsonwebtoken');
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return res.status(500).json({ success: false, message: 'Supabase is not configured. Missing URL or Key.' });
  }
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const bucketName = 'resume';
  if (user.profilePicture && user.profilePicture.fileName) {
    const { error: deleteError } = await supabase.storage.from(bucketName).remove([user.profilePicture.fileName]);
    if (deleteError) {
      return res.status(500).json({ success: false, message: `Could not remove old picture: ${deleteError.message}` });
    }
  }
  user.profilePicture = { url: '', fileName: '' };
  await user.save();
  return res.status(200).json({ success: true, message: 'Profile picture removed', user });
} 