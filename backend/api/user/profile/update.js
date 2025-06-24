import { dbConnection } from '../../../database/dbConnection.js';
import { User } from '../../../models/userSchema.js';

export default async function handler(req, res) {
  await dbConnection();
  if (req.method !== 'PUT') {
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
  const { role, password, ...updateData } = req.body;
  const user = await User.findByIdAndUpdate(decoded.id, updateData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  return res.status(200).json({ success: true, message: 'Profile Updated!', user });
} 